import { Link } from "react-router-dom";
import type { Product } from "@/lib/data/types";
import { Price } from "@/components/ui/Price";

const CATEGORY_LABELS: Record<string, string> = {
  statues: "Statue",
  "sacred-icons": "Sacred Icon",
  "our-lady": "Our Lady",
  saints: "Saints",
  "devotional-objects": "Devotional Object",
  "prints-wall-art": "Print",
  gifts: "Gift",
};

export function ProductCard({ product }: { product: Product }) {
  const primary = product.images[0];
  const secondary = product.images[1] ?? primary;
  const categoryLabel = CATEGORY_LABELS[product.categorySlugs[0]] ?? product.categorySlugs[0];

  return (
    <Link to={`/product/${product.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone">
        <img
          src={primary?.url}
          alt={primary?.alt ?? product.title}
          loading="lazy"
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
          className="h-full w-full object-cover transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none"
        />
        <img
          src={secondary?.url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:scale-100 motion-reduce:transition-none"
        />
        {product.compareAtPrice && (
          <span className="absolute left-3 top-3 bg-olive px-2.5 py-1 font-sans text-[10px] uppercase tracking-wide text-ivory">
            Sale
          </span>
        )}
      </div>
      <div className="mt-3.5 flex items-start justify-between gap-2">
        <div>
          <p className="font-serif text-[1.05rem] leading-snug text-charcoal">{product.title}</p>
          <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.14em] text-warmgray">{categoryLabel}</p>
        </div>
      </div>
      <Price price={product.price} compareAtPrice={product.compareAtPrice} className="mt-1.5" />
    </Link>
  );
}
