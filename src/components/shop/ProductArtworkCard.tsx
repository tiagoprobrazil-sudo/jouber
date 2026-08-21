import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";
import { Price } from "@/components/ui/Price";
import { Skeleton } from "@/components/ui/Skeleton";

type ArtworkAspect = "landscape" | "portrait" | "square";
type ArtworkScale = "feature" | "standard";

interface ProductArtworkCardProps {
  aspect?: ArtworkAspect;
  className?: string;
  product: Product;
  scale?: ArtworkScale;
}

const CATEGORY_LABELS: Record<string, string> = {
  statues: "Statue",
  "sacred-icons": "Sacred Icon",
  "our-lady": "Our Lady",
  saints: "Saints",
  "devotional-objects": "Devotional Object",
  "prints-wall-art": "Print",
  gifts: "Gift",
};

const aspects: Record<ArtworkAspect, string> = {
  landscape: "aspect-[5/4]",
  portrait: "aspect-[4/5]",
  square: "aspect-square",
};

export function ProductArtworkCard({
  aspect = "portrait",
  className,
  product,
  scale = "standard",
}: ProductArtworkCardProps) {
  const primary = product.images[0];
  const secondary = product.images[1] ?? primary;
  const categoryLabel = CATEGORY_LABELS[product.categorySlugs[0]] ?? product.categorySlugs[0];

  return (
    <Link to={`/product/${product.slug}`} className={cn("group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive", className)}>
      <div className={cn("relative overflow-hidden bg-stone", aspects[aspect])}>
        <img
          src={primary?.url}
          alt={primary?.alt ?? product.title}
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 62vw, 48vw"
          className="editorial-image transition-[opacity,transform] duration-[var(--motion-image)] ease-[var(--ease-editorial)] group-hover:scale-[1.02] group-hover:opacity-0 group-focus-visible:scale-[1.02] group-focus-visible:opacity-0 motion-reduce:transition-none"
        />
        <img
          src={secondary?.url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 62vw, 48vw"
          className="editorial-image absolute inset-0 scale-[1.015] opacity-0 transition-[opacity,transform] duration-[var(--motion-image)] ease-[var(--ease-editorial)] group-hover:scale-[1.03] group-hover:opacity-100 group-focus-visible:scale-[1.03] group-focus-visible:opacity-100 motion-reduce:transition-none"
        />

        <span className="absolute bottom-4 left-4 hidden translate-y-2 items-center gap-2 bg-charcoal/90 px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-ivory opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:inline-flex">
          View Work
          <ArrowUpRight aria-hidden="true" size={13} strokeWidth={1.5} />
        </span>

        {product.compareAtPrice && (
          <span className="absolute right-3 top-3 bg-olive px-2.5 py-1 font-sans text-[10px] uppercase tracking-[0.12em] text-ivory">
            Sale
          </span>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            className={cn(
              "font-serif leading-[1.15] text-charcoal transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none",
              scale === "feature" ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl",
            )}
          >
            {product.title}
          </h3>
          <p className="mt-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-warmgray">
            {categoryLabel}
          </p>
        </div>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} className="shrink-0" />
      </div>
    </Link>
  );
}

export function ProductArtworkCardSkeleton({ aspect = "portrait" }: { aspect?: ArtworkAspect }) {
  return (
    <div className="space-y-4">
      <Skeleton className={cn("w-full", aspects[aspect])} />
      <div className="flex items-start justify-between gap-6">
        <div className="w-2/3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
