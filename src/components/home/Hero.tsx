import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/data/types";
import { getProducts, getProductCategories } from "@/lib/data/repository";
import { ButtonLink } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { TextLink } from "@/components/ui/TextLink";
import { useSiteContent } from "@/lib/data/siteContent";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { optimizedImageUrl, optimizedImageSrcSet } from "@/lib/utils/imageUrl";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import frameTop from "@/assets/brand/ornaments/frame-top.webp";
import heroVideoPoster from "@/assets/videos/hero-devotion-poster.webp";

/** How long each slide holds before auto-advancing — also drives the progress-bar fill and (roughly) the Ken Burns zoom, see index.css's .hero-slider__* rules. */
const AUTOPLAY_MS = 6500;
const SWIPE_THRESHOLD_PX = 40;

/**
 * An animated Slider-Revolution-style banner with two admin-chosen
 * sources (see /admin/content, Hero panel — HeroContent.mode):
 * - "images": plain horizontal photos the admin uploads directly, shown
 *   full-bleed with no text over them — just the slides.
 * - "category": up to 4 products pooled from one or more product
 *   categories, each with its own title/price/CTA (the original
 *   version of this banner). Swapped in automatically the moment the
 *   chosen categories have at least one product between them (see
 *   getProducts' default sort: featured first), so adding or
 *   re-featuring a piece takes its place here with no code change.
 * Whichever source is picked, if it has nothing to show yet (no slides
 * added, or no products in the chosen categories) a static still + the
 * CMS copy from /admin/content is shown instead — never a blank or
 * half-loaded hero. (The atelier footage that used to autoplay here
 * now lives in the "Atelier" section, Intro.tsx.)
 */
