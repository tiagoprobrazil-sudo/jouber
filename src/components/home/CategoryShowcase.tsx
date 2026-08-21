import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { categoryTeaserImages } from "@/lib/data/mock/images";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SectionNumber } from "@/components/ui/SectionNumber";

interface CategoryTile {
  slug: string;
  name: string;
  description: string;
  image: string;
}

const TILES: CategoryTile[] = [
  {
    slug: "statues",
    name: "Statues",
    description: "Sacred figures cast and finished individually by hand.",
    image: categoryTeaserImages.statues,
  },
  {
    slug: "sacred-icons",
    name: "Sacred Icons",
    description: "Traditional devotional imagery, painted for the wall or the altar.",
    image: categoryTeaserImages.sacredIcons,
  },
  {
    slug: "devotional-objects",
    name: "Devotional Objects",
    description: "Objects made for prayer and the home altar.",
    image: categoryTeaserImages.devotionalObjects,
  },
];

/** The collection index: a short, wholly commercial bridge from the "vitrine"
 * above into the Shop, communicating that the catalogue is organised and
 * browsable — not a single undifferentiated feed of products. */
export function CategoryShowcase() {
  return (
    <section className="relative bg-ivory section-standard">
      <PageContainer>
        <Reveal className="mb-10 flex items-center gap-4 sm:mb-14">
          <SectionNumber number={4} />
          <span className="h-px w-10 bg-stone-dark" aria-hidden="true" />
          <SectionEyebrow>Browse by Collection</SectionEyebrow>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {TILES.map((tile, i) => (
            <Reveal key={tile.slug} delay={80 + i * 60}>
              <Link to={`/shop/${tile.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive">
                <div className="relative aspect-[4/5] overflow-hidden bg-stone sm:aspect-[3/4]">
                  <img
                    src={tile.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/15 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <EditorialHeading as="h3" size="heading-md" tone="light">
                      {tile.name}
                    </EditorialHeading>
                    <p className="mt-2 max-w-[26ch] font-sans text-[13px] leading-relaxed text-stone/85">
                      {tile.description}
                    </p>
                    <span className="link-underline mt-4 inline-flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-[0.14em] text-ivory">
                      Explore
                      <ArrowRight
                        aria-hidden="true"
                        size={13}
                        strokeWidth={1.5}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
