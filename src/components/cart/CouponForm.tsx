import { useState, type FormEvent } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { CouponEvalResult } from "@/lib/coupons";
import { formatPrice } from "@/lib/utils/format";

/** Coupon input + applied-code list, shared by the Cart and Checkout pages. See lib/hooks/useCouponValidation. */
export function CouponForm({ result, loading }: { result: CouponEvalResult; loading: boolean }) {
  const { couponCodes, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");

  function handleApply(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    applyCoupon(trimmed);
    setCode("");
  }

  return (
    <div className="space-y-3 border-t border-stone-dark pt-5">
      <form onSubmit={handleApply} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          className="w-0 flex-1 border border-stone-dark bg-transparent px-3 py-2.5 font-sans text-sm uppercase tracking-wide focus:border-olive focus:outline-none"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="flex shrink-0 items-center gap-2 border border-charcoal px-4 py-2.5 font-sans text-[12px] uppercase tracking-wide text-charcoal transition-colors hover:bg-charcoal hover:text-ivory disabled:cursor-not-allowed disabled:border-stone-dark disabled:text-warmgray"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          Apply
        </button>
      </form>

      {couponCodes.length > 0 && (
        <ul className="space-y-2">
          {couponCodes.map((c) => {
            const applied = result.applied.find((a) => a.code === c);
            const rejected = result.rejected.find((r) => r.code === c);
            return (
              <li key={c} className="flex items-start justify-between gap-3">
                <div className="font-sans text-xs">
                  <span className="flex items-center gap-1.5">
                    <Tag size={12} strokeWidth={1.5} className={applied ? "text-olive" : "text-warmgray"} />
                    <span className={applied ? "text-charcoal" : "text-warmgray line-through"}>{c}</span>
                    {applied && <span className="text-olive-dark">−{formatPrice(applied.discountAmount)}</span>}
                  </span>
                  {rejected && <p className="mt-0.5 text-red-700">{rejected.reason}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeCoupon(c)}
                  aria-label={`Remove coupon ${c}`}
                  className="shrink-0 text-warmgray hover:text-red-700"
                >
                  <X size={13} strokeWidth={1.5} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
