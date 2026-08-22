import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { TextLink } from "@/components/ui/TextLink";
import frameTop from "@/assets/brand/ornaments/frame-top.webp";
import heroVideo from "@/assets/videos/hero-devotion.mp4";
import heroVideoPoster from "@/assets/videos/hero-devotion-poster.webp";

export function Hero() {
  return (
    <section className="relative min-h-[72svh] overflow-hidden bg-charcoal text-ivory sm:min-h-[78svh] lg:min-h-[82svh]">
      <div className="absolute inset-y-0 right-0 w-full overflow-hidden sm:w-[72%] lg:w-[68%]">
        {/* Autoplaying hero footage of the atelier's hand-painted statues.
            Visitors who request reduced motion get the video's own first
            frame as a still image instead, rather than an indefinitely
            looping animation. */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={heroVideoPoster}
          aria-hidden="true"
          className="h-full w-full scale-[1.025] object-cover object-[center_22%] animate-fade-in motion-reduce:hidden sm:object-center"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <img
          src={heroVideoPoster}
          alt="Hand-painted devotional statues of Our Lady, from Atelier Saint Sebastian"
          className="hidden h-full w-full object-cover object-[center_22%] motion-reduce:block sm:object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/30 to-transparent sm:from-charcoal/95 sm:via-charcoal/10 sm:to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-transparent to-charcoal/10"
          aria-hidden="true"
        />
      </div>

      <img
        src={frameTop}
        alt=""
        aria-hidden="true"
        className="absolute -left-[8%] top-[14%] h-auto w-[46rem] max-w-none object-contain opacity-[0.055] mix-blend-luminosity"
      />

      <PageContainer className="editorial-grid relative z-10 min-h-[72svh] items-end pb-8 pt-28 sm:min-h-[78svh] sm:pb-14 sm:pt-40 lg:min-h-[82svh] lg:pb-16">
        <div className="col-span-4 sm:col-span-8 lg:col-span-10">
          <div className="animate-fade-in-up motion-reduce:animate-none" style={{ animationDelay: "220ms" }}>
            <SectionEyebrow tone="light" className="mb-6 sm:mb-8">
              Atelier Saint Sebastian
            </SectionEyebrow>

            <EditorialHeading as="h1" size="display-xl" tone="light" className="max-w-[9ch] max-sm:text-[3rem]">
              Sacred Art,
              <br />
              Made by Hand.
            </EditorialHeading>

            <div className="mt-6 grid grid-cols-4 items-end gap-x-4 gap-y-6 sm:mt-10 sm:grid-cols-8 sm:gap-x-6 lg:grid-cols-10 lg:gap-x-8">
              <p className="type-body col-span-4 max-w-[38ch] text-stone/90 sm:col-span-4 lg:col-span-3">
                Devotional art created through faith, tradition and craftsmanship.
              </p>

              <div className="col-span-4 flex flex-wrap items-center gap-x-6 gap-y-4 sm:col-span-4 lg:col-span-5 lg:col-start-5">
                <ButtonLink
                  to="/shop"
                  variant="primary"
                  icon={<ArrowRight aria-hidden="true" size={15} strokeWidth={1.5} />}
                  className="!bg-ivory !text-charcoal hover:!bg-gold-soft"
                >
                  Explore the Collection
                </ButtonLink>
                <TextLink to="/artist" className="text-ivory hover:text-gold-soft">
                  Discover the Atelier
                </TextLink>
              </div>
            </div>
          </div>
        </div>

        <p className="type-caption absolute bottom-5 right-5 hidden text-stone/60 sm:block lg:right-12">
          Devotional Art / Hand Finished
        </p>
      </PageContainer>
    </section>
  );
}
