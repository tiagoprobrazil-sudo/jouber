import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

interface ReviewFormValues {
  rating: number;
  text: string;
  authorName: string;
  email?: string;
}

interface ReviewFormProps {
  onSubmit: (values: ReviewFormValues) => Promise<void>;
  /** Shown for the open (unverified) path on the product page — a verified-purchase submission already has the email from the order. */
  showEmail?: boolean;
}

export function ReviewForm({ onSubmit, showEmail = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please choose a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ rating, text, authorName, email: showEmail ? email : undefined });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p className="border border-stone-dark bg-ivory-dim p-4 font-sans text-sm text-warmgray-dark">
        Thank you — your review has been submitted and will appear once it's reviewed.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-1.5 font-sans text-xs uppercase tracking-wide text-warmgray">Your rating</p>
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              className="p-0.5"
            >
              <Star
                size={22}
                strokeWidth={1.5}
                className={cn(n <= (hoverRating || rating) ? "fill-gold text-gold" : "text-stone-dark")}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-name" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
          Your name
        </label>
        <input
          id="review-name"
          type="text"
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full border border-stone-dark bg-transparent px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
        />
      </div>

      {showEmail && (
        <div>
          <label htmlFor="review-email" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
            Email (optional)
          </label>
          <input
            id="review-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-stone-dark bg-transparent px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
          />
        </div>
      )}

      <div>
        <label htmlFor="review-text" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
          Your review
        </label>
        <textarea
          id="review-text"
          rows={4}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-stone-dark bg-transparent px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
        />
      </div>

      {error && <p className="font-sans text-sm text-red-700">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
