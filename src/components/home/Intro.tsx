import { CrownMark } from "@/components/brand/CrownMark";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { editorialImages } from "@/lib/data/mock/images";

export function Intro() {
  return (
    <section className="relative z-10 overflow-visible bg-ivory py-20 sm:py-28 lg:py-40">
      <PageContainer className="editorial-grid relative items-start gap-y-0">
        <Reveal className="col-span-4 flex items-center gap-4 sm:col-span-8 lg:col-span-4 lg:col-start-2 lg:row-start-1">
          <SectionNumber number={2} />
          <span className="h-px w-10 bg-stone-dark" aria-hidden="true" />
          <SectionEyebrow>The Atelier</SectionEyebrow>
        </Reveal>

        <Reveal
          delay={70}
          className="relative z-20 col-span-4 mt-7 sm:col-span-8 sm:mt-9 lg:col-span-8 lg:col-start-2 lg:row-start-2 lg:mt-12"
        >
          <EditorialHeading size="heading-lg" className="max-w-[10ch] lg:max-w-[12ch]">
            Art created with devotion.
          </EditorialHeading>
        </Reveal>

        <Reveal
          delay={120}
          className="relative col-span-4 mt-10 sm:col-span-7 sm:col-start-2 lg:col-span-6 lg:col-start-7 lg:row-span-3 lg:row-start-1 lg:mt-0"
        >
          <figure>
            <div className="aspect-[4/5] overflow-hidden bg-stone">
              <img
                src={editorialImages.processHands}
                alt="Gloved hands finishing the paint on a devotional statue, brushes laid out nearby"
                loading="lazy"
                className="editorial-image object-[center_38%]"
              />
            </div>
            <figcaption className="mt-3 flex items-center justify-between gap-4 font-sans text-[11px] leading-relaxed text-warmgray">
              <span>The workshop, mid-process.</span>
              <span className="uppercase tracking-[0.16em]">Hand finished</span>
            </figcaption>
          </figure>
        </Reveal>

        <Reveal
          delay={160}
          className="col-span-4 mt-9 sm:col-span-6 sm:col-start-2 lg:col-span-4 lg:col-start-2 lg:row-start-3 lg:mt-14"
        >
          <div className="measure-copy-narrow space-y-5 text-warmgray-dark">
            <p className="type-body-lg">
              Every piece that leaves the atelier is shaped and finished by hand — cast, painted in layers, and gilded
              with restraint. It is work born from a long relationship between art, faith, ancestry and devotion,
              carried forward one statue, one icon, one prayer candle at a time.
            </p>
            <p className="type-body">
              Nothing here is mass-produced. Small variations in paint and gilding are not corrected — they are the
              mark of the hand that made it.
            </p>
          </div>

          <p className="type-caption mt-10 uppercase tracking-[0.16em] text-olive">
            Devotional Art / Hand Finished
          </p>
        </Reveal>
      </PageContainer>

      <CrownMark className="absolute -bottom-4 -left-6 z-20 w-32 opacity-[0.08] sm:-bottom-6 sm:w-40 lg:bottom-0 lg:left-[4%] lg:w-48" />
    </section>
  );
}
