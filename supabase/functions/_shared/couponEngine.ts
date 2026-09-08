// Shared coupon rule engine — the single source of truth for validating
// and pricing coupon codes, used by validate-coupon (live preview from
// the Cart/Checkout pages), create-payment-intent (authoritative discount
// at the moment a PaymentIntent is created) and finalizeOrder (records
// the redemption once an order is written). Never trust a discount
// amount the client sends — always recompute it here from the coupon's
// real rules in the `coupons` table.
//
// Modeled on how WooCommerce evaluates and stacks coupons: each valid
// coupon is applied in the order given, against the *remaining* item
// totals left after every coupon applied before it — so a second
// percentage coupon discounts what's left after the first, not the
// original price.

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export interface CouponCartItem {
  /** products.id — omitted for lines whose product could not be resolved (e.g. a stale slug), which then can't match any product/category restriction. */
  productId?: string;
  categorySlugs: string[];
  quantity: number;
  unitPrice: number;
  /** True when the product is on sale (compare_at_price > price) — see exclude_sale_items. */
  onSale?: boolean;
}

export interface CouponCart {
  subtotal: number;
  items: CouponCartItem[];
}

export interface AppliedCoupon {
  code: string;
  discountType: "percent" | "fixed_cart" | "fixed_product";
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

interface CouponRow {
  id: string;
  code: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  amount: number;
  free_shipping: boolean;
  expiry_date: string | null;
  minimum_amount: number | null;
  maximum_amount: number | null;
  individual_use_only: boolean;
  exclude_sale_items: boolean;
  product_ids: string[];
  excluded_product_ids: string[];
  product_categories: string[];
  excluded_product_categories: string[];
  allowed_emails: string[];
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  limit_usage_to_x_items: number | null;
  usage_count: number;
  active: boolean;
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

/** Indices of `items` this coupon's product/category restrictions allow. */
function eligibleIndices(coupon: CouponRow, items: CouponCartItem[]): number[] {
  return items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      if (coupon.product_ids.length && (!item.productId || !coupon.product_ids.includes(item.productId))) return false;
      if (item.productId && coupon.excluded_product_ids.includes(item.productId)) return false;
      if (coupon.product_categories.length && !item.categorySlugs.some((c) => coupon.product_categories.includes(c))) return false;
      if (coupon.excluded_product_categories.length && item.categorySlugs.some((c) => coupon.excluded_product_categories.includes(c))) return false;
      if (coupon.exclude_sale_items && item.onSale) return false;
      return true;
    })
    .map(({ index }) => index);
}

/**
 * Caps an eligible-index list to at most `limit` total units (Woo's
 * "Limit usage to X items"), picking whole/partial line items in cart
 * order. Returns each covered index with the fraction of that line's
 * quantity the discount applies to.
 */
