// Shared by create-order (client-triggered fast path, right after
// stripe.confirmPayment succeeds) and stripe-webhook (the reliable path,
// triggered by Stripe itself on payment_intent.succeeded — the source of
// truth if the client never gets to call back, e.g. the tab closes).
//
// Both paths converge here so an order is written exactly once regardless
// of which one gets there first (payment_intent_id is unique on orders,
// checked below before insert).

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { getPrintfulConfig, printfulFetch, type PrintfulEnvelope, type PrintfulOrder } from "./printful.ts";

interface OrderItemInput {
  productSlug: string;
  productTitle: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
}

interface ProductForOrder {
  id: string;
  slug: string;
  stock: number;
  printful_product_id: number | null;
  printful_variant_id: number | null;
  product_variants: { name: string; printful_variant_id: number | null }[];
}

/**
 * Submits the Printful-linked items in this order (a product must have
 * `printful_product_id` set — see the admin Printful catalog import) as a
 * single Printful order and confirms it for production. Best-effort: a
 * failure here does not fail the surrounding order creation — the
 * customer was already charged and needs their order recorded regardless;
 * a Printful submission failure just means the order stays without
 * printful_order_id/tracking and needs a manual look.
 */
async function submitToPrintful(
  admin: SupabaseClient,
  orderId: string,
  items: OrderItemInput[],
  bySlug: Map<string, ProductForOrder>,
  shippingAddress: Record<string, unknown> | null,
  email: string,
): Promise<void> {
  const config = getPrintfulConfig();
  if (!config || !shippingAddress) return;

  const lineItems = items.flatMap((item) => {
    const product = bySlug.get(item.productSlug);
    if (!product?.printful_product_id) return [];
    const variantId = item.variant
      ? product.product_variants.find((v) => v.name === item.variant)?.printful_variant_id
      : product.printful_variant_id;
    if (!variantId) return [];
    return [{ sync_variant_id: variantId, quantity: item.quantity }];
  });
  if (lineItems.length === 0) return;

  const address = shippingAddress as {
    name?: string;
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
  };

  try {
    const createRes = await printfulFetch(config, "/orders", {
      method: "POST",
      body: JSON.stringify({
        external_id: orderId,
        recipient: {
          name: address.name || "Customer",
          address1: address.street1 ?? "",
          address2: address.street2 ?? "",
          city: address.city ?? "",
          state_code: address.state ?? "",
          country_code: address.country ?? "",
          zip: address.zip ?? "",
          phone: address.phone || "",
          email,
        },
        items: lineItems,
      }),
    });
    if (!createRes.ok) {
      console.error("Printful order creation failed:", await createRes.text());
      return;
    }
    const created = ((await createRes.json()) as PrintfulEnvelope<PrintfulOrder>).result;

    const confirmRes = await printfulFetch(config, `/orders/${created.id}/confirm`, { method: "POST" });
    if (!confirmRes.ok) console.error("Printful order confirm failed:", await confirmRes.text());

    await admin.from("orders").update({ printful_order_id: created.id }).eq("id", orderId);
  } catch (err) {
    console.error("Printful submission threw:", err);
  }
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
  const { data: products } = await admin
    .from("products")
    .select("id, slug, stock, printful_product_id, printful_variant_id, product_variants(name, printful_variant_id)")
    .in("slug", slugs);
  const bySlug = new Map(((products ?? []) as unknown as ProductForOrder[]).map((p) => [p.slug, p]));

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

  await submitToPrintful(admin, order.id, items, bySlug, draft.shipping_address, draft.email);

  return { ok: true, orderId: order.id };
}
