-- Links an order back to the Stripe PaymentIntent that paid for it, and
-- makes create-order (supabase/functions/create-order) idempotent against
-- retried client calls for the same payment.

alter table orders add column payment_intent_id text unique;
