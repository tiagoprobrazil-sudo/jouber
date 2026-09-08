import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { validateCoupons, type CouponEvalResult } from "@/lib/coupons";

const EMPTY: CouponEvalResult = { applied: [], rejected: [], discountAmount: 0, freeShipping: false };
const DEBOUNCE_MS = 350;

/**
 * Re-validates the cart's applied coupon codes (see CartContext) against
 * the current cart lines — and, once known, the shopper's email — every
 * time either changes. Debounced so typing an email at checkout doesn't
 * fire a request per keystroke.
 */
export function useCouponValidation(email = ""): CouponEvalResult & { loading: boolean } {
  const { lines, couponCodes } = useCart();
  const [result, setResult] = useState<CouponEvalResult>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (couponCodes.length === 0) {
      setResult(EMPTY);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      validateCoupons(
        couponCodes,
        lines.map((l) => ({ productSlug: l.productSlug, quantity: l.quantity, unitPrice: l.price })),
        email,
      )
        .then((r) => {
          if (!cancelled) setResult(r);
        })
        .catch(() => {
          if (!cancelled) setResult(EMPTY);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponCodes, lines, email]);

  return { ...result, loading };
}
