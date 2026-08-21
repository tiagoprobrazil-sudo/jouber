import { useEffect, useState } from "react";
import type { Product } from "@/lib/data/types";
import { getFeaturedProducts } from "@/lib/data/repository";
import {
  ProductArtworkCard,
  ProductArtworkCardSkeleton,
} from "@/components/shop/ProductArtworkCard";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { TextLink } from "@/components/ui/TextLink";

type ArtworkAspect = "landscape" | "portrait" | "square";

interface ArtworkSlotProps {
  aspect: ArtworkAspect;
  className?: string;
  delay: number;
  loading: boolean;
  product?: Product;
  scale?: "feature" | "standard";
}

function ArtworkSlot({ aspect, className, delay, loading, product, scale }: ArtworkSlotProps) {
  if (!loading && !product) return null;

  return (
    <Reveal className={className} delay={delay}>
      {product ? (
        <ProductArtworkCard product={product} aspect={aspect} scale={scale} />
      ) : (
        <ProductArtworkCardSkeleton aspect={aspect} />
      )}
    </Reveal>
  );
}

export function FeaturedCollection() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const loading = products === null;

  useEffect(() => {
    getFeaturedProducts(6).then(setProducts);
  }, []);

  return (
    <section className="relative bg-ivory-dim pb-20 pt-24 sm:pb-32 sm:pt-36 lg:pb-40 lg:pt-44">
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

        <div className="mt-12 flex flex-col gap-12 sm:mt-20 sm:grid sm:grid-cols-8 sm:items-start sm:gap-x-6 lg:mt-24 lg:grid-cols-12 lg:gap-x-8">
          <ArtworkSlot
            product={products?.[0]}
            loading={loading}
            aspect="landscape"
            scale="feature"
            delay={80}
            className="w-full sm:col-span-5 lg:col-span-7"
          />

          <div className="flex flex-col gap-12 sm:col-span-3 sm:gap-10 lg:col-span-4 lg:gap-16 lg:col-start-9">
            <ArtworkSlot
              product={products?.[1]}
              loading={loading}
              aspect="portrait"
              delay={140}
              className="w-[78%] self-start sm:w-full"
            />
            <ArtworkSlot
              product={products?.[2]}
              loading={loading}
              aspect="square"
              delay={190}
              className="w-[82%] self-end sm:w-full"
            />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-12 sm:mt-20 sm:grid sm:grid-cols-3 sm:items-start sm:gap-x-6 sm:gap-y-0 lg:mt-24 lg:grid-cols-12 lg:gap-x-8">
          <ArtworkSlot
            product={products?.[3]}
            loading={loading}
            aspect="portrait"
            delay={80}
            className="w-[82%] self-start sm:w-full sm:self-auto lg:col-span-3 lg:mt-16 lg:w-auto lg:self-start"
          />
          <ArtworkSlot
            product={products?.[4]}
            loading={loading}
            aspect="landscape"
            scale="feature"
            delay={140}
            className="w-full lg:col-span-6 lg:w-auto"
          />
          <ArtworkSlot
            product={products?.[5]}
            loading={loading}
            aspect="square"
            delay={200}
            className="w-[78%] self-end sm:w-full sm:self-auto lg:col-span-3 lg:mt-32 lg:w-auto lg:self-end"
          />
        </div>
      </PageContainer>
    </section>
  );
}
