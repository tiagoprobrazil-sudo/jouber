import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Review } from "@/lib/data/types";
import { getReviews } from "@/lib/data/repository";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { RatingStars } from "@/components/ui/RatingStars";
import { Reveal } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export function CollectorsReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    getReviews(6).then(setReviews);
  }, []);

  if (reviews.length === 0) return null;

  const index = activeIndex % reviews.length;
  const active = reviews[index];
  const selectPrevious = () => setActiveIndex((current) => (current - 1 + reviews.length) % reviews.length);
  const selectNext = () => setActiveIndex((current) => (current + 1) % reviews.length);

  return (
    <section className="bg-paper section-generous">
      <PageContainer>
        <Reveal className="editorial-grid items-end border-b border-ink/20 pb-8">
          <div className="col-span-4 sm:col-span-5 lg:col-span-7 lg:col-start-2">
            <SectionEyebrow tone="olive" className="mb-5">Testimonials</SectionEyebrow>
            <EditorialHeading as="h2" size="heading-lg">Collectors &amp; Devotees</EditorialHeading>
          </div>
          <div className="col-span-4 mt-7 flex items-center justify-between sm:col-span-3 sm:mt-0 lg:col-span-3 lg:col-start-10">
            <p className="type-caption tabular-nums text-ink-muted" aria-live="polite">
              {String(index + 1).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={selectPrevious} aria-label="Previous testimonial" className="grid size-11 place-items-center border border-ink/25 text-ink transition-colors hover:bg-ink hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button type="button" onClick={selectNext} aria-label="Next testimonial" className="grid size-11 place-items-center border border-ink/25 text-ink transition-colors hover:bg-ink hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Reveal>

        <div id="featured-testimonial" className="editorial-grid min-h-[11rem] content-center py-7 sm:min-h-[13rem] sm:py-9" aria-live="polite" aria-atomic="true">
          <div className="col-span-4 sm:col-span-7 sm:col-start-2 lg:col-span-8 lg:col-start-3" key={active.id}>
            <RatingStars rating={active.rating} className="mb-7" />
            <blockquote>
              <p className="type-heading-md max-w-[28ch] font-serif italic text-ink">“{active.text}”</p>
              <footer className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
                <cite className="type-eyebrow not-italic text-ink">{active.author}</cite>
                {active.location && <span className="type-caption text-ink-muted">{active.location}</span>}
              </footer>
            </blockquote>
          </div>
        </div>

        <ol className="grid border-t border-ink/20 sm:grid-cols-2 lg:grid-cols-3" aria-label="Choose a testimonial">
          {reviews.map((review, reviewIndex) => (
            <li key={review.id} className="border-b border-ink/15 sm:odd:border-r lg:border-r lg:nth-[3n]:border-r-0">
              <button
                type="button"
                onClick={() => setActiveIndex(reviewIndex)}
                aria-pressed={reviewIndex === index}
                aria-controls="featured-testimonial"
                className="group flex w-full items-start gap-4 px-2 py-5 text-left transition-colors hover:bg-ivory/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-gold sm:px-5"
              >
                <span className="type-caption pt-0.5 tabular-nums text-ink-muted">{String(reviewIndex + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-serif text-lg text-ink group-aria-pressed:text-olive">{review.author}</span>
                  {review.location && <span className="type-caption mt-1 block text-ink-muted">{review.location}</span>}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <ol className="sr-only" aria-label="All testimonial text">
          {reviews.map((review) => <li key={`${review.id}-transcript`}>{review.author}: {review.text}</li>)}
        </ol>
      </PageContainer>
    </section>
  );
}
