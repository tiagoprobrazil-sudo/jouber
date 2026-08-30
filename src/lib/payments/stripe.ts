import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ShippingAddress } from "@/lib/shipping/types";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

/** Whether checkout can actually collect payment — needs both a Stripe publishable key and a real Supabase project (the Edge Functions live there). */
export const isStripeConfigured = Boolean(publishableKey) && isSupabaseConfigured;

let stripePromise: Promise<Stripe | null> | null = null;
/** Lazily loads Stripe.js once and reuses the same promise on every call. */
export function getStripe(): Promise<Stripe | null> {
  if (!publishableKey) return Promise.resolve(null);
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

export interface OrderItemInput {
  productSlug: string;
  productTitle: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
}

interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export interface CreatePaymentIntentInput {
  amountCents: number;
  currency: string;
  email: string;
  subtotal: number;
  shippingAmount: number;
  shippingAddress: ShippingAddress;
  items: OrderItemInput[];
}

/**
 * Calls create-payment-intent (supabase/functions/create-payment-intent),
 * which holds STRIPE_SECRET_KEY server-side and — in the same call — saves
 * the order details (checkout_drafts table) that either create-order or
 * the stripe-webhook function will use to actually write the order once
 * payment succeeds.
 */
export async function createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
  const { data, error } = await supabase!.functions.invoke<PaymentIntentResult>("create-payment-intent", {
    body: { ...input, receiptEmail: input.email },
  });
  if (error || !data) throw error ?? new Error("Could not start payment.");
  return data;
}

/**
 * Calls create-order (supabase/functions/create-order) right after
 * stripe.confirmPayment succeeds — the fast path for showing an immediate
 * confirmation. It's fine if this never runs (tab closes, etc.): the
 * stripe-webhook function reaches the same order-creation logic
 * independently once Stripe reports the payment succeeded, and whichever
 * gets there first wins (idempotent on the PaymentIntent id).
 */
export async function createOrder(paymentIntentId: string): Promise<string> {
  const { data, error } = await supabase!.functions.invoke<{ orderId: string }>("create-order", {
    body: { paymentIntentId },
  });
  if (error || !data) throw error ?? new Error("Payment succeeded but the order could not be recorded.");
  return data.orderId;
}
