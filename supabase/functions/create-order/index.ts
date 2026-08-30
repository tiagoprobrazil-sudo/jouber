// Supabase Edge Function: create-order
//
// Client fast path, called right after stripe.confirmPayment succeeds.
// Thin wrapper around finalizeOrder (supabase/functions/_shared) — the
// stripe-webhook function is the reliable path that reaches the same
// logic if this call never happens (e.g. the tab closes first).
//
// Deploy with: supabase functions deploy create-order
//
// Request body:  { paymentIntentId: string }
// Response:      { orderId: string }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { finalizeOrder } from "../_shared/finalizeOrder.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!apiKey || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Server is not fully configured." }, 501);
  }

  let body: { paymentIntentId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  if (!body.paymentIntentId) return jsonResponse({ error: "paymentIntentId is required" }, 400);

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const result = await finalizeOrder(admin, apiKey, body.paymentIntentId);
  if (!result.ok) return jsonResponse({ error: result.error }, result.status);
  return jsonResponse({ orderId: result.orderId });
});
