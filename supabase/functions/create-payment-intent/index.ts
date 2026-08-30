// Supabase Edge Function: create-payment-intent
//
// Creates a Stripe PaymentIntent server-side so the secret key never
// reaches the browser. The client (src/pages/Checkout.tsx) calls this once
// the cart + shipping rate are known, then mounts Stripe Elements with the
// returned client secret.
//
// Required secret (already set this session via `supabase secrets set`):
//   STRIPE_SECRET_KEY   sk_test_... or sk_live_...
//
// Deploy with: supabase functions deploy create-payment-intent
//
// Request body:  { amountCents: number, currency: string, receiptEmail?: string }
// Response:      { clientSecret: string, paymentIntentId: string }

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
  if (!apiKey) {
    return jsonResponse({ error: "Payments are not configured yet (missing STRIPE_SECRET_KEY secret)." }, 501);
  }

  let body: { amountCents?: number; currency?: string; receiptEmail?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { amountCents, currency, receiptEmail } = body;
  if (!amountCents || amountCents < 50) {
    // Stripe's own minimum charge is ~$0.50 (varies by currency) — reject
    // obviously-invalid amounts before ever calling Stripe.
    return jsonResponse({ error: "amountCents is missing or too small" }, 400);
  }
  if (!currency) {
    return jsonResponse({ error: "currency is required" }, 400);
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
  return jsonResponse({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
});
