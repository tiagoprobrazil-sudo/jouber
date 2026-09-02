import { useEffect, useState } from "react";
import { Check, X, ShieldCheck } from "lucide-react";
import type { Review } from "@/lib/data/types";
import { getPendingReviews, moderateReview } from "@/lib/data/repository";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate } from "@/lib/utils/format";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function reload() {
    getPendingReviews().then(setReviews);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleModerate(review: Review, status: "approved" | "rejected") {
    setBusyId(review.id);
    try {
      await moderateReview(review.id, status);
      setReviews((list) => list?.filter((r) => r.id !== review.id) ?? null);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-admin-ink">Reviews</h1>
      <p className="mt-1 font-sans text-sm text-admin-muted">Pending reviews awaiting approval before they appear on the site.</p>

      <div className="mt-8 space-y-4">
        {reviews === null ? (
          <p className="font-sans text-sm text-admin-muted">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="font-sans text-sm text-admin-muted">No reviews waiting for approval.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border border-admin-border bg-admin-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={r.rating} />
                    <span className="font-sans text-sm text-admin-ink">{r.author}</span>
                    {r.isVerifiedPurchase && (
                      <span className="flex items-center gap-1 font-sans text-[11px] uppercase tracking-wide text-olive">
                        <ShieldCheck size={12} strokeWidth={1.5} />
                        Verified purchase
                      </span>
                    )}
                  </div>
                  {r.email && <p className="mt-0.5 font-sans text-xs text-admin-muted">{r.email}</p>}
                  <p className="mt-0.5 font-sans text-xs text-admin-muted">{formatDate(r.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleModerate(r, "approved")}
                    disabled={busyId === r.id}
                    aria-label="Approve"
                    className="flex items-center gap-1.5 border border-olive px-3 py-1.5 font-sans text-xs uppercase tracking-wide text-olive hover:bg-olive hover:text-ivory disabled:opacity-50"
                  >
                    <Check size={13} strokeWidth={1.5} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModerate(r, "rejected")}
                    disabled={busyId === r.id}
                    aria-label="Reject"
                    className="flex items-center gap-1.5 border border-admin-border px-3 py-1.5 font-sans text-xs uppercase tracking-wide text-admin-muted hover:border-red-700 hover:text-red-700 disabled:opacity-50"
                  >
                    <X size={13} strokeWidth={1.5} />
                    Reject
                  </button>
                </div>
              </div>
              <p className="mt-3 font-sans text-sm text-admin-ink">{r.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
