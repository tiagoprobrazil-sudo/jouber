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

interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

/** Calls the create-payment-intent Edge Function (supabase/functions/create-payment-intent), which holds STRIPE_SECRET_KEY server-side. */
export async function createPaymentIntent(amountCents: number, currency: string, receiptEmail?: string): Promise<PaymentIntentResult> {
  const { data, error } = await supabase!.functions.invoke<PaymentIntentResult>("create-payment-intent", {
    body: { amountCents, currency, receiptEmail },
  });
  if (error || !data) throw error ?? new Error("Could not start payment.");
  return data;
}

export interface OrderItemInput {
  productSlug: string;
  productTitle: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  paymentIntentId: string;
  email: string;
  subtotal: number;
  shippingAmount: number;
  shippingAddress: ShippingAddress;
  items: OrderItemInput[];
}

/** Calls create-order (supabase/functions/create-order), which re-verifies the payment with Stripe before writing the order. */
export async function createOrder(input: CreateOrderInput): Promise<string> {
  const { data, error } = await supabase!.functions.invoke<{ orderId: string }>("create-order", { body: input });
  if (error || !data) throw error ?? new Error("Payment succeeded but the order could not be recorded.");
  return data.orderId;
}
