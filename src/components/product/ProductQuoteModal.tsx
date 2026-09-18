import { useRef, useState } from "react";
import { X, Check } from "lucide-react";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";
import { useDialogFocus } from "@/lib/hooks/useDialogFocus";
import { Button } from "@/components/ui/Button";
import { createProductQuoteRequest } from "@/lib/quotes/requests";
import { QUOTE_SIZE_OPTIONS, QUOTE_FINISH_OPTIONS } from "@/lib/quotes/types";
import type { Product, ProductVariant } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

interface ProductQuoteModalProps {
  product: Product | null;
  variant: ProductVariant | null;
  isOpen: boolean;
  onClose: () => void;
}

type Status = "form" | "submitting" | "done" | "error";

const inputClass =
  "w-full rounded-sm border border-stone-dark bg-ivory px-3.5 py-2.5 font-sans text-sm text-charcoal outline-none focus:border-olive";
const labelClass = "mb-1.5 block font-sans text-[11px] uppercase tracking-wide text-warmgray";

export function ProductQuoteModal({ product, variant, isOpen, onClose }: ProductQuoteModalProps) {
  useLockBodyScroll(isOpen);
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(isOpen, dialogRef, onClose);

  const [status, setStatus] = useState<Status>("form");
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState<string>(QUOTE_SIZE_OPTIONS[0].value);
  const [finish, setFinish] = useState<string>(QUOTE_FINISH_OPTIONS[0]);
  const [customization, setCustomization] = useState<"yes" | "no">("no");
  const [consent, setConsent] = useState(false);

  function reset() {
    setStatus("form");
    setError(null);
    setSize(QUOTE_SIZE_OPTIONS[0].value);
    setFinish(QUOTE_FINISH_OPTIONS[0]);
    setCustomization("no");
    setConsent(false);
  }

  function handleClose() {
    onClose();
    // Wait for the close transition before resetting the form state.
    window.setTimeout(reset, 300);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product || !consent) return;

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const zipCode = String(form.get("zipCode") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    if (!name || !email) return;

    setStatus("submitting");
    setError(null);
    try {
      await createProductQuoteRequest({
        product: {
          id: product.id,
          title: product.title,
          url: `${window.location.origin}/product/${product.slug}`,
          image: product.images[0]?.url,
          variantName: variant?.name,
        },
        customer: { name, email, phone: phone || undefined },
        desiredSize: size,
        finish,
        customization: customization === "yes",
        zipCode: zipCode || undefined,
        message: message || undefined,
      });
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[110] bg-charcoal/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Request a quote"
        aria-hidden={!isOpen}
        className={`fixed left-1/2 top-1/2 z-[120] flex max-h-[88vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 flex-col rounded-sm bg-cream shadow-2xl transition-[opacity,transform] duration-300 sm:max-h-[85vh] ${
          isOpen ? "-translate-y-1/2 opacity-100" : "-translate-y-[45%] opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 p-1 text-charcoal transition-transform hover:rotate-90"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8">
          {product && status !== "done" && (
            <>
              <p className="mb-1 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-warmgray">
                Quote Request
              </p>
              <h2 className="pr-6 font-serif text-xl text-charcoal">{product.title}</h2>
              <p className="mt-1 font-sans text-sm text-warmgray">Price available upon request</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="quote-name" className={labelClass}>
                      Full Name *
                    </label>
                    <input id="quote-name" name="name" type="text" required className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="quote-email" className={labelClass}>
                      Email *
                    </label>
                    <input id="quote-email" name="email" type="email" required className={inputClass} />
                  </div>
                </div>

                <div>
                  <label htmlFor="quote-phone" className={labelClass}>
                    Phone / WhatsApp
                  </label>
                  <input id="quote-phone" name="phone" type="tel" className={inputClass} />
                </div>

                <fieldset>
                  <legend className={labelClass}>Desired Size *</legend>
                  <div className="flex flex-wrap gap-2">
                    {QUOTE_SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSize(opt.value)}
                        aria-pressed={size === opt.value}
                        className={cn(
                          "border px-3.5 py-2 font-sans text-[13px] transition-colors",
                          size === opt.value
                            ? "border-charcoal bg-charcoal text-ivory"
                            : "border-stone-dark text-charcoal hover:border-charcoal",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className={labelClass}>Finish / Painting *</legend>
                  <div className="flex flex-wrap gap-2">
                    {QUOTE_FINISH_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFinish(opt)}
                        aria-pressed={finish === opt}
                        className={cn(
                          "border px-3.5 py-2 font-sans text-[13px] transition-colors",
                          finish === opt
                            ? "border-charcoal bg-charcoal text-ivory"
                            : "border-stone-dark text-charcoal hover:border-charcoal",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className={labelClass}>Customization</legend>
                  <div className="flex gap-2">
                    {(["no", "yes"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCustomization(opt)}
                        aria-pressed={customization === opt}
                        className={cn(
                          "border px-5 py-2 font-sans text-[13px] capitalize transition-colors",
                          customization === opt
                            ? "border-charcoal bg-charcoal text-ivory"
                            : "border-stone-dark text-charcoal hover:border-charcoal",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="quote-message" className={labelClass}>
                    Tell us about your request
                  </label>
                  <textarea
                    id="quote-message"
                    name="message"
                    rows={4}
                    placeholder="Share any details that will help us prepare your quote…"
                    className={cn(inputClass, "resize-none")}
                  />
                </div>

                <div>
                  <label htmlFor="quote-zip" className={labelClass}>
                    ZIP / Postal Code (optional)
                  </label>
                  <input id="quote-zip" name="zipCode" type="text" className={cn(inputClass, "max-w-[200px]")} />
                  <p className="mt-1.5 font-sans text-[11px] text-warmgray">Used only for a future shipping estimate.</p>
                </div>

                <div className="border border-stone-dark bg-ivory-dim p-4">
                  <p className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-warmgray">
                    About Your Commission
                  </p>
                  <div className="space-y-2.5 font-sans text-[12.5px] leading-relaxed text-warmgray-dark">
                    <p>
                      Thank you for your interest in Atelier Saint Sebastian. Each resin sculpture is carefully
                      prepared, entirely hand-painted, varnished and individually inspected. Final pricing reflects
                      materials, artistic labor, size, level of detail and any requested customization.
                    </p>
                    <p>
                      Custom finishes, special details and larger sizes are quoted individually. The final
                      dimensions, included services, shipping costs and applicable taxes will be confirmed in your
                      personalized quote.
                    </p>
                    <p className="font-medium text-charcoal">Payment</p>
                    <p>
                      A 50% deposit is required to begin production. The remaining 50% is due before shipping or
                      pickup.
                    </p>
                    <p className="font-medium text-charcoal">Production Time</p>
                    <p>
                      Standard production time is up to 3 weeks after the deposit is confirmed and all project
                      details are approved. Shipping time is additional.
                    </p>
                    <p>
                      Because every piece is handcrafted, slight variations in color and finish may occur compared
                      with reference images.
                    </p>
                    <p>
                      Changes requested after approval may affect both price and production time and will always be
                      confirmed before proceeding.
                    </p>
                    <p>
                      Before production begins, Atelier Saint Sebastian will send a complete summary of the order,
                      pricing and conditions for written approval.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 font-sans text-[12.5px] leading-relaxed text-warmgray-dark">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 accent-olive"
                  />
                  I understand that this is a quote request and does not create an order or payment obligation.
                </label>

                {status === "error" && <p className="font-sans text-[13px] text-red-700">{error}</p>}

                <Button type="submit" className="w-full" disabled={status === "submitting" || !consent}>
                  {status === "submitting" ? "Sending…" : "Request My Quote"}
                </Button>
              </form>
            </>
          )}

          {product && status === "done" && (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-olive/10">
                <Check size={22} strokeWidth={1.5} className="text-olive" />
              </div>
              <h2 className="font-serif text-xl text-charcoal">Thank you!</h2>
              <p className="mt-2 font-sans text-[13px] leading-relaxed text-warmgray-dark">
                Your quote request has been received. We will review the details of your request and contact you
                with pricing and availability.
              </p>
              <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="mt-6 w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
