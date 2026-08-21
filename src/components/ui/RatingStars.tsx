import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={1.5}
          className={i < Math.round(rating) ? "fill-gold text-gold" : "text-stone-dark"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
