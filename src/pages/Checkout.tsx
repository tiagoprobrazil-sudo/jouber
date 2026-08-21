import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Lock, Info } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { SeoHead } from "@/components/layout/SeoHead";
import { formatPrice } from "@/lib/utils/format";

export default function Checkout() {
  const { lines, subtotal } = useCart();
  const [email, setEmail] = useState("");

  if (lines.length === 0) return <Navigate to="/cart" replace />;

  return (
    <>
      <SeoHead title="Checkout" description="Complete your order from Atelier Saint Sebastian." path="/checkout" />

      <div className="container-editorial pt-32 pb-24 sm:pt-40">
        <h1 className="font-serif text-4xl text-charcoal sm:text-5xl">Checkout</h1>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
          <form className="space-y-10 lg:col-span-2" onSubmit={(e) => e.preventDefault()}>
            <fieldset className="space-y-4">
              <legend className="mb-1 font-serif text-xl">Contact</legend>
              <div>
                <label htmlFor="checkout-email" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
                  Email address
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="mb-1 font-serif text-xl">Shipping Address</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {["Full name", "Address", "City", "State / Province", "Postal code", "Country"].map((field) => (
                  <div key={field} className={field === "Address" ? "sm:col-span-2" : ""}>
                    <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">{field}</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-4 border-t border-stone-dark pt-8">
              <legend className="mb-1 font-serif text-xl">Payment</legend>
              <div className="flex items-start gap-3 border border-stone-dark bg-ivory-dim p-4 font-sans text-sm text-warmgray-dark">
                <Info size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-warmgray" />
                <p>
                  Payment processing is not yet connected for this preview. Once a gateway (Stripe or
                  similar) is configured, this step will collect payment securely here — no order is
                  placed by this form today.
                </p>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled
              className="flex w-full items-center justify-center gap-2 bg-charcoal/40 px-8 py-4 font-sans text-[13px] uppercase tracking-[0.14em] text-ivory/70 cursor-not-allowed"
            >
              <Lock size={14} strokeWidth={1.5} />
              Payment Integration Required
            </button>
          </form>

          <div className="h-fit border border-stone-dark p-7">
            <h2 className="font-serif text-xl">Order Summary</h2>
            <ul className="mt-5 space-y-4 divide-y divide-stone">
              {lines.map((line) => (
                <li key={line.id} className="flex items-center gap-3 pt-4 first:pt-0">
                  <div className="h-16 w-14 shrink-0 overflow-hidden bg-stone">
                    <img src={line.image} alt={line.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-sm leading-snug">{line.title}</p>
                    <p className="text-xs text-warmgray">Qty {line.quantity}</p>
                  </div>
                  <span className="font-sans text-sm">{formatPrice(line.price * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between border-t border-stone-dark pt-5 font-sans text-sm">
              <span className="text-warmgray">Subtotal</span>
              <span className="text-charcoal">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
