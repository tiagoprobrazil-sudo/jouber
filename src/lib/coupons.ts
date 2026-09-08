import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getCoupons, getProducts } from "@/lib/data/repository";
import { evaluateCouponsLocally, type CouponEvalResult } from "@/lib/coupons/engine";

export type { AppliedCoupon, RejectedCoupon, CouponEvalResult } from "@/lib/coupons/engine";

export interface CouponCartItemInput {
  productSlug: string;
  quantity: number;
  unitPrice: number;
}

const LATENCY_MS = 180;
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

/**
 * Validates a set of applied coupon codes against the current cart and
 * returns each one's computed discount (or rejection reason). Calls the
 * validate-coupon Edge Function — which holds the real rule engine and
 * product/category data server-side — when a real Supabase project is
 * connected; otherwise falls back to a local port (lib/coupons/engine.ts)
 * so the coupon UI still previews correctly in the offline mock demo.
 *
 * `email` may be an empty string (e.g. called from the Cart page, before
 * checkout collects it) — coupons restricted by allowed_emails simply
 * aren't checked yet in that case, and get re-validated with the real
 * email at checkout.
 */
export async function validateCoupons(codes: string[], items: CouponCartItemInput[], email = ""): Promise<CouponEvalResult> {
  if (codes.length === 0) return { applied: [], rejected: [], discountAmount: 0, freeShipping: false };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase!.functions.invoke<CouponEvalResult>("validate-coupon", {
      body: { codes, email, items },
    });
    if (error || !data) throw error ?? new Error("Could not validate coupon.");
    return data;
  }

  const [coupons, products] = await Promise.all([getCoupons(), getProducts({})]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const cartItems = items.map((item) => {
    const product = bySlug.get(item.productSlug);
    return {
      productId: product?.id,
      categorySlugs: product?.categorySlugs ?? [],
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      onSale: product ? Boolean(product.compareAtPrice && product.compareAtPrice > product.price) : false,
    };
  });
  const subtotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  return delay(evaluateCouponsLocally(coupons, codes, { subtotal, items: cartItems }, email));
}
