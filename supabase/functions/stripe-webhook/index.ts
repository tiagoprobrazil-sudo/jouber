// Supabase Edge Function: stripe-webhook
//
// The reliable path for turning a successful payment into an order —
// unlike create-order (called by the client right after confirmPayment,
// which can simply never happen if the tab closes at the wrong moment),
// this is called directly by Stripe once it considers the payment settled,
// so it's the real source of truth. Both converge on the same
// finalizeOrder logic (supabase/functions/_shared/finalizeOrder.ts), which
// is idempotent — whichever gets here first wins, the other is a no-op.
//
// Required secrets:
//   STRIPE_SECRET_KEY       already set
//   STRIPE_WEBHOOK_SECRET   whsec_... — set once the endpoint is
//                            registered with Stripe (this project creates
//                            it via the API directly, see chat history /
//                            ADMIN_DASHBOARD_TASKS.md rather than asking
//                            for a dashboard-generated one)
//
// This function must be deployed with JWT verification OFF (Stripe's
// requests carry a `Stripe-Signature` header, not a Supabase auth token) —
// see supabase/config.toml.
//
// Deploy with: supabase functions deploy stripe-webhook

import Stripe from "npm:stripe@17.7.0";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { finalizeOrder } from "../_shared/finalizeOrder.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const stripeApiKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeApiKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response("Not configured", { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  if (!signature) return new Response("Missing Stripe-Signature header", { status: 400 });

  const stripe = new Stripe(stripeApiKey, { httpClient: Stripe.createFetchHttpClient() });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    return new Response(`Signature verification failed: ${err instanceof Error ? err.message : String(err)}`, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const result = await finalizeOrder(admin, stripeApiKey, paymentIntent.id);
    if (!result.ok) {
      console.error("finalizeOrder failed for", paymentIntent.id, result.error);
      // A permanent failure (no draft, bad amount, etc.) — accept and stop
      // Stripe from retrying, since a retry won't change the outcome. Only
      // 5xx (a transient DB/network issue) is worth Stripe retrying.
      if (result.status >= 500) return new Response(result.error, { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
