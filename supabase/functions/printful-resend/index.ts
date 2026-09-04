// Supabase Edge Function: printful-resend
//
// Admin-only. Manually (re)submits an order's Printful-linked items — for
// when the automatic submission in finalizeOrder failed silently
// (best-effort by design, since a Printful failure must never fail the
// underlying paid order) and nobody noticed until reviewing /admin/orders.
//
// Unlike every other function in this project, this one is NOT meant to
// be callable by an anonymous checkout session — it can create a real,
// billable print order. Requires a logged-in admin's Supabase session
// (checked against profiles.role, same rule the database's own RLS
// policies use for admin-only writes).
//
// Deploy with: supabase functions deploy printful-resend
//
// Request body:  { orderId: string }
// Response:      { printfulOrderId: number } | { error: string }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getPrintfulConfig, printfulFetch, type PrintfulEnvelope, type PrintfulOrder } from "../_shared/printful.ts";

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

  // Verify the caller is a logged-in admin — this endpoint can create a
  // real, billable print order, unlike the checkout functions.
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

  const { data: order } = await admin
    .from("orders")
    .select("id, customer_email, shipping_address, printful_order_id")
    .eq("id", body.orderId)
    .maybeSingle();
  if (!order) return jsonResponse({ error: "Order not found" }, 404);
  if (order.printful_order_id) return jsonResponse({ printfulOrderId: order.printful_order_id });

  const { data: items } = await admin
    .from("order_items")
    .select("product_id, variant, quantity")
    .eq("order_id", order.id);
  if (!items?.length) return jsonResponse({ error: "This order has no items" }, 400);

  const productIds = [...new Set(items.map((i) => i.product_id).filter(Boolean))] as string[];
  const { data: products } = await admin
    .from("products")
    .select("id, printful_product_id, printful_variant_id, product_variants(name, printful_variant_id)")
    .in("id", productIds);
  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  const lineItems = items.flatMap((item) => {
    const product = item.product_id ? byId.get(item.product_id) : undefined;
    if (!product?.printful_product_id) return [];
    const variantId = item.variant
      ? product.product_variants.find((v: { name: string; printful_variant_id: number | null }) => v.name === item.variant)
          ?.printful_variant_id
      : product.printful_variant_id;
    if (!variantId) return [];
    return [{ sync_variant_id: variantId, quantity: item.quantity }];
  });
  if (lineItems.length === 0) return jsonResponse({ error: "No items in this order are linked to Printful." }, 400);

  const address = (order.shipping_address ?? {}) as {
    name?: string;
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
  };

  const createRes = await printfulFetch(printful, "/orders", {
    method: "POST",
    body: JSON.stringify({
      external_id: order.id,
      recipient: {
        name: address.name || "Customer",
        address1: address.street1 ?? "",
        address2: address.street2 ?? "",
        city: address.city ?? "",
        state_code: address.state ?? "",
        country_code: address.country ?? "",
        zip: address.zip ?? "",
        phone: address.phone || "",
        email: order.customer_email,
      },
      items: lineItems,
    }),
  });
  if (!createRes.ok) {
    return jsonResponse({ error: "Printful order creation failed", detail: await createRes.text() }, 502);
  }
  const created = ((await createRes.json()) as PrintfulEnvelope<PrintfulOrder>).result;

  const confirmRes = await printfulFetch(printful, `/orders/${created.id}/confirm`, { method: "POST" });
  if (!confirmRes.ok) console.error("Printful order confirm failed:", await confirmRes.text());

  await admin.from("orders").update({ printful_order_id: created.id }).eq("id", order.id);

  return jsonResponse({ printfulOrderId: created.id });
});
