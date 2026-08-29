import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { TextLink } from "@/components/ui/TextLink";
import { useSiteContent } from "@/lib/data/siteContent";
import frameTop from "@/assets/brand/ornaments/frame-top.webp";
import heroVideo from "@/assets/videos/hero-devotion.mp4";
import heroVideoPoster from "@/assets/videos/hero-devotion-poster.webp";

export function Hero() {
  const content = useSiteContent("hero");

  return (
    <section className="hero-clean relative min-h-[42rem] overflow-hidden bg-charcoal text-ivory sm:min-h-[44rem] lg:min-h-[46rem] xl:min-h-[min(50rem,96svh)]">
      <div className="absolute inset-0 overflow-hidden">
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
          className="hero-clean__media h-full w-full scale-[1.015] object-cover object-[62%_center] animate-fade-in motion-reduce:hidden sm:object-[58%_center] lg:object-[62%_center]"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <img
          src={heroVideoPoster}
          alt="Hand-painted devotional statues of Our Lady, from Atelier Saint Sebastian"
          className="hero-clean__media hidden h-full w-full object-cover object-[62%_center] motion-reduce:block sm:object-[58%_center] lg:object-[62%_center]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/75 to-charcoal/10 sm:via-charcoal/58 lg:via-charcoal/35"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-charcoal/35"
          aria-hidden="true"
        />
      </div>

      <img
        src={frameTop}
        alt=""
        aria-hidden="true"
        className="absolute -left-[8%] top-[18%] h-auto w-[40rem] max-w-none object-contain opacity-[0.035] mix-blend-luminosity"
      />

      <PageContainer className="editorial-grid relative z-10 min-h-[42rem] items-end pb-12 pt-28 sm:min-h-[44rem] sm:pb-14 sm:pt-32 lg:min-h-[46rem] lg:pb-16 xl:min-h-[min(50rem,96svh)]">
        <div className="col-span-4 sm:col-span-7 lg:col-span-9">
          <div className="animate-fade-in-up motion-reduce:animate-none" style={{ animationDelay: "220ms" }}>
            <SectionEyebrow tone="light" className="mb-5 sm:mb-6">
              {content.eyebrow}
            </SectionEyebrow>

            <EditorialHeading as="h1" size="display-xl" tone="light" className="hero-clean__title max-sm:text-[clamp(2.35rem,12vw,2.8rem)] lg:text-[4.1rem] xl:text-[4.5rem]">
              {content.headlineLines.map((line, i) => (
                <span key={i} className="block sm:whitespace-nowrap">
                  {line}
                </span>
              ))}
            </EditorialHeading>

            <div className="mt-6 grid grid-cols-4 items-end gap-x-4 gap-y-6 border-t border-white/20 pt-6 sm:mt-8 sm:grid-cols-8 sm:gap-x-6 lg:grid-cols-9 lg:gap-x-8">
              <p className="type-body col-span-4 max-w-[38ch] text-stone/90 sm:col-span-4 lg:col-span-3">{content.body}</p>

              <div className="col-span-4 flex flex-wrap items-center gap-x-6 gap-y-4 sm:col-span-4 lg:col-span-5 lg:col-start-5">
                <ButtonLink
                  to="/shop"
                  variant="primary"
                  icon={<ArrowRight aria-hidden="true" size={15} strokeWidth={1.5} />}
                  className="!bg-ivory !text-charcoal hover:!bg-gold-soft"
                >
                  {content.ctaPrimaryLabel}
                </ButtonLink>
                <TextLink to="/artist" className="text-ivory hover:text-gold-soft">
                  {content.ctaSecondaryLabel}
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
