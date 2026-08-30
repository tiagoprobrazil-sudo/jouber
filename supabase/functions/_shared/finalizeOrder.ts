// Shared by create-order (client-triggered fast path, right after
// stripe.confirmPayment succeeds) and stripe-webhook (the reliable path,
// triggered by Stripe itself on payment_intent.succeeded — the source of
// truth if the client never gets to call back, e.g. the tab closes).
//
// Both paths converge here so an order is written exactly once regardless
// of which one gets there first (payment_intent_id is unique on orders,
// checked below before insert).

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

interface OrderItemInput {
  productSlug: string;
  productTitle: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
}

export type FinalizeResult = { ok: true; orderId: string } | { ok: false; status: number; error: string };

export async function finalizeOrder(
  admin: SupabaseClient,
  stripeApiKey: string,
  paymentIntentId: string,
): Promise<FinalizeResult> {
  // Idempotency: if this PaymentIntent already produced an order (the
  // other path got here first), return it instead of double-booking.
  const { data: existing } = await admin.from("orders").select("id").eq("payment_intent_id", paymentIntentId).maybeSingle();
  if (existing) return { ok: true, orderId: existing.id };

  const { data: draft, error: draftError } = await admin
    .from("checkout_drafts")
    .select("*")
    .eq("payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (draftError || !draft) return { ok: false, status: 404, error: "No checkout draft found for this payment." };

  // Verify the payment actually succeeded, and for the amount we expect,
  // before trusting anything else — never take the caller's word alone.
  const stripeRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
    headers: { Authorization: `Bearer ${stripeApiKey}` },
  });
  if (!stripeRes.ok) return { ok: false, status: 502, error: "Could not verify payment with Stripe" };
  const paymentIntent = await stripeRes.json();
  if (paymentIntent.status !== "succeeded") {
    return { ok: false, status: 402, error: `Payment has not succeeded (status: ${paymentIntent.status})` };
  }
  const expectedCents = Math.round((Number(draft.subtotal) + Number(draft.shipping_amount)) * 100);
  if (paymentIntent.amount !== expectedCents) {
    return { ok: false, status: 402, error: "Payment amount does not match order total" };
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_email: draft.email,
      status: "pending",
      subtotal: Number(draft.subtotal) + Number(draft.shipping_amount),
      shipping_address: draft.shipping_address,
      payment_intent_id: paymentIntentId,
    })
    .select("id")
    .single();
  if (orderError) return { ok: false, status: 500, error: `Could not create order: ${orderError.message}` };

  const items = draft.items as OrderItemInput[];
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
  if (itemsError) return { ok: false, status: 500, error: `Order created but items failed: ${itemsError.message}` };

  // Best-effort stock decrement (read-modify-write, not perfectly
  // race-safe under very high concurrency, but adequate for a small
  // atelier's order volume).
  for (const item of items) {
    const product = bySlug.get(item.productSlug);
    if (!product) continue;
    const nextStock = Math.max(0, product.stock - item.quantity);
    await admin.from("products").update({ stock: nextStock }).eq("id", product.id);
  }

  await admin.from("checkout_drafts").delete().eq("payment_intent_id", paymentIntentId);

  return { ok: true, orderId: order.id };
}
