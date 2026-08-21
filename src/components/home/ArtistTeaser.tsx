import { BotanicalEngraving } from "@/components/brand/BotanicalEngraving";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { TextLink } from "@/components/ui/TextLink";
import { editorialImages } from "@/lib/data/mock/images";

export function ArtistTeaser() {
  return (
    <section className="relative overflow-hidden bg-ivory section-generous">
      <PageContainer className="editorial-grid items-start">
        <Reveal className="col-span-4 sm:col-span-7 lg:col-span-7 lg:col-start-2 lg:row-start-1">
          <figure>
            <div className="aspect-[5/4] overflow-hidden sm:aspect-[4/3] lg:aspect-[7/6]">
              <img src={editorialImages.processHands} alt="Gloved hands finishing the paint on a devotional statue, brushes laid out nearby" loading="lazy" className="h-full w-full object-cover object-center" />
            </div>
            <figcaption className="type-caption mt-3 flex items-start justify-between gap-6 text-ink-muted">
              <span>The workshop, mid-process.</span><span aria-hidden="true">01 / Atelier notes</span>
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={120} className="col-span-4 mt-9 sm:col-span-6 sm:col-start-3 lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:mt-20">
          <SectionEyebrow tone="olive" className="mb-6">The Artist</SectionEyebrow>
          <EditorialHeading as="h2" size="heading-lg" className="max-w-[12ch] max-sm:text-[2.15rem]">A life shaped by faith, memory and the work of the hands.</EditorialHeading>
          <p className="type-body mt-7 max-w-[46ch] text-ink-muted">Jouber founded the atelier not as a business, but as a continuation — of altars remembered, processions attended, and a quiet conviction that devotional art should still be made the slow way. Every piece begins with him.</p>
          <TextLink to="/artist" className="mt-8 text-ink hover:text-gold">Read the Story</TextLink>
          <p className="mt-12 font-serif text-2xl italic text-ink">— Jouber</p>
        </Reveal>
      </PageContainer>
      <BotanicalEngraving className="absolute -bottom-10 -right-28 hidden w-[34rem] rotate-[7deg] opacity-[0.055] lg:block" />
    </section>
  );
}
