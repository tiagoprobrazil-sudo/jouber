import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Lock, Info, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { SeoHead } from "@/components/layout/SeoHead";
import { formatPrice } from "@/lib/utils/format";
import { combineCartParcel } from "@/lib/shipping/parcel";
import { getShippingRates } from "@/lib/shipping/shippo";
import type { ShippingAddress, ShippingRate } from "@/lib/shipping/types";

const EMPTY_ADDRESS: ShippingAddress = {
  name: "",
  street1: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
};

function addressIsComplete(address: ShippingAddress): boolean {
  return Boolean(address.name && address.street1 && address.city && address.state && address.zip && address.country);
}

export default function Checkout() {
  const { lines, subtotal } = useCart();
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [rates, setRates] = useState<ShippingRate[] | null>(null);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  if (lines.length === 0) return <Navigate to="/cart" replace />;

  const selectedRate = rates?.find((r) => r.id === selectedRateId) ?? null;
  const total = subtotal + (selectedRate?.amount ?? 0);

  function updateAddress<K extends keyof ShippingAddress>(field: K, value: ShippingAddress[K]) {
    setAddress((prev) => ({ ...prev, [field]: value }));
    // Address changed since the last quote — the old rates no longer apply.
    setRates(null);
    setSelectedRateId(null);
  }

  async function handleGetRates() {
    setRatesLoading(true);
    setRatesError(null);
    try {
      const parcel = combineCartParcel(lines);
      const result = await getShippingRates(address, parcel);
      setRates(result);
      setSelectedRateId(result[0]?.id ?? null);
      if (result.length === 0) setRatesError("No shipping rates were available for this address.");
    } catch {
      setRatesError("Couldn't fetch shipping rates. Please check the address and try again.");
    } finally {
      setRatesLoading(false);
    }
  }

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
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">Full name</label>
                  <input
                    type="text"
                    required
                    value={address.name}
                    onChange={(e) => updateAddress("name", e.target.value)}
                    className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">Address</label>
                  <input
                    type="text"
                    required
                    value={address.street1}
                    onChange={(e) => updateAddress("street1", e.target.value)}
                    className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">Apartment, suite, etc. (optional)</label>
                  <input
                    type="text"
                    value={address.street2}
                    onChange={(e) => updateAddress("street2", e.target.value)}
                    className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">City</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => updateAddress("city", e.target.value)}
                    className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">State / Province</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => updateAddress("state", e.target.value)}
                    className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">Postal code</label>
                  <input
                    type="text"
                    required
                    value={address.zip}
                    onChange={(e) => updateAddress("zip", e.target.value)}
                    className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">Country</label>
                  <select
                    required
                    value={address.country}
                    onChange={(e) => updateAddress("country", e.target.value)}
                    className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="BR">Brazil</option>
                    <option value="GB">United Kingdom</option>
                    <option value="PT">Portugal</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4 border-t border-stone-dark pt-8">
              <legend className="mb-1 font-serif text-xl">Shipping Method</legend>

              {!rates && (
                <button
                  type="button"
                  onClick={handleGetRates}
                  disabled={!addressIsComplete(address) || ratesLoading}
                  className="flex items-center gap-2 border border-charcoal px-6 py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-charcoal transition-colors hover:bg-charcoal hover:text-ivory disabled:cursor-not-allowed disabled:border-stone-dark disabled:text-warmgray"
                >
                  {ratesLoading && <Loader2 size={14} className="animate-spin" />}
                  {ratesLoading ? "Getting rates..." : "Get shipping rates"}
                </button>
              )}

              {ratesError && <p className="font-sans text-sm text-red-700">{ratesError}</p>}

              {rates && rates.length > 0 && (
                <div className="space-y-2">
                  {rates.map((rate) => (
                    <label
                      key={rate.id}
                      className={`flex cursor-pointer items-center justify-between gap-4 border px-4 py-3 font-sans text-sm transition-colors ${
                        selectedRateId === rate.id ? "border-charcoal bg-ivory-dim" : "border-stone-dark"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping-rate"
                          checked={selectedRateId === rate.id}
                          onChange={() => setSelectedRateId(rate.id)}
                          className="h-4 w-4 accent-olive"
                        />
                        <span>
                          <span className="block text-charcoal">
                            {rate.provider} — {rate.service}
                          </span>
                          {rate.estimatedDays != null && (
                            <span className="block text-xs text-warmgray">~{rate.estimatedDays} business days</span>
                          )}
                        </span>
                      </span>
                      <span className="text-charcoal">{formatPrice(rate.amount)}</span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={handleGetRates}
                    className="font-sans text-xs uppercase tracking-wide text-warmgray underline-offset-2 hover:text-charcoal hover:underline"
                  >
                    Refresh rates
                  </button>
                </div>
              )}
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
            <div className="mt-5 space-y-2 border-t border-stone-dark pt-5 font-sans text-sm">
              <div className="flex items-center justify-between">
                <span className="text-warmgray">Subtotal</span>
                <span className="text-charcoal">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-warmgray">Shipping</span>
                <span className="text-charcoal">{selectedRate ? formatPrice(selectedRate.amount) : "—"}</span>
              </div>
              <div className="flex items-center justify-between border-t border-stone-dark pt-2 text-base">
                <span className="text-charcoal">Total</span>
                <span className="text-charcoal">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
