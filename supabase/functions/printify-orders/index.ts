// Supabase Edge Function: printify-orders
//
// Admin-only. Lists every order in the connected Printify shop — not just
// ones Jouber itself created — for reconciliation (e.g. spotting an order
// placed directly on printify.com, or confirming nothing is stuck).
// Read-only, but still admin-gated: it's real customer PII (names,
// addresses) and business data, same rule as printify-resend/cancel-order.
//
// Deploy with: supabase functions deploy printify-orders
//
// Response: { orders: [{ id, status, totalCents, createdAt, customerName, itemCount, trackingUrl }] }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getPrintifyConfig, printifyFetch } from "../_shared/printify.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

interface PrintifyOrderListItem {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  address_to?: { first_name?: string; last_name?: string };
  line_items?: unknown[];
  shipments?: { url: string }[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "GET") return jsonResponse({ error: "Method not allowed" }, 405);

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

  const orders: PrintifyOrderListItem[] = [];
  let page = 1;
  for (;;) {
    const res = await printifyFetch(printify, `/shops/${printify.shopId}/orders.json?page=${page}&limit=50`);
    if (!res.ok) return jsonResponse({ error: "Could not list Printify orders", detail: await res.text() }, 502);
    const body = await res.json();
    orders.push(...body.data);
    if (page >= body.last_page || page >= 5) break; // hard cap: reconciliation view, not a full export
    page += 1;
  }

  return jsonResponse({
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      totalCents: o.total_price,
      createdAt: o.created_at,
      customerName: [o.address_to?.first_name, o.address_to?.last_name].filter(Boolean).join(" ") || null,
      itemCount: o.line_items?.length ?? 0,
      trackingUrl: o.shipments?.[0]?.url ?? null,
    })),
  });
});
