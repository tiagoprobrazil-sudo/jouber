// Supabase Edge Function: printful-orders
//
// Admin-only. Lists every order in the connected Printful store — not
// just ones Jouber itself created — for reconciliation (e.g. spotting an
// order placed directly on printful.com, or confirming nothing is stuck).
// Read-only, but still admin-gated: it's real customer PII (names,
// addresses) and business data, same rule as printful-resend/cancel-order.
//
// Deploy with: supabase functions deploy printful-orders
//
// Response: { orders: [{ id, status, totalCents, createdAt, customerName, itemCount, trackingUrl }] }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getPrintfulConfig, printfulFetch, type PrintfulEnvelope } from "../_shared/printful.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

interface PrintfulOrderListItem {
  id: number;
  status: string;
  created: number; // unix seconds
  recipient?: { name?: string };
  costs?: { total?: string };
  items?: unknown[];
  shipments?: { tracking_url?: string }[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "GET") return jsonResponse({ error: "Method not allowed" }, 405);

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

  const orders: PrintfulOrderListItem[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const res = await printfulFetch(printful, `/orders?offset=${offset}&limit=${limit}`);
    if (!res.ok) return jsonResponse({ error: "Could not list Printful orders", detail: await res.text() }, 502);
    const body = (await res.json()) as PrintfulEnvelope<PrintfulOrderListItem[]>;
    orders.push(...body.result);
    const total = body.paging?.total ?? orders.length;
    offset += limit;
    if (offset >= total || offset >= 500) break; // hard cap: reconciliation view, not a full export
  }

  return jsonResponse({
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      totalCents: o.costs?.total ? Math.round(Number(o.costs.total) * 100) : 0,
      createdAt: new Date(o.created * 1000).toISOString(),
      customerName: o.recipient?.name ?? null,
      itemCount: o.items?.length ?? 0,
      trackingUrl: o.shipments?.[0]?.tracking_url ?? null,
    })),
  });
});
