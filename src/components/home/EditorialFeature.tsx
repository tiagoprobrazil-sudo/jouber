import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { editorialImages } from "@/lib/data/mock/images";
import { useSiteContent } from "@/lib/data/siteContent";
import frameSide from "@/assets/brand/ornaments/frame-side.webp";

export function EditorialFeature() {
  const content = useSiteContent("editorialFeature");

  return (
    <section className="home-campaign relative min-h-[40rem] overflow-hidden bg-charcoal text-ivory sm:min-h-[44rem]">
      <div className="absolute inset-0 sm:left-[12%] lg:left-[18%]">
        <img
          src={editorialImages.devotionalPresence}
          alt="A devotional statue of Our Lady, candlelit, with a stained-glass Sacred Heart behind"
          loading="lazy"
          className="h-full w-full object-cover object-[68%_center] sm:object-[64%_center] lg:object-[58%_center]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/35 to-transparent sm:from-charcoal/95 sm:via-charcoal/20 sm:to-charcoal/5"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-charcoal/15 sm:from-charcoal/75"
          aria-hidden="true"
        />
      </div>

      <img
        src={frameSide}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute -right-24 top-[6%] hidden h-[88%] w-auto max-w-none opacity-[0.045] mix-blend-luminosity lg:block"
      />

      <PageContainer className="editorial-grid relative z-10 min-h-[40rem] content-end pb-12 pt-28 sm:min-h-[44rem] sm:content-center sm:pb-16 sm:pt-32">
        <Reveal className="col-span-4 sm:col-span-7 lg:col-span-9 lg:col-start-2">
          <SectionEyebrow tone="light" className="mb-6 sm:mb-8 lg:ml-[11%]">
            {content.eyebrow}
          </SectionEyebrow>

          <EditorialHeading as="h2" size="display-lg" tone="light" className="max-w-[12ch]">
            {content.headlineLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </EditorialHeading>

          <div className="mt-8 border-t border-ivory/25 pt-6 sm:ml-[43%] sm:mt-10 sm:max-w-xs lg:ml-[56%]">
            <p className="type-caption mb-5 max-w-[28ch] text-stone/75">{content.caption}</p>
            <ButtonLink to="/shop/our-lady" variant="ghost" className="!text-ivory hover:!text-gold-soft">
              {content.ctaLabel}
            </ButtonLink>
          </div>
        </Reveal>
      </PageContainer>
    </section>
  );
}
