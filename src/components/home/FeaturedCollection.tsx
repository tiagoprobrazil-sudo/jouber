import { useEffect, useState } from "react";
import type { Product } from "@/lib/data/types";
import { getFeaturedProducts } from "@/lib/data/repository";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { TextLink } from "@/components/ui/TextLink";

/** A commercial showcase, not an editorial composition: every tile shares
 * the Shop grid's card, aspect ratio and rhythm, so a visitor reads this
 * section as "products for sale" at a glance, exactly like the Shop page
 * it leads into. Editorial asymmetry belongs to the atelier/story sections
 * only — see the "editorial to tell, grid to sell" rule in DESIGN_REFINEMENT_TASKS.md. */
export function FeaturedCollection() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const loading = products === null;

  useEffect(() => {
    getFeaturedProducts(6).then(setProducts);
  }, []);

  return (
    <section className="relative bg-ivory-dim section-generous">
      <PageContainer>
        <div className="editorial-grid items-end gap-y-8">
          <Reveal className="col-span-4 sm:col-span-6 lg:col-span-8">
            <div className="mb-6 flex items-center gap-4">
              <SectionNumber number={3} />
              <span className="h-px w-10 bg-stone-dark" aria-hidden="true" />
              <SectionEyebrow>The Collection</SectionEyebrow>
            </div>
            <EditorialHeading size="heading-lg" className="max-w-[13ch]">
              Selected Sacred Works
            </EditorialHeading>
          </Reveal>

          <Reveal className="col-span-4 sm:col-span-2 sm:justify-self-end lg:col-span-4" delay={80}>
            <TextLink to="/shop" className="text-charcoal hover:text-olive">
              View Collection
            </TextLink>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:mt-16 sm:gap-x-6 sm:gap-y-14 md:grid-cols-3 lg:mt-20 lg:gap-x-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products!.map((product, i) => (
                <Reveal key={product.id} delay={80 + i * 40}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
        </div>
      </PageContainer>
    </section>
  );
}
