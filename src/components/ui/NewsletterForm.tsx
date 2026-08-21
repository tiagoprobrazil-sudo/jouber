import { useId, useState, type FormEvent } from "react";
import { subscribeToNewsletter } from "@/lib/data/repository";
import { cn } from "@/lib/utils/cn";

interface NewsletterFormProps {
  variant?: "light" | "dark";
  className?: string;
}

export function NewsletterForm({ variant = "light", className }: NewsletterFormProps) {
  const fieldId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await subscribeToNewsletter(email.trim());
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  const dark = variant === "dark";

  if (status === "done") {
    return (
      <p role="status" className={cn("font-sans text-sm", dark ? "text-stone" : "text-olive", className)}>
        Thank you — you're on the list.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex w-full max-w-sm flex-wrap items-end gap-x-3", className)}>
      <div className="flex-1">
        <label htmlFor={fieldId} className="sr-only">
          Email address
        </label>
        <input
          id={fieldId}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          aria-describedby={status === "error" ? `${fieldId}-error` : undefined}
          aria-invalid={status === "error"}
          className={cn(
            "w-full border-b bg-transparent py-2 font-sans text-sm placeholder:text-current/50 focus:outline-none",
            dark ? "border-white/25 text-ivory placeholder:text-stone/60" : "border-warmgray text-charcoal",
          )}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "shrink-0 border-b pb-2 font-sans text-xs uppercase tracking-[0.16em] transition-colors disabled:opacity-50",
          dark ? "border-white/25 text-ivory hover:text-gold-soft" : "border-warmgray text-charcoal hover:text-olive",
        )}
      >
        {status === "loading" ? "Sending…" : "Subscribe"}
      </button>
      {status === "error" && (
        <p id={`${fieldId}-error`} role="alert" className={cn("mt-2 w-full basis-full font-sans text-xs", dark ? "text-stone" : "text-olive")}>
          We could not subscribe you. Please try again.
        </p>
      )}
    </form>
  );
}
