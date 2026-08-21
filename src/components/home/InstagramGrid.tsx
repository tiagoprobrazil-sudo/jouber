import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { productImages } from "@/lib/data/mock/images";

/* Tile sizes are matched to each source photo's native resolution — the two
   lowest-resolution shots (480x640 and 360x640) get the smallest slots so
   nothing is enlarged past what the source can support. */
const TILES = [
  { src: productImages.ourLady10PearlGold1, alt: "Pearl and gold Our Lady of Aparecida statue", className: "col-span-4 row-span-5 sm:col-span-5 sm:row-span-6 lg:col-span-5 lg:row-span-7" },
  { src: productImages.saintGeorgePoster1, alt: "Framed Saint George devotional artwork", className: "col-span-2 row-span-3 sm:col-span-3 sm:row-span-4 lg:col-span-3 lg:row-span-4" },
  { src: productImages.ourLadyShrineBox1, alt: "Our Lady of Aparecida shrine box", className: "col-span-2 row-span-4 sm:col-span-3 sm:row-span-5 lg:col-span-4 lg:row-span-5" },
  { src: productImages.ourLady11Pink1, alt: "Pink and gold Our Lady of Aparecida statue", className: "col-span-2 row-span-4 sm:col-span-4 sm:row-span-5 lg:col-span-3 lg:row-span-5" },
  { src: productImages.archangelCanvas1, alt: "Painted Archangel Michael devotional canvas", className: "col-span-4 row-span-4 sm:col-span-4 sm:row-span-5 lg:col-span-6 lg:row-span-6" },
  { src: productImages.ourLady11Metallic2, alt: "Metallic blue Our Lady of Aparecida statue detail", className: "col-span-2 row-span-3 sm:col-span-3 sm:row-span-4 lg:col-span-3 lg:row-span-4" },
  { src: productImages.sacredPlaque1, alt: "Hand-finished sacred art plaque", className: "col-span-2 row-span-4 sm:col-span-3 sm:row-span-5 lg:col-span-4 lg:row-span-5" },
  { src: productImages.ourLadyPrintII2, alt: "Devotional artwork photographed among roses", className: "col-span-4 row-span-4 sm:col-span-5 sm:row-span-5 lg:col-span-5 lg:row-span-5" },
];

const INSTAGRAM_URL = "https://www.instagram.com/ateliersaintsebastian";

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

        <div className="grid auto-rows-[3.75rem] grid-flow-dense grid-cols-4 gap-2 sm:auto-rows-[5rem] sm:grid-cols-8 sm:gap-3 lg:grid-cols-12 lg:gap-4">
          {TILES.map((tile, index) => (
            <Reveal key={tile.src} delay={index * 45} className={tile.className}>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open Atelier Saint Sebastian on Instagram: ${tile.alt}`}
                className="group relative block h-full overflow-hidden bg-stone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <img
                  src={tile.src}
                  alt={tile.alt}
                  loading="lazy"
                  sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 42vw"
                  className="h-full w-full object-cover transition-transform duration-[var(--motion-image)] ease-[var(--ease-editorial)] group-hover:scale-[1.025] group-focus-visible:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100"
                />
                <span className="type-caption absolute bottom-3 right-3 grid size-8 place-items-center bg-charcoal/80 text-ivory opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
