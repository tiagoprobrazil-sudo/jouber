import { useRef } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { formatPrice } from "@/lib/utils/format";
import { useDialogFocus } from "@/lib/hooks/useDialogFocus";

export function CartDrawer() {
  const { lines, subtotal, isDrawerOpen, closeDrawer } = useCart();
  useLockBodyScroll(isDrawerOpen);
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(isDrawerOpen, dialogRef, closeDrawer);

  return (
    <>
      <div
        className={`fixed inset-0 z-[110] bg-charcoal/40 transition-opacity duration-500 ${
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!isDrawerOpen}
        className={`fixed right-0 top-0 z-[120] flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-dark px-6 py-5">
          <h2 className="font-serif text-xl">Your Cart</h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="p-1 text-charcoal transition-transform hover:rotate-90"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-serif text-lg text-warmgray">Your cart is quiet, for now.</p>
            <Button variant="secondary" size="sm" onClick={closeDrawer}>
              Continue Browsing
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-stone overflow-y-auto px-6">
              {lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </ul>
            <div className="border-t border-stone-dark px-6 py-6">
              <div className="mb-4 flex items-center justify-between font-sans text-sm">
                <span className="text-warmgray">Subtotal</span>
                <span className="text-base text-charcoal">{formatPrice(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-warmgray">Shipping and taxes calculated at checkout.</p>
              <ButtonLink to="/checkout" onClick={closeDrawer} className="w-full">
                Checkout
              </ButtonLink>
              <Link
                to="/cart"
                onClick={closeDrawer}
                className="mt-3 block text-center font-sans text-xs uppercase tracking-[0.16em] text-warmgray link-underline"
              >
                View Cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
