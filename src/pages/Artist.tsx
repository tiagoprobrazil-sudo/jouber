import { CrownMark } from "@/components/brand/CrownMark";
import { SeoHead } from "@/components/layout/SeoHead";
import { ButtonLink } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { editorialImages } from "@/lib/data/mock/images";

export default function Artist() {
  return (
    <>
      <SeoHead title="The Artist" description="Meet Jouber, the artist behind Atelier Saint Sebastian — a story of faith, ancestry, memory and the work of the hands." path="/artist" />

      <section className="relative min-h-[56svh] overflow-hidden bg-charcoal text-ivory sm:min-h-[64svh]">
        <div className="absolute inset-y-0 right-0 w-full sm:w-[76%] lg:w-[70%]">
          <img src={editorialImages.statueGroup} alt="Three finished devotional statues from Atelier Saint Sebastian, together on a table" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/25 to-transparent sm:from-charcoal/90 sm:via-charcoal/10" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/10" aria-hidden="true" />
        </div>
        <PageContainer className="editorial-grid relative min-h-[56svh] content-end pb-10 pt-28 sm:min-h-[64svh] sm:pb-16">
          <div className="col-span-4 sm:col-span-7 lg:col-span-8 lg:col-start-2">
            <SectionEyebrow tone="light" className="mb-7">Atelier portrait / The work</SectionEyebrow>
            <EditorialHeading as="h1" size="display-xl" tone="light" className="max-w-[8ch]">The Artist</EditorialHeading>
          </div>
          <p className="type-caption col-span-4 mt-8 text-stone/70 sm:col-span-3 sm:col-start-6 lg:col-span-3 lg:col-start-9">Finished devotional works in the atelier.</p>
        </PageContainer>
      </section>

      <article className="relative overflow-hidden bg-paper section-generous">
        <PageContainer className="editorial-grid items-start">
          <SectionNumber number={1} className="col-span-1 hidden lg:block lg:row-start-1" />
          <div className="col-span-4 sm:col-span-6 sm:col-start-2 lg:col-span-7 lg:col-start-3 lg:row-start-1">
            <Reveal><p className="type-heading-md max-w-[29ch] font-serif text-ink">My name is Jouber, and Atelier Saint Sebastian was born from a deep connection between faith, art, ancestry, and devotion.</p></Reveal>
            <Reveal delay={80}><p className="type-body mt-8 max-w-[60ch] text-ink-muted">Since I was young, sacred imagery has always spoken to me — not simply as decoration, but as presence, comfort, memory, and spiritual connection. Through this atelier, I create handcrafted devotional art designed to bring beauty, prayer, protection, and meaning into everyday spaces.</p></Reveal>
          </div>
          <CrownMark className="col-span-1 col-start-12 mt-4 hidden w-16 opacity-20 lg:block lg:row-start-1" />

          <Reveal delay={120} className="col-span-4 mt-16 sm:col-span-7 sm:mt-20 lg:col-span-8 lg:col-start-2 lg:row-start-2 lg:mt-28">
            <figure><div className="aspect-[4/3] overflow-hidden sm:aspect-[8/5]"><img src={editorialImages.processHands} alt="Gloved hands finishing the paint on a devotional statue, brushes laid out nearby" loading="lazy" className="h-full w-full object-cover" /></div><figcaption className="type-caption mt-3 text-ink-muted">The workshop, mid-process.</figcaption></figure>
          </Reveal>

          <SectionNumber number={2} className="col-span-1 col-start-11 mt-28 hidden lg:block lg:row-start-3" />
          <Reveal className="col-span-4 mt-16 sm:col-span-6 sm:col-start-3 sm:mt-20 lg:col-span-6 lg:col-start-6 lg:row-start-3 lg:mt-28">
            <EditorialHeading as="h2" size="heading-md">Made with intention</EditorialHeading>
            <p className="type-body mt-6 text-ink-muted">Each piece is individually handmade and hand-finished with great care, inspired by Catholic tradition, sacred symbolism, and the spiritual richness found across different paths of faith and devotion. From saints and sacred icons to devotional décor, every work is created with intention, respect, and reverence.</p>
            <p className="type-body mt-5 text-ink-muted">I believe sacred art should feel personal. For this reason, many of my creations can be personalized through colors, finishes, embellishments, and meaningful details — helping transform each piece into something deeply connected to the spiritual journey of the person receiving it.</p>
          </Reveal>

          <Reveal delay={80} className="col-span-4 mt-16 sm:col-span-7 sm:col-start-2 sm:mt-20 lg:col-span-7 lg:col-start-5 lg:row-start-4 lg:mt-28">
            <figure><div className="aspect-[4/3] overflow-hidden sm:aspect-[7/5]"><img src={editorialImages.devotionalPresence} alt="A devotional statue, candlelit, with a stained-glass Sacred Heart behind" loading="lazy" className="h-full w-full object-cover object-[62%_center]" /></div><figcaption className="type-caption mt-3 text-ink-muted">Devotional work as presence.</figcaption></figure>
          </Reveal>

          <SectionNumber number={3} className="col-span-1 mt-28 hidden lg:block lg:row-start-5" />
          <Reveal className="col-span-4 mt-16 sm:col-span-6 sm:col-start-2 sm:mt-20 lg:col-span-6 lg:col-start-3 lg:row-start-5 lg:mt-28">
            <EditorialHeading as="h2" size="heading-md">Why the hand still matters</EditorialHeading>
            <p className="type-body mt-6 text-ink-muted">At Atelier Saint Sebastian, I do not simply create religious décor; I create devotional pieces meant to accompany prayer, reflection, healing, remembrance, and moments of faith inside the home.</p>
            <p className="type-body mt-5 text-ink-muted">Every piece carries time, craftsmanship, and care. Because they are handmade, no two are ever exactly alike, making each creation unique. I hope that through this work, I can share more than art: a sense of comfort, devotion, beauty, and sacred presence.</p>
          </Reveal>

          <Reveal className="col-span-4 mt-20 border-t border-ink/20 pt-8 sm:col-span-6 sm:col-start-3 lg:col-span-5 lg:col-start-7 lg:row-start-6 lg:mt-28">
            <p className="type-body text-ink-muted">Thank you for supporting handmade sacred art.</p>
            <p className="mt-6 font-serif text-3xl italic text-ink">Jouber</p>
            <p className="type-eyebrow mt-2 text-ink-muted">Founder &amp; Artist, Atelier Saint Sebastian</p>
            <ButtonLink to="/shop" variant="secondary" size="sm" className="mt-8">Explore the Collection</ButtonLink>
          </Reveal>
        </PageContainer>
      </article>
    </>
  );
}
