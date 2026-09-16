import { useRef, useState } from "react";
import { X, Check, ExternalLink } from "lucide-react";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";
import { useDialogFocus } from "@/lib/hooks/useDialogFocus";
import { Button } from "@/components/ui/Button";
import { formatBRL } from "@/lib/commissions/format";
import { createCommissionRequest } from "@/lib/commissions/requests";
import type { CatalogItem, CommissionRequestResult } from "@/lib/commissions/types";

interface CommissionRequestModalProps {
  item: CatalogItem | null;
  /** Admin's labor price for this piece, or null if not set yet (total
   * hasn't been priced — the raw file price alone is never shown). */
  servicePrice: number | null;
  onClose: () => void;
}

type Status = "form" | "submitting" | "done" | "error";

export function CommissionRequestModal({ item, servicePrice, onClose }: CommissionRequestModalProps) {
  const isOpen = item !== null;
  const totalPrice = item && servicePrice !== null ? servicePrice + item.preco : null;
  useLockBodyScroll(isOpen);
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(isOpen, dialogRef, onClose);

  const [status, setStatus] = useState<Status>("form");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CommissionRequestResult | null>(null);

  function reset() {
    setStatus("form");
    setError(null);
    setResult(null);
  }

  function handleClose() {
    onClose();
    // Wait for the close transition before resetting the form state.
    window.setTimeout(reset, 300);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!item) return;

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    if (!name || !email) return;

    setStatus("submitting");
    setError(null);
    try {
      const res = await createCommissionRequest({
        product: item,
        customer: { name, email, phone: phone || undefined },
        message: message || undefined,
        quotedServicePrice: servicePrice ?? undefined,
        quotedTotalPrice: totalPrice ?? undefined,
      });
      setResult(res);
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
        aria-label="Commission this piece"
        aria-hidden={!isOpen}
        className={`fixed left-1/2 top-1/2 z-[120] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-sm bg-cream p-6 shadow-2xl transition-[opacity,transform] duration-300 sm:p-8 ${
          isOpen ? "-translate-y-1/2 opacity-100" : "-translate-y-[45%] opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 p-1 text-charcoal transition-transform hover:rotate-90"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {item && status !== "done" && (
          <>
            <p className="mb-1 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-warmgray">
              Commission Request
            </p>
            <h2 className="font-serif text-xl text-charcoal">{item.nome}</h2>
            {totalPrice !== null ? (
              <p className="mt-1 font-sans text-sm text-warmgray">
                {formatBRL(totalPrice)} · hand-printed piece, file included
              </p>
            ) : (
              <p className="mt-1 font-sans text-sm text-warmgray">Price to be confirmed</p>
            )}

            <p className="mt-4 font-sans text-[13px] leading-relaxed text-warmgray-dark">
              I'll hand-print and finish this design for you. The digital STL file itself is sold separately by
              its original creator — once we confirm your commission, you'll get a direct link to purchase it there.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="commission-name" className="mb-1.5 block font-sans text-[11px] uppercase tracking-wide text-warmgray">
                  Name
                </label>
                <input
                  id="commission-name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-sm border border-stone-dark bg-ivory px-3.5 py-2.5 font-sans text-sm text-charcoal outline-none focus:border-olive"
                />
              </div>
              <div>
                <label htmlFor="commission-email" className="mb-1.5 block font-sans text-[11px] uppercase tracking-wide text-warmgray">
                  Email
                </label>
                <input
                  id="commission-email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-sm border border-stone-dark bg-ivory px-3.5 py-2.5 font-sans text-sm text-charcoal outline-none focus:border-olive"
                />
              </div>
              <div>
                <label htmlFor="commission-phone" className="mb-1.5 block font-sans text-[11px] uppercase tracking-wide text-warmgray">
                  Phone (optional)
                </label>
                <input
                  id="commission-phone"
                  name="phone"
                  type="tel"
                  className="w-full rounded-sm border border-stone-dark bg-ivory px-3.5 py-2.5 font-sans text-sm text-charcoal outline-none focus:border-olive"
                />
              </div>
              <div>
                <label htmlFor="commission-message" className="mb-1.5 block font-sans text-[11px] uppercase tracking-wide text-warmgray">
                  Notes (optional)
                </label>
                <textarea
                  id="commission-message"
                  name="message"
                  rows={3}
                  placeholder="Size, finish, color, deadline…"
                  className="w-full resize-none rounded-sm border border-stone-dark bg-ivory px-3.5 py-2.5 font-sans text-sm text-charcoal outline-none focus:border-olive"
                />
              </div>

              {status === "error" && <p className="font-sans text-[13px] text-red-700">{error}</p>}

              <Button type="submit" className="w-full" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending…" : "Send commission request"}
              </Button>
            </form>
          </>
        )}

        {item && status === "done" && result && (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-olive/10">
              <Check size={22} strokeWidth={1.5} className="text-olive" />
            </div>
            <h2 className="font-serif text-xl text-charcoal">Request received</h2>
            <p className="mt-2 font-sans text-[13px] leading-relaxed text-warmgray-dark">
              Thank you — I'll be in touch shortly to confirm the commission. To secure your piece, you'll also
              need the STL file, sold directly by the original creator:
            </p>
            <a
              href={result.buyLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-olive hover:underline"
            >
              Buy the STL file
              <ExternalLink size={13} strokeWidth={1.5} />
            </a>
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="mt-6 w-full">
              Close
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
