// Supabase Edge Function: printify-webhook
//
// Printify calls this on order:shipment:created / order:shipment:delivered
// / order:updated. Printify does NOT sign its webhook payloads (confirmed:
// creating a webhook returns no secret, unlike Stripe) — so this never
// trusts the payload's contents directly. It only uses the payload to
// learn *which* Printify order changed, then re-fetches that order from
// the Printify API (an authenticated, trustworthy call) for the real
// status/tracking data before writing anything. A forged request can at
// worst point at a real Printify order id it doesn't otherwise know
// anything useful about — this endpoint still only ever re-reads the
// truth from Printify itself.
//
// Must be deployed with JWT verification OFF (Printify sends no Supabase
// auth token) — see the --no-verify-jwt deploy flag.
//
// Deploy with: supabase functions deploy printify-webhook --no-verify-jwt

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getPrintifyConfig, printifyFetch, type PrintifyOrder } from "../_shared/printify.ts";

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

  const printifyOrderId = event.resource?.id;
  if (!printifyOrderId) return new Response(JSON.stringify({ received: true }), { status: 200 });

  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Only ever touch an order we actually submitted — never create or
  // guess one from webhook data alone.
  const { data: order } = await admin.from("orders").select("id").eq("printify_order_id", printifyOrderId).maybeSingle();
  if (!order) return new Response(JSON.stringify({ received: true }), { status: 200 });

  const orderRes = await printifyFetch(config, `/shops/${config.shopId}/orders/${printifyOrderId}.json`);
  if (!orderRes.ok) {
    console.error("Could not re-fetch Printify order", printifyOrderId, await orderRes.text());
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