function capToItemLimit(indices: number[], items: CouponCartItem[], limit: number | null): { index: number; fraction: number }[] {
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

/**
 * Applies one coupon's discount against the current running totals
 * (mutated in place) and returns the amount it discounted. `remaining`
 * parallels `cart.items` and starts equal to unitPrice*quantity per
 * line, shrinking as earlier coupons in the stack consume it.
 */
function applyCouponDiscount(coupon: CouponRow, cart: CouponCart, remaining: number[]): number {
  const hasInclusionRestriction = coupon.product_ids.length > 0 || coupon.product_categories.length > 0;

  if (coupon.discount_type === "fixed_cart") {
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
  const covered = capToItemLimit(eligible, cart.items, coupon.limit_usage_to_x_items);
  const eligibleBase = covered.reduce((sum, { index, fraction }) => sum + remaining[index] * fraction, 0);
  if (eligibleBase <= 0) return 0;

  const rawDiscount =
    coupon.discount_type === "percent"
      ? eligibleBase * (coupon.amount / 100)
      : coupon.amount * covered.reduce((sum, { index, fraction }) => sum + cart.items[index].quantity * fraction, 0);
  const discount = round2(Math.min(rawDiscount, eligibleBase));

  for (const { index, fraction } of covered) {
    const share = (remaining[index] * fraction) / eligibleBase;
    remaining[index] -= discount * share;
  }
  return discount;
}

export interface RawCartItem {
  productSlug?: string;
  quantity?: number;
  unitPrice?: number;
}

/**
 * Resolves each cart line's product id, category slugs and sale status
 * from the database by slug — shared by validate-coupon and
 * create-payment-intent so a coupon's product/category restrictions are
 * always checked against real data, never whatever the client claims.
 */
export async function resolveCartItems(admin: SupabaseClient, items: RawCartItem[]): Promise<CouponCart> {
  const slugs = [...new Set(items.map((i) => i.productSlug).filter((s): s is string => Boolean(s)))];
  const { data: products } = slugs.length
    ? await admin
        .from("products")
        .select("id, slug, price, compare_at_price, product_category_map(category_slug)")
        .in("slug", slugs)
    : { data: [] as never[] };
  interface ProductRow {
    id: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    product_category_map: { category_slug: string }[];
  }
  const bySlug = new Map(((products ?? []) as unknown as ProductRow[]).map((p) => [p.slug, p]));

  const cartItems: CouponCartItem[] = items.map((item) => {
    const product = item.productSlug ? bySlug.get(item.productSlug) : undefined;
    return {
      productId: product?.id,
      categorySlugs: product?.product_category_map.map((c) => c.category_slug) ?? [],
      quantity: item.quantity ?? 1,
      unitPrice: item.unitPrice ?? 0,
      onSale: product ? product.compare_at_price != null && product.compare_at_price > product.price : false,
    };
  });
  const subtotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  return { subtotal, items: cartItems };
}

export async function evaluateCoupons(
  admin: SupabaseClient,
  codes: string[],
  cart: CouponCart,
  email: string,
): Promise<CouponEvalResult> {
  const uniqueCodes = [...new Set(codes.map((c) => c.trim().toUpperCase()).filter(Boolean))];
  const result: CouponEvalResult = { applied: [], rejected: [], discountAmount: 0, freeShipping: false };
  if (uniqueCodes.length === 0) return result;

  const { data: rows } = await admin.from("coupons").select("*").in("code", uniqueCodes);
  const byCode = new Map(((rows ?? []) as CouponRow[]).map((r) => [r.code, r]));

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
    if (coupon.expiry_date && coupon.expiry_date < today) {
      reject("This coupon has expired.");
      continue;
    }
    if (coupon.usage_limit != null && coupon.usage_count >= coupon.usage_limit) {
      reject("This coupon's usage limit has been reached.");
      continue;
    }
    if (coupon.usage_limit_per_user != null && email) {
      const { count } = await admin
        .from("coupon_usage")
        .select("id", { count: "exact", head: true })
        .eq("coupon_id", coupon.id)
        .ilike("email", email);
      if ((count ?? 0) >= coupon.usage_limit_per_user) {
        reject("You have already used this coupon the maximum number of times.");
        continue;
      }
    }
    // Numeric columns can come back from PostgREST as strings — coerce
    // before .toFixed (arithmetic operators below coerce implicitly, but
    // .toFixed does not).
    const minimumAmount = coupon.minimum_amount != null ? Number(coupon.minimum_amount) : null;
    const maximumAmount = coupon.maximum_amount != null ? Number(coupon.maximum_amount) : null;
    if (minimumAmount != null && cart.subtotal < minimumAmount) {
      reject(`A minimum spend of $${minimumAmount.toFixed(2)} is required to use this coupon.`);
      continue;
    }
    if (maximumAmount != null && cart.subtotal > maximumAmount) {
      reject(`This coupon is only valid for orders up to $${maximumAmount.toFixed(2)}.`);
      continue;
    }
    if (coupon.allowed_emails.length > 0 && email && !emailMatches(email, coupon.allowed_emails)) {
      reject("This coupon is not valid for your email address.");
      continue;
    }
    if ((coupon.individual_use_only || anyIndividualUseApplied) && (result.applied.length > 0 || anyIndividualUseApplied)) {
      reject("This coupon cannot be combined with other coupons.");
      continue;
    }

    const hasInclusionRestriction = coupon.product_ids.length > 0 || coupon.product_categories.length > 0;
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
      discountType: coupon.discount_type,
      amount: Number(coupon.amount),
      discountAmount,
      freeShipping: coupon.free_shipping,
    });
    if (coupon.individual_use_only) anyIndividualUseApplied = true;
    if (coupon.free_shipping) result.freeShipping = true;
  }

  result.discountAmount = round2(result.applied.reduce((sum, a) => sum + a.discountAmount, 0));
  return result;
}
