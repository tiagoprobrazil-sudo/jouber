import { SeoHead } from "@/components/layout/SeoHead";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { EditorialFeature } from "@/components/home/EditorialFeature";
import { ArtistTeaser } from "@/components/home/ArtistTeaser";
import { Handcrafted } from "@/components/home/Handcrafted";
import { CollectorsReviews } from "@/components/home/CollectorsReviews";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function Home() {
  return (
    <>
      <SeoHead
        title="Atelier Saint Sebastian"
        description="Sacred art, made by hand. Devotional statues, sacred icons and objects of faith created through faith, tradition and craftsmanship."
        path="/"
      />
      <Hero />
      <Intro />
      <FeaturedCollection />
      <EditorialFeature />
      <ArtistTeaser />
      <Handcrafted />
      <CollectorsReviews />
      <InstagramGrid />
      <NewsletterSection />
    </>
  );
}