export function Hero() {
  const content = useSiteContent("hero");
  const prefersReducedMotion = usePrefersReducedMotion();
  const isImageMode = content.mode === "images";

  const [products, setProducts] = useState<Product[] | null>(null);
  const [categoryNames, setCategoryNames] = useState<Map<string, string>>(new Map());
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    getProductCategories().then((cats) => setCategoryNames(new Map(cats.map((c) => [c.slug, c.name]))));
  }, []);

  const categorySlugsKey = content.categorySlugs.join(",");

  useEffect(() => {
    if (isImageMode || !categorySlugsKey) {
      setProducts(null);
      return;
    }
    let cancelled = false;
    // One request per selected category, pooled and de-duplicated (a
    // product filed under two of the chosen categories only shows up
    // once) — a product's own default sort (featured first) decides
    // its place within its category's slice of the pool.
    Promise.all(categorySlugsKey.split(",").map((slug) => getProducts({ categorySlug: slug }))).then((lists) => {
      if (cancelled) return;
      const seen = new Set<string>();
      const merged: Product[] = [];
      for (const list of lists) {
        for (const product of list) {
          if (!seen.has(product.id)) {
            seen.add(product.id);
            merged.push(product);
          }
        }
      }
      setProducts(merged.slice(0, 4));
      setIndex(0);
    });
    return () => {
      cancelled = true;
    };
  }, [isImageMode, categorySlugsKey]);

  const imageSlides = content.images;
  const categorySlides = products ?? [];
  const slideCount = isImageMode ? imageSlides.length : categorySlides.length;
  const isDynamic = isImageMode ? slideCount > 0 : Boolean(categorySlugsKey) && slideCount > 0;
  // Text (headline/price/CTA) only ever applies to the category source
  // — plain image slides never carry an overlay, by design.
  const showTextOverlay = !(isDynamic && isImageMode);

  // Auto-advance — restarts (and re-syncs the progress bar, keyed on
  // `index` too) every time the slide changes, whether by this timer, an
  // arrow, a dot, or a swipe.
  useEffect(() => {
    if (!isDynamic || slideCount < 2 || paused || prefersReducedMotion) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slideCount), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [isDynamic, slideCount, paused, prefersReducedMotion, index]);

  function goTo(i: number) {
    setIndex(((i % slideCount) + slideCount) % slideCount);
  }
  function next() {
    goTo(index + 1);
  }
  function prev() {
    goTo(index - 1);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const delta = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) next();
    else prev();
  }

  const activeProduct = isDynamic && !isImageMode ? categorySlides[index] : null;
  // A product may belong to several categories — show whichever of its
  // own categories was actually picked for the slider, not just its first.
  const activeCategorySlug = activeProduct?.categorySlugs.find((slug) => content.categorySlugs.includes(slug));
  const activeCategoryName = activeCategorySlug ? categoryNames.get(activeCategorySlug) : undefined;
  const activeHref = activeCategorySlug ? `/shop/${activeCategorySlug}` : "/shop";

  return (
    <section
      className="hero-slider relative min-h-[42rem] overflow-hidden bg-charcoal text-ivory sm:min-h-[44rem] lg:min-h-[46rem] xl:min-h-[min(50rem,96svh)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 overflow-hidden">
        {isDynamic && isImageMode ? (
          imageSlides.map((image, i) => {
            const active = i === index;
            return (
              <div
                key={image.id}
                aria-hidden={!active}
                className={cn(
                  "absolute inset-0 transition-opacity duration-[1100ms] ease-[var(--ease-editorial)]",
                  active ? "z-[1] opacity-100" : "pointer-events-none z-0 opacity-0",
                )}
              >
                <img
                  src={optimizedImageUrl(image.url, 1920, 16 / 9)}
                  srcSet={optimizedImageSrcSet(image.url, 16 / 9)}
                  sizes="100vw"
                  alt=""
                  aria-hidden="true"
                  loading={i === 0 ? "eager" : "lazy"}
                  className={cn("hero-slider__media h-full w-full object-cover object-center", active && "hero-slider__media--active")}
                />
              </div>
            );
          })
        ) : isDynamic ? (
          categorySlides.map((product, i) => {
            const active = i === index;
            return (
              <div
                key={product.id}
                aria-hidden={!active}
                className={cn(
                  "absolute inset-0 transition-opacity duration-[1100ms] ease-[var(--ease-editorial)]",
                  active ? "z-[1] opacity-100" : "pointer-events-none z-0 opacity-0",
                )}
              >
                <img
                  src={optimizedImageUrl(product.images[0]?.url, 1920, 16 / 9)}
                  srcSet={optimizedImageSrcSet(product.images[0]?.url, 16 / 9)}
                  sizes="100vw"
                  alt=""
                  aria-hidden="true"
                  loading={i === 0 ? "eager" : "lazy"}
                  className={cn("hero-slider__media h-full w-full object-cover object-center", active && "hero-slider__media--active")}
                />
              </div>
            );
          })
        ) : (
          // Static fallback — shown until the chosen source above (see
          // /admin/content) has something to show. The atelier footage
          // that used to autoplay here now lives in the "Atelier" section
          // (Intro.tsx) instead.
          <img
            src={heroVideoPoster}
            alt="Hand-painted devotional statues of Our Lady, from Atelier Saint Sebastian"
            className="hero-clean__media h-full w-full scale-[1.015] object-cover object-[62%_center] animate-fade-in sm:object-[58%_center] lg:object-[62%_center]"
          />
        )}
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-r from-charcoal via-charcoal/75 to-charcoal/10 sm:via-charcoal/58 lg:via-charcoal/35"
          aria-hidden="true"
        />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-charcoal/70 via-transparent to-charcoal/35" aria-hidden="true" />
      </div>

      <img
        src={frameTop}
        alt=""
        aria-hidden="true"
        className="absolute -left-[8%] top-[18%] z-[2] h-auto w-[40rem] max-w-none object-contain opacity-[0.035] mix-blend-luminosity"
      />

      {showTextOverlay && (
        <PageContainer className="editorial-grid relative z-10 min-h-[42rem] items-end pb-16 pt-28 sm:min-h-[44rem] sm:pb-20 sm:pt-32 lg:min-h-[46rem] lg:pb-24 xl:min-h-[min(50rem,96svh)]">
          <div className="col-span-4 sm:col-span-7 lg:col-span-9">
            {isDynamic && activeProduct ? (
              <div key={activeProduct.id} className="animate-fade-in-up motion-reduce:animate-none" style={{ animationDelay: "150ms" }}>
                {content.eyebrow && <p className="type-caption mb-3 text-stone/60">{content.eyebrow}</p>}
                <SectionEyebrow tone="gold" className="mb-5 sm:mb-6">
                  {activeCategoryName ?? "Atelier Saint Sebastian"}
                </SectionEyebrow>

                <EditorialHeading
                  as="h1"
                  size="display-xl"
                  tone="light"
                  className="hero-clean__title max-w-[16ch] max-sm:text-[clamp(2.35rem,12vw,2.8rem)] lg:text-[4.1rem] xl:text-[4.5rem]"
                >
                  {activeProduct.title}
                </EditorialHeading>

                <div className="mt-6 grid grid-cols-4 items-end gap-x-4 gap-y-6 border-t border-white/20 pt-6 sm:mt-8 sm:grid-cols-8 sm:gap-x-6 lg:grid-cols-9 lg:gap-x-8">
                  <p className="type-body col-span-4 text-stone/90 sm:col-span-4 lg:col-span-3">{formatPrice(activeProduct.price)}</p>

                  <div className="col-span-4 flex flex-wrap items-center gap-x-6 gap-y-4 sm:col-span-4 lg:col-span-5 lg:col-start-5">
                    <ButtonLink
                      to={activeHref}
                      variant="primary"
                      icon={<ArrowRight aria-hidden="true" size={15} strokeWidth={1.5} />}
                      className="!bg-ivory !text-charcoal hover:!bg-gold-soft"
                    >
                      Shop {activeCategoryName ?? "the Collection"}
                    </ButtonLink>
                    <TextLink to={`/product/${activeProduct.slug}`} className="text-ivory hover:text-gold-soft">
                      View This Piece
                    </TextLink>
                  </div>
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {isDynamic ? (
            <p className="type-caption absolute right-5 top-[7.5rem] hidden font-mono text-stone/50 sm:block sm:top-[8.5rem] lg:right-12">
              {String(index + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
            </p>
          ) : (
            <p className="type-caption absolute bottom-5 right-5 hidden text-stone/60 sm:block lg:right-12">Devotional Art / Hand Finished</p>
          )}
        </PageContainer>
      )}

      {isDynamic && slideCount > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10">
          <PageContainer className="flex items-center justify-between gap-6 pb-6 sm:pb-8">
            <div className="flex items-center gap-2.5">
              {(isImageMode ? imageSlides : categorySlides).map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={isImageMode ? `Go to slide ${i + 1}` : `Go to slide ${i + 1}: ${(slide as Product).title}`}
                  aria-current={i === index}
                  className="group relative h-[3px] w-9 overflow-hidden rounded-full bg-ivory/25 transition-colors hover:bg-ivory/45 sm:w-14"
                >
                  {i < index && <span className="absolute inset-0 bg-ivory/70" aria-hidden="true" />}
                  {i === index && (
                    <span
                      key={`${index}-${paused}`}
                      aria-hidden="true"
                      className="hero-slider__progress absolute inset-y-0 left-0 bg-ivory"
                      style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: paused || prefersReducedMotion ? "paused" : "running" }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center border border-ivory/25 text-ivory transition-colors hover:border-ivory hover:bg-ivory/10"
              >
                <ArrowLeft size={15} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="flex h-10 w-10 items-center justify-center border border-ivory/25 text-ivory transition-colors hover:border-ivory hover:bg-ivory/10"
              >
                <ArrowRight size={15} strokeWidth={1.5} />
              </button>
            </div>
          </PageContainer>
        </div>
      )}
    </section>
  );
}
