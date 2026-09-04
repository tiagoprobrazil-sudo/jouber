// Supabase Edge Function: printful-webhook
//
// Printful calls this on package_shipped / order_updated / order_failed /
// order_canceled / product_updated (exact event names are set up in the
// Printful dashboard's webhook configuration — see /admin/settings for
// connection status). Whether Printful signs its webhook payloads isn't
// something this project has verified yet, so — same defensive rule as
// the Printify integration it replaces — this never trusts the payload's
// contents directly. It only uses the payload to learn *which* order or
// product changed, then re-fetches that resource from the Printful API
// (an authenticated, trustworthy call) before writing anything. A forged
// request can at worst point at a real Printful id it doesn't otherwise
// know anything useful about — this endpoint still only ever re-reads the
// truth from Printful itself.
//
// Order events: only ever touch an order Jouber already submitted — never
// create one from webhook data alone.
// Product events: only ever re-syncs a product Jouber already imported
// (see _shared/printfulSync.ts, createIfMissing: false) — never
// auto-creates a new draft product from a background event; an admin
// imports new products explicitly via /admin/printful.
//
// Must be deployed with JWT verification OFF (Printful sends no Supabase
// auth token) — see the --no-verify-jwt deploy flag.
//
// Deploy with: supabase functions deploy printful-webhook --no-verify-jwt

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getPrintfulConfig, printfulFetch, type PrintfulEnvelope, type PrintfulOrder } from "../_shared/printful.ts";
import { syncPrintfulProduct } from "../_shared/printfulSync.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const config = getPrintfulConfig();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!config || !supabaseUrl || !serviceRoleKey) return new Response("Not configured", { status: 501 });

  let event: { type?: string; data?: { order?: { id?: number }; sync_product?: { id?: number } } };
  try {
    event = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const type = event.type ?? "";

  const productId = event.data?.sync_product?.id;
  if (type.includes("product") && productId) {
    const result = await syncPrintfulProduct(admin, config, productId, { createIfMissing: false });
    if (!result.ok) console.error("product update sync skipped/failed for", productId, result.error);
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Order events (order_updated, package_shipped, order_failed, order_canceled, ...).
  const orderId = event.data?.order?.id;
  if (!orderId) return new Response(JSON.stringify({ received: true }), { status: 200 });

  const { data: order } = await admin.from("orders").select("id").eq("printful_order_id", orderId).maybeSingle();
  if (!order) return new Response(JSON.stringify({ received: true }), { status: 200 });

  const orderRes = await printfulFetch(config, `/orders/${orderId}`);
  if (!orderRes.ok) {
    console.error("Could not re-fetch Printful order", orderId, await orderRes.text());
    return new Response("Could not verify order with Printful", { status: 502 });
  }
  const printfulOrder = ((await orderRes.json()) as PrintfulEnvelope<PrintfulOrder>).result;
  const shipment = printfulOrder.shipments?.[0];

  const update: Record<string, unknown> = {};
  if (shipment) {
    update.tracking_number = shipment.tracking_number;
    update.tracking_url = shipment.tracking_url;
    update.carrier = shipment.carrier;
  }
  if (printfulOrder.status === "fulfilled") update.status = "fulfilled";
  else if (shipment) update.status = "processing";
  else if (printfulOrder.status === "canceled" || printfulOrder.status === "failed") update.status = "cancelled";

  if (Object.keys(update).length > 0) {
    await admin.from("orders").update(update).eq("id", order.id);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
