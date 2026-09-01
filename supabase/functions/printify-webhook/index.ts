// Supabase Edge Function: printify-webhook
//
// Printify calls this on order:shipment:created / order:shipment:delivered
// / order:updated / product:updated. Printify does NOT sign its webhook
// payloads (confirmed: creating a webhook returns no secret, unlike
// Stripe) — so this never trusts the payload's contents directly. It only
// uses the payload to learn *which* order/product changed, then re-fetches
// that resource from the Printify API (an authenticated, trustworthy call)
// before writing anything. A forged request can at worst point at a real
// Printify id it doesn't otherwise know anything useful about — this
// endpoint still only ever re-reads the truth from Printify itself.
//
// Order events: only ever touch an order Jouber already submitted —
// never create one from webhook data alone.
// product:updated: only ever re-syncs a product Jouber already imported
// (see _shared/printifySync.ts, createIfMissing: false) — never
// auto-creates a new draft product from a background event; an admin
// imports new products explicitly via /admin/printify.
//
// Must be deployed with JWT verification OFF (Printify sends no Supabase
// auth token) — see the --no-verify-jwt deploy flag.
//
// Deploy with: supabase functions deploy printify-webhook --no-verify-jwt

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getPrintifyConfig, printifyFetch, type PrintifyOrder } from "../_shared/printify.ts";
import { syncPrintifyProduct } from "../_shared/printifySync.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const config = getPrintifyConfig();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!config || !supabaseUrl || !serviceRoleKey) return new Response("Not configured", { status: 501 });

  let event: { type?: string; resource?: { id?: string } };
  try {
    event = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const resourceId = event.resource?.id;
  if (!resourceId) return new Response(JSON.stringify({ received: true }), { status: 200 });

  const admin = createClient(supabaseUrl, serviceRoleKey);

  if (event.type === "product:updated") {
    const result = await syncPrintifyProduct(admin, config, resourceId, { createIfMissing: false });
    if (!result.ok) console.error("product:updated sync skipped/failed for", resourceId, result.error);
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Order events (order:updated, order:shipment:created/delivered).
  const { data: order } = await admin.from("orders").select("id").eq("printify_order_id", resourceId).maybeSingle();
  if (!order) return new Response(JSON.stringify({ received: true }), { status: 200 });

  const orderRes = await printifyFetch(config, `/shops/${config.shopId}/orders/${resourceId}.json`);
  if (!orderRes.ok) {
    console.error("Could not re-fetch Printify order", resourceId, await orderRes.text());
    return new Response("Could not verify order with Printify", { status: 502 });
  }
  const printifyOrder = (await orderRes.json()) as PrintifyOrder;
  const shipment = printifyOrder.shipments?.[0];

  const update: Record<string, unknown> = {};
  if (shipment) {
    update.tracking_number = shipment.number;
    update.tracking_url = shipment.url;
    update.carrier = shipment.carrier;
    update.status = shipment.delivered_at ? "fulfilled" : "processing";
  }

  if (Object.keys(update).length > 0) {
    await admin.from("orders").update(update).eq("id", order.id);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
