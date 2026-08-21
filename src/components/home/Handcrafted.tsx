import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { editorialImages } from "@/lib/data/mock/images";

const POINTS = [
  { title: "Hand Painted", text: "Every layer of color and gold is applied by hand, never sprayed or stamped." },
  { title: "Made Individually", text: "One piece finished at a time — not a production line, an atelier." },
  { title: "Sacred Symbolism", text: "Color, gesture and gilding follow tradition, not trend." },
  { title: "Unique Finishes", text: "Subtle variation between pieces is kept, not corrected." },
];

export function Handcrafted() {
  return (
    <section className="overflow-hidden bg-olive text-ivory section-generous">
      <PageContainer className="editorial-grid items-start">
        <div className="col-span-4 sm:col-span-8 lg:col-span-6 lg:col-start-1">
          <Reveal>
            <figure>
              <div className="aspect-[4/3] overflow-hidden sm:aspect-[8/5] lg:aspect-[6/5]">
                <img
                  src={editorialImages.processHands}
                  alt="Gloved hands finishing the paint on a devotional statue, brushes laid out nearby"
                  loading="lazy"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <figcaption className="type-caption mt-3 flex justify-between gap-5 text-stone/65">
                <span>Atelier process / Hand finishing</span>
                <span aria-hidden="true">Study 01</span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={80} className="ml-auto mt-8 w-[78%] sm:mt-10 sm:w-[58%] lg:w-[64%]">
            <figure>
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={editorialImages.devotionalStillLife}
                  alt="A devotional still life from the atelier: a Saint Sebastian novena candle, a gilded sacred plaque, a crucifix and roses"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="type-caption mt-3 text-stone/65">Atelier tokens / For the home altar</figcaption>
            </figure>
          </Reveal>
        </div>

        <div className="col-span-4 mt-10 sm:col-span-6 sm:col-start-2 lg:col-span-5 lg:col-start-8 lg:mt-0">
          <Reveal>
            <SectionEyebrow tone="light" className="mb-6">Process</SectionEyebrow>
            <EditorialHeading as="h2" size="heading-lg" tone="light" className="max-sm:text-[2.15rem]">
              Made by Hand.
              <br />
              Created with Meaning.
            </EditorialHeading>
          </Reveal>

          <dl className="mt-10 border-t border-ivory/25 sm:mt-12">
            {POINTS.map(({ title, text }, index) => (
              <Reveal key={title} delay={index * 60} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-ivory/20 py-5 sm:grid-cols-[4rem_1fr] sm:gap-4 sm:py-7">
                <SectionNumber number={index + 1} className="pt-1 !text-stone/60" />
                <div>
                  <dt className="font-serif text-2xl text-ivory sm:text-3xl">{title}</dt>
                  <dd className="type-body mt-3 max-w-[38ch] text-stone/75">{text}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </PageContainer>
    </section>
  );
}
