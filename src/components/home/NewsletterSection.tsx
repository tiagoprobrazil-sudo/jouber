import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { PageContainer } from "@/components/ui/PageContainer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { editorialImages } from "@/lib/data/mock/images";

export function NewsletterSection() {
  return (
    <section className="overflow-hidden border-t border-ink/15 bg-ivory-dim section-generous">
      <PageContainer className="editorial-grid items-center">
        <Reveal className="col-span-4 sm:col-span-6 sm:col-start-2 lg:col-span-6 lg:col-start-2">
          <SectionEyebrow tone="olive" className="mb-6">The Atelier Letter</SectionEyebrow>
          <EditorialHeading as="h2" size="heading-lg" className="max-w-[11ch]">Stay close to the Atelier</EditorialHeading>
          <p className="type-body mt-6 max-w-[38ch] text-ink-muted">Receive new works, stories and updates from the atelier.</p>
          <NewsletterForm className="mt-9 sm:max-w-md" />
          <p className="type-caption mt-5 text-ink-muted">Occasional notes from the workshop.</p>
        </Reveal>

        <Reveal delay={120} className="col-span-3 col-start-2 mt-14 sm:col-span-4 sm:col-start-5 lg:col-span-3 lg:col-start-9 lg:mt-0">
          <figure>
            <div className="aspect-[3/4] overflow-hidden">
              <img src={editorialImages.artistPortraitPiece} alt="A finished devotional statue of Our Lady of Aparecida, set among white roses" loading="lazy" className="h-full w-full object-cover object-[center_30%]" />
            </div>
            <figcaption className="type-caption mt-3 flex justify-between gap-4 text-ink-muted">
              <span>Atelier portrait</span><span aria-hidden="true">Letter / 01</span>
            </figcaption>
          </figure>
        </Reveal>
      </PageContainer>
    </section>
  );
}
