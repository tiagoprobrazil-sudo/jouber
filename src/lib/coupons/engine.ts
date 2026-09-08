/**
 * Local/mock-mode port of supabase/functions/_shared/couponEngine.ts —
 * used only when no real Supabase project is connected (see
 * lib/coupons.ts), so the coupon UI in Cart/Checkout still previews
 * correctly during `npm run dev` with zero backend. The Edge Function
 * version is authoritative once Supabase is connected; this one exists
 * purely for the offline demo and intentionally skips checks that need
 * server-side history (usage_limit_per_user), since the mock repository
 * has no real checkout that could redeem a coupon anyway.
 */

import type { Coupon, CouponDiscountType } from "@/lib/data/types";

export interface CouponCartItem {
  productId?: string;
  categorySlugs: string[];
  quantity: number;
  unitPrice: number;
  onSale?: boolean;
}

export interface CouponCart {
  subtotal: number;
  items: CouponCartItem[];
}

export interface AppliedCoupon {
  code: string;
  discountType: CouponDiscountType;
  amount: number;
  discountAmount: number;
  freeShipping: boolean;
}

export interface RejectedCoupon {
  code: string;
  reason: string;
}

export interface CouponEvalResult {
  applied: AppliedCoupon[];
  rejected: RejectedCoupon[];
  discountAmount: number;
  freeShipping: boolean;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function emailMatches(email: string, patterns: string[]): boolean {
  const e = email.trim().toLowerCase();
  if (!e) return false;
  return patterns.some((raw) => {
    const p = raw.trim().toLowerCase();
    if (!p) return false;
    if (!p.includes("*")) return p === e;
    const regex = new RegExp(`^${p.split("*").map(escapeRegex).join(".*")}$`);
    return regex.test(e);
  });
}

function eligibleIndices(coupon: Coupon, items: CouponCartItem[]): number[] {
  return items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      if (coupon.productIds.length && (!item.productId || !coupon.productIds.includes(item.productId))) return false;
      if (item.productId && coupon.excludedProductIds.includes(item.productId)) return false;
      if (coupon.productCategories.length && !item.categorySlugs.some((c) => coupon.productCategories.includes(c))) return false;
      if (coupon.excludedProductCategories.length && item.categorySlugs.some((c) => coupon.excludedProductCategories.includes(c))) return false;
      if (coupon.excludeSaleItems && item.onSale) return false;
      return true;
    })
    .map(({ index }) => index);
}

function capToItemLimit(indices: number[], items: CouponCartItem[], limit: number | undefined): { index: number; fraction: number }[] {
  if (limit == null) return indices.map((index) => ({ index, fraction: 1 }));
  let remaining = limit;
  const result: { index: number; fraction: number }[] = [];
  for (const index of indices) {
    if (remaining <= 0) break;
    const qty = items[index].quantity;
    const covered = Math.min(qty, remaining);
    result.push({ index, fraction: covered / qty });
    remaining -= covered;
  }
  return result;
}

function applyCouponDiscount(coupon: Coupon, cart: CouponCart, remaining: number[]): number {
  const hasInclusionRestriction = coupon.productIds.length > 0 || coupon.productCategories.length > 0;

  if (coupon.discountType === "fixed_cart") {
    const totalRemaining = remaining.reduce((a, b) => a + b, 0);
    if (totalRemaining <= 0) return 0;
    const discount = round2(Math.min(coupon.amount, totalRemaining));
    for (let i = 0; i < remaining.length; i++) {
      remaining[i] -= discount * (remaining[i] / totalRemaining);
    }
    return discount;
  }

  const eligible = eligibleIndices(coupon, cart.items);
  if (hasInclusionRestriction && eligible.length === 0) return 0;
  const covered = capToItemLimit(eligible, cart.items, coupon.limitUsageToXItems);
  const eligibleBase = covered.reduce((sum, { index, fraction }) => sum + remaining[index] * fraction, 0);
  if (eligibleBase <= 0) return 0;

  const rawDiscount =
    coupon.discountType === "percent"
      ? eligibleBase * (coupon.amount / 100)
      : coupon.amount * covered.reduce((sum, { index, fraction }) => sum + cart.items[index].quantity * fraction, 0);
  const discount = round2(Math.min(rawDiscount, eligibleBase));

  for (const { index, fraction } of covered) {
    const share = (remaining[index] * fraction) / eligibleBase;
    remaining[index] -= discount * share;
  }
  return discount;
}

export function evaluateCouponsLocally(coupons: Coupon[], codes: string[], cart: CouponCart, email: string): CouponEvalResult {
  const uniqueCodes = [...new Set(codes.map((c) => c.trim().toUpperCase()).filter(Boolean))];
  const result: CouponEvalResult = { applied: [], rejected: [], discountAmount: 0, freeShipping: false };
  if (uniqueCodes.length === 0) return result;

  const byCode = new Map(coupons.map((c) => [c.code, c]));
  const remaining = cart.items.map((i) => i.unitPrice * i.quantity);
  const today = new Date().toISOString().slice(0, 10);
  let anyIndividualUseApplied = false;

  for (const code of uniqueCodes) {
    const coupon = byCode.get(code);
    const reject = (reason: string) => result.rejected.push({ code, reason });

    if (!coupon || !coupon.active) {
      reject("Invalid coupon code.");
      continue;
    }
    if (coupon.expiryDate && coupon.expiryDate < today) {
      reject("This coupon has expired.");
      continue;
    }
    if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
      reject("This coupon's usage limit has been reached.");
      continue;
    }
    if (coupon.minimumAmount != null && cart.subtotal < coupon.minimumAmount) {
      reject(`A minimum spend of $${coupon.minimumAmount.toFixed(2)} is required to use this coupon.`);
      continue;
    }
    if (coupon.maximumAmount != null && cart.subtotal > coupon.maximumAmount) {
      reject(`This coupon is only valid for orders up to $${coupon.maximumAmount.toFixed(2)}.`);
      continue;
    }
    if (coupon.allowedEmails.length > 0 && email && !emailMatches(email, coupon.allowedEmails)) {
      reject("This coupon is not valid for your email address.");
      continue;
    }
    if ((coupon.individualUseOnly || anyIndividualUseApplied) && (result.applied.length > 0 || anyIndividualUseApplied)) {
      reject("This coupon cannot be combined with other coupons.");
      continue;
    }

    const hasInclusionRestriction = coupon.productIds.length > 0 || coupon.productCategories.length > 0;
    if (hasInclusionRestriction && eligibleIndices(coupon, cart.items).length === 0) {
      reject("This coupon is not applicable to the items in your cart.");
      continue;
    }

    const discountAmount = applyCouponDiscount(coupon, cart, remaining);
    if (discountAmount <= 0) {
      reject("This coupon does not apply to your cart.");
      continue;
    }

    result.applied.push({
      code: coupon.code,
      discountType: coupon.discountType,
      amount: coupon.amount,
      discountAmount,
      freeShipping: coupon.freeShipping,
    });
    if (coupon.individualUseOnly) anyIndividualUseApplied = true;
    if (coupon.freeShipping) result.freeShipping = true;
  }

  result.discountAmount = round2(result.applied.reduce((sum, a) => sum + a.discountAmount, 0));
  return result;
}
