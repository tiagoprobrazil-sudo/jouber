import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { productImages } from "@/lib/data/mock/images";

const TILES = [
  { src: productImages.ourLady10PearlGold1, alt: "Pearl and gold Our Lady of Aparecida statue" },
  { src: productImages.saintGeorgePoster1, alt: "Framed Saint George devotional artwork" },
  { src: productImages.ourLadyShrineBox1, alt: "Our Lady of Aparecida shrine box" },
  { src: productImages.ourLady11Pink1, alt: "Pink and gold Our Lady of Aparecida statue" },
  { src: productImages.archangelCanvas1, alt: "Painted Archangel Michael devotional canvas" },
  { src: productImages.ourLady11Metallic2, alt: "Metallic blue Our Lady of Aparecida statue detail" },
  { src: productImages.sacredPlaque1, alt: "Hand-finished sacred art plaque" },
  { src: productImages.ourLadyPrintII2, alt: "Devotional artwork photographed among roses" },
];

const INSTAGRAM_URL = "https://www.instagram.com/ateliersaintsebastian";

/** A uniform square feed, deliberately matching how Instagram's own grid
 * reads, rather than a variable-tile mosaic — a curated photo wall should
 * feel evenly aligned, not like a puzzle of different-sized pieces. */
export function InstagramGrid() {
  return (
    <section className="bg-ivory section-generous">
      <PageContainer>
        <Reveal className="editorial-grid mb-12 items-end sm:mb-16">
          <div className="col-span-4 sm:col-span-6 lg:col-span-7 lg:col-start-2">
            <SectionEyebrow tone="olive" className="mb-5">Atelier Wall</SectionEyebrow>
            <EditorialHeading as="h2" size="heading-lg">Follow the Atelier</EditorialHeading>
          </div>
          <div className="col-span-4 mt-7 sm:col-span-2 sm:mt-0 lg:col-span-3 lg:col-start-10">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="link-underline inline-flex items-center gap-2 font-sans text-sm text-ink-muted transition-colors hover:text-olive"
              aria-label="Open the Atelier Saint Sebastian profile on Instagram"
            >
              <InstagramIcon size={16} strokeWidth={1.5} aria-hidden="true" />
              @ateliersaintsebastian
            </a>
            <p className="type-caption mt-3 text-ink-muted">Images link to the atelier profile.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-1.5 lg:grid-cols-4 lg:gap-2">
          {TILES.map((tile, index) => (
            <Reveal key={tile.src} delay={index * 45}>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open Atelier Saint Sebastian on Instagram: ${tile.alt}`}
                className="group relative block aspect-square overflow-hidden bg-stone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <img
                  src={tile.src}
                  alt={tile.alt}
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="h-full w-full object-cover transition-transform duration-[var(--motion-image)] ease-[var(--ease-editorial)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center justify-center bg-charcoal/0 opacity-0 transition-[background-color,opacity] duration-300 group-hover:bg-charcoal/30 group-hover:opacity-100 group-focus-visible:bg-charcoal/30 group-focus-visible:opacity-100"
                >
                  <InstagramIcon size={20} strokeWidth={1.5} className="text-ivory" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
