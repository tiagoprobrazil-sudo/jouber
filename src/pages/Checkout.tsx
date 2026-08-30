import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Lock, Info, Loader2, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { SeoHead } from "@/components/layout/SeoHead";
import { formatPrice } from "@/lib/utils/format";
import { combineCartParcel } from "@/lib/shipping/parcel";
import { getShippingRates } from "@/lib/shipping/shippo";
import type { ShippingAddress, ShippingRate } from "@/lib/shipping/types";
import { getStripe, isStripeConfigured, createPaymentIntent, createOrder } from "@/lib/payments/stripe";
import { Button } from "@/components/ui/Button";

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

function StripePaymentForm({
  total,
  onSuccess,
}: {
  total: number;
  onSuccess: (paymentIntentId: string) => void | Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({ elements, redirect: "if_required" });

    // redirect: "if_required" resolves here (rather than navigating away)
    // for card payments, which is all this PaymentIntent allows — see
    // create-payment-intent's allow_redirects: "never".
    if (confirmError || !paymentIntent || paymentIntent.status !== "succeeded") {
      setError(confirmError?.message ?? "Payment did not complete. Please check your details and try again.");
      setSubmitting(false);
      return;
    }

    await onSuccess(paymentIntent.id);
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && <p className="font-sans text-sm text-red-700">{error}</p>}
      <Button type="button" disabled={!stripe || submitting} onClick={handleSubmit} className="w-full">
        {submitting ? "Processing…" : `Pay ${formatPrice(total)}`}
      </Button>
    </div>
  );
}

export default function Checkout() {
  const { lines, subtotal, clear } = useCart();
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [rates, setRates] = useState<ShippingRate[] | null>(null);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [piLoading, setPiLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const selectedRate = rates?.find((r) => r.id === selectedRateId) ?? null;
  const total = subtotal + (selectedRate?.amount ?? 0);

  // Once a shipping rate is chosen, start (or restart, if the rate changes)
  // a PaymentIntent for the current total. Stripe Elements is keyed by
  // clientSecret below, so a new one remounts the payment form cleanly.
  useEffect(() => {
    if (!isStripeConfigured || !selectedRate || total <= 0) {
      setClientSecret(null);
      return;
    }
    let cancelled = false;
    setPiLoading(true);
    setPaymentError(null);
    createPaymentIntent(Math.round(total * 100), "usd", email || undefined)
      .then((result) => {
        if (!cancelled) setClientSecret(result.clientSecret);
      })
      .catch(() => {
        if (!cancelled) setPaymentError("Couldn't start payment. Please try again in a moment.");
      })
      .finally(() => {
        if (!cancelled) setPiLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRateId, total]);

  if (completedOrderId) {
    return (
      <>
        <SeoHead title="Order Confirmed" description="Your order from Atelier Saint Sebastian is confirmed." path="/checkout" />
        <div className="container-editorial flex min-h-[60vh] max-w-xl flex-col items-center justify-center pt-32 pb-24 text-center sm:pt-40">
          <CheckCircle2 size={40} strokeWidth={1.25} className="text-olive" />
          <h1 className="mt-6 font-serif text-4xl text-charcoal">Thank you</h1>
          <p className="mt-3 font-sans text-sm text-warmgray-dark">
            Your order has been placed and a confirmation will be sent to {email}.
          </p>
          <p className="mt-1 font-mono text-xs text-warmgray">Order #{completedOrderId.slice(0, 8)}</p>
        </div>
      </>
    );
  }

  if (lines.length === 0) return <Navigate to="/cart" replace />;

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

  async function handlePaymentSuccess(paymentIntentId: string) {
    if (!selectedRate) return;
    try {
      const orderId = await createOrder({
        paymentIntentId,
        email,
        subtotal,
        shippingAmount: selectedRate.amount,
        shippingAddress: address,
        items: lines.map((l) => ({
          productSlug: l.productSlug,
          productTitle: l.title,
          variant: l.variant,
          quantity: l.quantity,
          unitPrice: l.price,
        })),
      });
      setCompletedOrderId(orderId);
      clear();
    } catch {
      setPaymentError("Payment succeeded, but we couldn't finalize the order. Please contact us with your payment confirmation.");
    }
  }

  return (
    <>
      <SeoHead title="Checkout" description="Complete your order from Atelier Saint Sebastian." path="/checkout" />

      <div className="container-editorial pt-32 pb-24 sm:pt-40">
        <h1 className="font-serif text-4xl text-charcoal sm:text-5xl">Checkout</h1>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="space-y-10 lg:col-span-2">
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

              {!isStripeConfigured ? (
                <div className="flex items-start gap-3 border border-stone-dark bg-ivory-dim p-4 font-sans text-sm text-warmgray-dark">
                  <Info size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-warmgray" />
                  <p>Payment processing is not yet connected for this preview — no order is placed by this form today.</p>
                </div>
              ) : !selectedRate ? (
                <p className="font-sans text-sm text-warmgray">Choose a shipping method above to continue to payment.</p>
              ) : piLoading || !clientSecret ? (
                <p className="flex items-center gap-2 font-sans text-sm text-warmgray">
                  <Loader2 size={14} className="animate-spin" /> Preparing payment…
                </p>
              ) : (
                <Elements key={clientSecret} stripe={getStripe()} options={{ clientSecret }}>
                  <StripePaymentForm total={total} onSuccess={handlePaymentSuccess} />
                </Elements>
              )}

              {paymentError && <p className="font-sans text-sm text-red-700">{paymentError}</p>}
            </fieldset>

            {!isStripeConfigured && (
              <button
                type="button"
                disabled
                className="flex w-full items-center justify-center gap-2 bg-charcoal/40 px-8 py-4 font-sans text-[13px] uppercase tracking-[0.14em] text-ivory/70 cursor-not-allowed"
              >
                <Lock size={14} strokeWidth={1.5} />
                Payment Integration Required
              </button>
            )}
          </div>

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
