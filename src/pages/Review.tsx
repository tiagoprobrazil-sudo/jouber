import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { SeoHead } from "@/components/layout/SeoHead";
import { PageLoader } from "@/components/layout/PageLoader";
import { ReviewForm } from "@/components/product/ReviewForm";
import { getReviewRequest, submitReview, type ReviewRequestInfo } from "@/lib/reviews";

export default function Review() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<ReviewRequestInfo | null | undefined>(undefined);

  useEffect(() => {
    if (!token) return;
    getReviewRequest(token)
      .then(setInfo)
      .catch(() => setInfo(null));
  }, [token]);

  if (info === undefined) return <PageLoader />;

  return (
    <>
      <SeoHead title="Write a Review" description="Share your experience with your piece from Atelier Saint Sebastian." path="/review" />
      <div className="container-editorial max-w-xl pt-32 pb-24 sm:pt-40">
        {!info ? (
          <div className="text-center">
            <h1 className="font-serif text-3xl text-charcoal">This link isn't valid</h1>
            <p className="mt-3 font-sans text-sm text-warmgray-dark">
              It may have expired or already been used. You can still write a review from any product page.
            </p>
            <Link to="/shop" className="mt-6 inline-block font-sans text-sm text-olive underline-offset-2 hover:underline">
              Browse the collection
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">How was your piece?</h1>
            <div className="mt-4 flex items-center gap-3">
              {info.productImage && (
                <img src={info.productImage} alt="" className="h-16 w-14 shrink-0 border border-stone-dark object-cover" />
              )}
              <div>
                <Link to={`/product/${info.productSlug}`} className="font-serif text-lg text-charcoal hover:text-olive">
                  {info.productTitle}
                </Link>
                <p className="font-sans text-xs text-warmgray">Verified purchase</p>
              </div>
            </div>

            {info.alreadyReviewed ? (
              <p className="mt-8 flex items-start gap-3 border border-stone-dark bg-ivory-dim p-4 font-sans text-sm text-warmgray-dark">
                <CheckCircle2 size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-olive" />
                You've already reviewed this piece — thank you.
              </p>
            ) : (
              <div className="mt-8">
                <ReviewForm onSubmit={(values) => submitReview({ ...values, token })} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
