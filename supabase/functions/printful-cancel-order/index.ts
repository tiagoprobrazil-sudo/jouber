// Supabase Edge Function: printful-cancel-order
//
// Admin-only (same session/profiles.role check as printful-resend — this
// can affect a real print job, not just read data). Cancels an order's
// Printful submission via DELETE /orders/{id}. Printful only allows this
// while the order is still draft/pending (before it enters production) —
// a later-stage order will come back as a Printful API error, surfaced to
// the admin rather than silently failing.
//
// Deploy with: supabase functions deploy printful-cancel-order
//
// Request body:  { orderId: string }  (Jouber's order id)
// Response:      { ok: true } | { error: string }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getPrintfulConfig, printfulFetch } from "../_shared/printful.ts";

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

  const printful = getPrintfulConfig();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!printful || !supabaseUrl || !anonKey || !serviceRoleKey) return jsonResponse({ error: "Not configured" }, 501);

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

  const { data: order } = await admin.from("orders").select("id, printful_order_id").eq("id", body.orderId).maybeSingle();
  if (!order) return jsonResponse({ error: "Order not found" }, 404);
  if (!order.printful_order_id) return jsonResponse({ error: "This order was never sent to Printful." }, 400);

  const cancelRes = await printfulFetch(printful, `/orders/${order.printful_order_id}`, { method: "DELETE" });
  if (!cancelRes.ok) {
    const detail = await cancelRes.text();
    // The common real-world case: it's already too far along (in
    // production/shipped) for Printful to accept a cancellation.
    return jsonResponse({ error: "Printful could not cancel this order — it may already be in production or shipped.", detail }, 502);
  }

  await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);

  return jsonResponse({ ok: true });
});
