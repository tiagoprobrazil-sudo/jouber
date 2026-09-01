// Supabase Edge Function: printify-cancel-order
//
// Admin-only (same session/profiles.role check as printify-resend — this
// can affect a real print job, not just read data). Cancels an order's
// Printify submission via POST /orders/{id}/cancel.json. Printify only
// allows this before the order enters production/ships — a later-stage
// order will come back as a Printify API error, surfaced to the admin
// rather than silently failing.
//
// Deploy with: supabase functions deploy printify-cancel-order
//
// Request body:  { orderId: string }  (Jouber's order id)
// Response:      { ok: true } | { error: string }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getPrintifyConfig, printifyFetch } from "../_shared/printify.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const printify = getPrintifyConfig();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!printify || !supabaseUrl || !anonKey || !serviceRoleKey) return jsonResponse({ error: "Not configured" }, 501);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Not authenticated" }, 401);
  const asUser = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userError } = await asUser.auth.getUser();
  if (userError || !userData.user) return jsonResponse({ error: "Not authenticated" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: profile } = await admin.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
  if (profile?.role !== "admin") return jsonResponse({ error: "Admin access required" }, 403);

  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  if (!body.orderId) return jsonResponse({ error: "orderId is required" }, 400);

  const { data: order } = await admin.from("orders").select("id, printify_order_id").eq("id", body.orderId).maybeSingle();
  if (!order) return jsonResponse({ error: "Order not found" }, 404);
  if (!order.printify_order_id) return jsonResponse({ error: "This order was never sent to Printify." }, 400);

  const cancelRes = await printifyFetch(printify, `/shops/${printify.shopId}/orders/${order.printify_order_id}/cancel.json`, {
    method: "POST",
  });
  if (!cancelRes.ok) {
    const detail = await cancelRes.text();
    // The common real-world case: it's already too far along (in
    // production/shipped) for Printify to accept a cancellation.
    return jsonResponse({ error: "Printify could not cancel this order — it may already be in production or shipped.", detail }, 502);
  }

  await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);

  return jsonResponse({ ok: true });
});
