// Supabase Edge Function: create-order
//
// Called by the client right after Stripe confirms a payment. Before
// writing anything, it re-fetches the PaymentIntent from Stripe using the
// secret key (never trusting the client's word alone) and checks it
// actually succeeded and for the expected amount, then writes the order
// with the service role client (bypassing RLS, since checkout is
// unauthenticated / guest).
//
// Known limitation (v1, documented rather than solved this session): if
// the browser closes/crashes between Stripe confirming payment and this
// call completing, the charge succeeds in Stripe but no local order row
// is created. Hardening that properly means adding a Stripe webhook
// (payment_intent.succeeded) as the source of truth instead of relying on
// the client to call this — left as a follow-up.
//
// Required env (STRIPE_SECRET_KEY already set as a secret; SUPABASE_URL /
// SUPABASE_SERVICE_ROLE_KEY are injected automatically into every
// function, same as supabase/functions/shipping-rates):
//   STRIPE_SECRET_KEY
//
// Deploy with: supabase functions deploy create-order
//
// Request body:
//   {
//     paymentIntentId: string,
//     email: string,
//     subtotal: number,        // dollars, not cents
//     shippingAmount: number,  // dollars
//     shippingAddress: object,
//     items: [{ productSlug, productTitle, variant?, quantity, unitPrice }]
//   }
// Response: { orderId: string }

import { createClient } from "jsr:@supabase/supabase-js@2";

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

interface OrderItemInput {
  productSlug: string;
  productTitle: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
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

  let body: {
    paymentIntentId?: string;
    email?: string;
    subtotal?: number;
    shippingAmount?: number;
    shippingAddress?: Record<string, unknown>;
    items?: OrderItemInput[];
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { paymentIntentId, email, subtotal, shippingAmount, shippingAddress, items } = body;
  if (!paymentIntentId || !email || subtotal == null || shippingAmount == null || !items?.length) {
    return jsonResponse({ error: "Missing required fields" }, 400);
  }

  // Verify the payment actually succeeded, and for the amount we expect,
  // before trusting anything else in the request.
  const stripeRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!stripeRes.ok) {
    return jsonResponse({ error: "Could not verify payment with Stripe" }, 502);
  }
  const paymentIntent = await stripeRes.json();
  if (paymentIntent.status !== "succeeded") {
    return jsonResponse({ error: `Payment has not succeeded (status: ${paymentIntent.status})` }, 402);
  }
  const expectedCents = Math.round((subtotal + shippingAmount) * 100);
  if (paymentIntent.amount !== expectedCents) {
    return jsonResponse({ error: "Payment amount does not match order total" }, 402);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Idempotency: if this PaymentIntent already produced an order (e.g. a
  // retried client call), return the existing one instead of double-booking.
  const { data: existing } = await admin
    .from("orders")
    .select("id")
    .eq("payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (existing) return jsonResponse({ orderId: existing.id });

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_email: email,
      status: "pending",
      subtotal: subtotal + shippingAmount,
      shipping_address: shippingAddress ?? null,
      payment_intent_id: paymentIntentId,
    })
    .select("id")
    .single();
  if (orderError) return jsonResponse({ error: "Could not create order", detail: orderError.message }, 500);

  // Resolve each line's product id/current stock by slug so order_items can
  // reference it properly and stock can be decremented.
  const slugs = [...new Set(items.map((i) => i.productSlug))];
  const { data: products } = await admin.from("products").select("id, slug, stock").in("slug", slugs);
  const bySlug = new Map((products ?? []).map((p) => [p.slug, p]));

  const { error: itemsError } = await admin.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: bySlug.get(item.productSlug)?.id ?? null,
      product_title: item.productTitle,
      variant: item.variant ?? null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
  );
  if (itemsError) return jsonResponse({ error: "Order created but items failed", detail: itemsError.message }, 500);

  // Best-effort stock decrement (read-modify-write, not perfectly race-safe
  // under very high concurrency, but more than adequate for a small
  // atelier's order volume).
  for (const item of items) {
    const product = bySlug.get(item.productSlug);
    if (!product) continue;
    const nextStock = Math.max(0, product.stock - item.quantity);
    await admin.from("products").update({ stock: nextStock }).eq("id", product.id);
  }

  return jsonResponse({ orderId: order.id });
});
