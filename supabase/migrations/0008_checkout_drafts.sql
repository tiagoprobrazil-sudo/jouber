-- Holds the order details (cart lines, shipping address/amount, email) for
-- a checkout attempt, keyed by the Stripe PaymentIntent id, from the
-- moment the PaymentIntent is created until the order is finalized.
--
-- Why: both the client (right after stripe.confirmPayment succeeds) and
-- the stripe-webhook function (on payment_intent.succeeded, the reliable
-- path if the client never gets to call back) need the full order details
-- to write orders/order_items — but only the client actually has them at
-- checkout time. Storing them here means create-payment-intent is the only
-- place that needs the full draft; both finalization paths just need the
-- PaymentIntent id.
--
-- Only ever read/written by Edge Functions via the service role client,
-- so RLS is enabled with no policies (default deny) rather than exposed
-- through PostgREST to any client role.
create table checkout_drafts (
  payment_intent_id text primary key,
  email text not null,
  subtotal numeric(10, 2) not null,
  shipping_amount numeric(10, 2) not null,
  shipping_address jsonb,
  items jsonb not null,
  created_at timestamptz not null default now()
);

alter table checkout_drafts enable row level security;
