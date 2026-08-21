import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/lib/data/types";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/utils/cn";

const CATEGORY_LABELS: Record<string, string> = {
  statues: "Statue",
  "sacred-icons": "Sacred Icon",
  "our-lady": "Our Lady",
  saints: "Saints",
  "devotional-objects": "Devotional Object",
  "prints-wall-art": "Print",
  gifts: "Gift",
};

interface ProductCardProps {
  product: Product;
  className?: string;
}

/** The single commercial product card used across Shop and Home. Every
 * instance shares the same aspect ratio, type scale and hover language —
 * the grid, not the card, is what should ever change.
 *
 * Note: the primary/secondary photo crossfade below is a deliberate
 * exception to the site's usual `motion-reduce:` convention (client
 * request) — it always animates, even for visitors whose OS/browser
 * requests reduced motion, so the photo swap never reads as an abrupt
 * cut. Every other transition on the site still honors that preference. */
export function ProductCard({ product, className }: ProductCardProps) {
  const primary = product.images[0];
  const secondary = product.images[1] ?? primary;
  const categoryLabel = CATEGORY_LABELS[product.categorySlugs[0]] ?? product.categorySlugs[0];

  return (
    <Link
      to={`/product/${product.slug}`}
      className={cn(
        "group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-stone">
        <img
          src={primary?.url}
          alt={primary?.alt ?? product.title}
          loading="lazy"
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
          className="h-full w-full object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:opacity-0 group-focus-visible:scale-[1.03] group-focus-visible:opacity-0"
        />
        <img
          src={secondary?.url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
          className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-focus-visible:opacity-100"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span className="pointer-events-none absolute bottom-3.5 left-3.5 hidden translate-y-2 items-center gap-1.5 rounded-sm font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-ivory opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:inline-flex">
          View Piece
          <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.5} />
        </span>

        {product.compareAtPrice && (
          <span className="absolute left-3 top-3 rounded-sm bg-olive px-2.5 py-1 font-sans text-[10px] uppercase tracking-wide text-ivory">
            Sale
          </span>
        )}
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-warmgray">
            {categoryLabel}
          </p>
          <p className="truncate font-serif text-[1.05rem] leading-snug text-charcoal">{product.title}</p>
        </div>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} className="shrink-0 pt-[1.55rem]" />
      </div>
    </Link>
  );
}
