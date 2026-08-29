/**
 * Editable site copy — the admin-manageable subset of the public site's
 * text (see /admin/content, src/pages/admin/Content.tsx). Each key below
 * has a default value matching the site's original hardcoded copy, which
 * doubles as the fallback shown until an admin saves an edit and as the
 * starting point the admin form pre-fills. Public components read these
 * through `useSiteContent`, never `getSiteContent` directly, so the
 * loading/fallback behavior stays consistent everywhere.
 */

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/data/repository";

export interface HeroContent {
  eyebrow: string;
  headlineLines: string[];
  body: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
}

export interface IntroContent {
  eyebrow: string;
  heading: string;
  bodyLead: string;
  bodySecondary: string;
  caption: string;
}

export interface EditorialFeatureContent {
  eyebrow: string;
  headlineLines: string[];
  caption: string;
  ctaLabel: string;
}

export interface ProcessStep {
  title: string;
  text: string;
}

export interface ProcessContent {
  eyebrow: string;
  headlineLines: string[];
  steps: ProcessStep[];
}

export interface ArtistContent {
  leadParagraph: string;
  introParagraph: string;
  section2Heading: string;
  section2Body1: string;
  section2Body2: string;
  section3Heading: string;
  section3Body1: string;
  section3Body2: string;
  closingLine: string;
  signatureName: string;
  signatureTitle: string;
}

export interface NewsletterContent {
  eyebrow: string;
  heading: string;
  body: string;
  caption: string;
}

export interface FooterContent {
  description: string;
  tagline: string;
}

export interface PolicyBodyContent {
  title: string;
  body: string[];
}

export interface PolicyFaqContent {
  title: string;
  faq: { q: string; a: string }[];
}

