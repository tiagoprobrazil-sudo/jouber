// Supabase Edge Function: create-payment-intent
//
// Creates a Stripe PaymentIntent server-side so the secret key never
// reaches the browser, and stores the order details (checkout_drafts) that
// either create-order (client fast path) or stripe-webhook (the reliable
// path) will need to actually write the order once payment succeeds.
//
// Required secret (already set via `supabase secrets set`):
//   STRIPE_SECRET_KEY   sk_test_... or sk_live_...
//
// Deploy with: supabase functions deploy create-payment-intent
//
// Request body:
//   {
//     amountCents: number, currency: string, receiptEmail?: string,
//     email: string, subtotal: number, shippingAmount: number,
//     shippingAddress: object, items: OrderItemInput[]
//   }
// Response: { clientSecret: string, paymentIntentId: string }

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
    return jsonResponse({ error: "Payments are not configured yet." }, 501);
  }

  let body: {
    amountCents?: number;
    currency?: string;
    receiptEmail?: string;
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

  const { amountCents, currency, receiptEmail, email, subtotal, shippingAmount, shippingAddress, items } = body;
  if (!amountCents || amountCents < 50) {
    // Stripe's own minimum charge is ~$0.50 (varies by currency) — reject
    // obviously-invalid amounts before ever calling Stripe.
    return jsonResponse({ error: "amountCents is missing or too small" }, 400);
  }
  if (!currency) return jsonResponse({ error: "currency is required" }, 400);
  if (!email || subtotal == null || shippingAmount == null || !items?.length) {
    return jsonResponse({ error: "Missing order details" }, 400);
  }

  const params = new URLSearchParams({
    amount: String(Math.round(amountCents)),
    currency: currency.toLowerCase(),
    "automatic_payment_methods[enabled]": "true",
    // The client confirms with redirect: "if_required" and has no
    // return_url — restrict to payment methods that never redirect
    // (card, in practice) so confirmation always resolves inline.
    "automatic_payment_methods[allow_redirects]": "never",
  });
  if (receiptEmail) params.set("receipt_email", receiptEmail);

  const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!stripeRes.ok) {
    const detail = await stripeRes.text();
    return jsonResponse({ error: "Stripe request failed", detail }, 502);
  }

  const paymentIntent = await stripeRes.json();

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { error: draftError } = await admin.from("checkout_drafts").insert({
    payment_intent_id: paymentIntent.id,
    email,
    subtotal,
    shipping_amount: shippingAmount,
    shipping_address: shippingAddress ?? null,
    items,
  });
  if (draftError) {
    // Don't leave an orphaned, undraftable PaymentIntent around.
    await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntent.id}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return jsonResponse({ error: "Could not save order details", detail: draftError.message }, 500);
  }

  return jsonResponse({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
});
