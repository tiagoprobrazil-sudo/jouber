import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { SeoHead } from "@/components/layout/SeoHead";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CouponForm } from "@/components/cart/CouponForm";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";
import { useCouponValidation } from "@/lib/hooks/useCouponValidation";

export default function Cart() {
  const { lines, subtotal } = useCart();
  const coupons = useCouponValidation();

  return (
    <>
      <SeoHead title="Cart" description="Review the works in your cart before checkout." path="/cart" />

      <div className="container-editorial pt-32 pb-24 sm:pt-40">
        <h1 className="font-serif text-4xl text-charcoal sm:text-5xl">Your Cart</h1>

        {lines.length === 0 ? (
          <div className="mt-16 flex flex-col items-start gap-6">
            <p className="font-sans text-warmgray">Your cart is quiet, for now.</p>
            <ButtonLink to="/shop">Explore the Collection</ButtonLink>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
            <ul className="divide-y divide-stone lg:col-span-2">
              {lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </ul>

            <div className="h-fit border border-stone-dark p-7">
              <h2 className="font-serif text-xl">Order Summary</h2>
              <div className="mt-5 space-y-2 font-sans text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-warmgray">Subtotal</span>
                  <span className="text-charcoal">{formatPrice(subtotal)}</span>
                </div>
                {coupons.discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-warmgray">Discount</span>
                    <span className="text-olive-dark">−{formatPrice(coupons.discountAmount)}</span>
                  </div>
                )}
              </div>
              <p className="mt-2 font-sans text-xs text-warmgray">Shipping and taxes calculated at checkout.</p>

              <div className="mt-5">
                <CouponForm result={coupons} loading={coupons.loading} />
              </div>

              <ButtonLink to="/checkout" className="mt-6 w-full">
                Checkout
              </ButtonLink>
              <Link to="/shop" className="mt-4 block text-center font-sans text-xs uppercase tracking-[0.16em] text-warmgray link-underline">
                Continue Browsing
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