export const SITE_CONTENT_DEFAULTS = {
  hero: {
    eyebrow: "Atelier Saint Sebastian",
    headlineLines: ["Sacred Art,", "Made by Hand."],
    body: "Devotional art created through faith, tradition and craftsmanship.",
    ctaPrimaryLabel: "Explore the Collection",
    ctaSecondaryLabel: "Discover the Atelier",
  } satisfies HeroContent,

  intro: {
    eyebrow: "The Atelier",
    heading: "Art created with devotion.",
    bodyLead:
      "Every piece that leaves the atelier is shaped and finished by hand — cast, painted in layers, and gilded with restraint. It is work born from a long relationship between art, faith, ancestry and devotion, carried forward one statue, one icon, one prayer candle at a time.",
    bodySecondary:
      "Nothing here is mass-produced. Small variations in paint and gilding are not corrected — they are the mark of the hand that made it.",
    caption: "Devotional Art / Hand Finished",
  } satisfies IntroContent,

  editorialFeature: {
    eyebrow: "Our Lady of Aparecida",
    headlineLines: ["Created not simply", "as decoration,", "but as presence."],
    caption: "Hand-finished devotional work / Atelier study",
    ctaLabel: "Discover the Devotion",
  } satisfies EditorialFeatureContent,

  process: {
    eyebrow: "Process",
    headlineLines: ["Made by Hand.", "Created with Meaning."],
    steps: [
      { title: "Hand Painted", text: "Every layer of color and gold is applied by hand, never sprayed or stamped." },
      { title: "Made Individually", text: "One piece finished at a time — not a production line, an atelier." },
      { title: "Sacred Symbolism", text: "Color, gesture and gilding follow tradition, not trend." },
      { title: "Unique Finishes", text: "Subtle variation between pieces is kept, not corrected." },
    ],
  } satisfies ProcessContent,

  artist: {
    leadParagraph:
      "My name is Jouber, and Atelier Saint Sebastian was born from a deep connection between faith, art, ancestry, and devotion.",
    introParagraph:
      "Since I was young, sacred imagery has always spoken to me — not simply as decoration, but as presence, comfort, memory, and spiritual connection. Through this atelier, I create handcrafted devotional art designed to bring beauty, prayer, protection, and meaning into everyday spaces.",
    section2Heading: "Made with intention",
    section2Body1:
      "Each piece is individually handmade and hand-finished with great care, inspired by Catholic tradition, sacred symbolism, and the spiritual richness found across different paths of faith and devotion. From saints and sacred icons to devotional décor, every work is created with intention, respect, and reverence.",
    section2Body2:
      "I believe sacred art should feel personal. For this reason, many of my creations can be personalized through colors, finishes, embellishments, and meaningful details — helping transform each piece into something deeply connected to the spiritual journey of the person receiving it.",
    section3Heading: "Why the hand still matters",
    section3Body1:
      "At Atelier Saint Sebastian, I do not simply create religious décor; I create devotional pieces meant to accompany prayer, reflection, healing, remembrance, and moments of faith inside the home.",
    section3Body2:
      "Every piece carries time, craftsmanship, and care. Because they are handmade, no two are ever exactly alike, making each creation unique. I hope that through this work, I can share more than art: a sense of comfort, devotion, beauty, and sacred presence.",
    closingLine: "Thank you for supporting handmade sacred art.",
    signatureName: "Jouber",
    signatureTitle: "Founder & Artist, Atelier Saint Sebastian",
  } satisfies ArtistContent,

  newsletter: {
    eyebrow: "The Atelier Letter",
    heading: "Stay close to the Atelier",
    body: "Receive new works, stories and updates from the atelier.",
    caption: "Occasional notes from the workshop.",
  } satisfies NewsletterContent,

  footer: {
    description:
      "A devotional art studio creating hand-painted statues, sacred icons and objects of faith — made with tradition, craftsmanship and reverence.",
    tagline: "Made by hand · Kept in faith",
  } satisfies FooterContent,

  policyShipping: {
    title: "Shipping",
    body: [
      "Estimated arrival times are noted on each product page and vary by destination. The atelier ships worldwide.",
      "Buyers are responsible for any customs and import taxes that may apply on international orders — the atelier is not responsible for delays caused by customs processing.",
    ],
  } satisfies PolicyBodyContent,

  policyReturns: {
    title: "Returns",
    body: [
      "We offer a 30-day return policy — you have 30 days after receiving your item to request a return. To be eligible, the piece must be unused and in the same condition you received it, in its original packaging, with proof of purchase.",
      "To start a return, write to us at jouber.costa@icloud.com. Please inspect your order on arrival and contact us right away if a piece arrives damaged or incorrect. Personalized or customized pieces, and sale items, are final sale.",
    ],
  } satisfies PolicyBodyContent,

  policyPrivacy: {
    title: "Privacy",
    body: [
      "Atelier Saint Sebastian collects only the information needed to process orders, respond to inquiries and, with consent, send newsletter updates — name, email, shipping address and order details.",
      "We do not sell customer information. Data is stored securely and used solely to operate the atelier's shop and customer communications.",
    ],
  } satisfies PolicyBodyContent,

  policyTerms: {
    title: "Terms of Service",
    body: [
      "By placing an order with Atelier Saint Sebastian, you agree to the pricing, shipping and return terms described on this site at the time of purchase.",
      "All photography, writing and artwork on this site are the property of Atelier Saint Sebastian and may not be reproduced without permission.",
    ],
  } satisfies PolicyBodyContent,

  policyFaq: {
    title: "FAQ",
    faq: [
      { q: "Are the pieces really hand-painted?", a: "Yes — every statue, plaque and canvas is finished by hand in the atelier, not machine-printed." },
      { q: "Can I request a custom finish?", a: "Many pieces can be personalized through colors, finishes and embellishments — write to us at jouber.costa@icloud.com before ordering." },
      { q: "Do you ship internationally?", a: "Yes, the atelier ships worldwide. Buyers are responsible for any customs or import taxes on international orders." },
      { q: "How do I care for my piece?", a: "Dust gently with a dry, soft cloth and keep out of direct, prolonged sunlight to preserve the painted finish." },
    ],
  } satisfies PolicyFaqContent,
} as const;

export type SiteContentKey = keyof typeof SITE_CONTENT_DEFAULTS;

/** Reads editable copy for `key`, returning the default (current hardcoded copy) until a saved value loads, merged under whatever was saved so a partially-filled admin edit never drops fields. */
export function useSiteContent<K extends SiteContentKey>(key: K): (typeof SITE_CONTENT_DEFAULTS)[K] {
  const fallback = SITE_CONTENT_DEFAULTS[key];
  const [content, setContent] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    getSiteContent<Partial<(typeof SITE_CONTENT_DEFAULTS)[K]>>(key).then((saved) => {
      if (!cancelled && saved) setContent({ ...fallback, ...saved });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return content;
}
