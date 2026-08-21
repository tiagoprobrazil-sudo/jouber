import { SeoHead } from "@/components/layout/SeoHead";
import { Reveal } from "@/components/ui/Reveal";

type Topic = "shipping" | "returns" | "privacy" | "terms" | "faq";

const CONTENT: Record<Topic, { title: string; body: string[] } | { title: string; faq: { q: string; a: string }[] }> = {
  shipping: {
    title: "Shipping",
    body: [
      "Each piece is finished to order and typically ships within 3–7 business days. Delivery times after dispatch vary by destination — usually 5–10 business days within the United States and Brazil, and up to 3 weeks internationally.",
      "You will receive a tracking link by email once your order leaves the atelier. Because every statue and icon is handmade, exact ship dates during high-demand periods (such as major feast days) may extend slightly.",
    ],
  },
  returns: {
    title: "Returns",
    body: [
      "We want every piece to arrive as intended. If something arrives damaged, write to us within 7 days with photos and we will arrange a replacement or refund.",
      "Unused, unopened pieces may be returned within 14 days of delivery. Because each work is finished individually, personalized or customized pieces are final sale.",
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "Atelier Saint Sebastian collects only the information needed to process orders, respond to inquiries and, with consent, send newsletter updates — name, email, shipping address and order details.",
      "We do not sell customer information. Data is stored securely and used solely to operate the atelier's shop, journal and customer communications.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "By placing an order with Atelier Saint Sebastian, you agree to the pricing, shipping and return terms described on this site at the time of purchase.",
      "All photography, writing and artwork on this site are the property of Atelier Saint Sebastian and may not be reproduced without permission.",
    ],
  },
  faq: {
    title: "FAQ",
    faq: [
      { q: "Are the pieces really hand-painted?", a: "Yes — every statue, plaque and canvas is finished by hand in the atelier, not machine-printed." },
      { q: "Can I request a custom finish?", a: "Some pieces support customization — look for the “Customization available” note on the product page, or write to us before ordering." },
      { q: "Do you ship internationally?", a: "Yes, the atelier ships worldwide. See our Shipping policy for estimated timelines." },
      { q: "How do I care for my piece?", a: "Dust gently with a dry, soft cloth and keep out of direct, prolonged sunlight to preserve the painted finish." },
    ],
  },
};

export default function PolicyPage({ topic }: { topic: Topic }) {
  const content = CONTENT[topic];

  return (
    <>
      <SeoHead title={content.title} description={`${content.title} — Atelier Saint Sebastian.`} path={`/${topic}`} />
      <div className="container-editorial max-w-2xl pt-32 pb-24 sm:pt-40">
        <Reveal>
          <h1 className="font-serif text-4xl text-charcoal sm:text-5xl">{content.title}</h1>

          {"body" in content && (
            <div className="mt-10 space-y-6">
              {content.body.map((p, i) => (
                <p key={i} className="font-sans text-[15px] leading-relaxed text-warmgray-dark">
                  {p}
                </p>
              ))}
            </div>
          )}

          {"faq" in content && (
            <dl className="mt-10 space-y-8">
              {content.faq.map((item) => (
                <div key={item.q} className="border-b border-stone-dark pb-8">
                  <dt className="font-serif text-lg text-charcoal">{item.q}</dt>
                  <dd className="mt-2 font-sans text-[15px] leading-relaxed text-warmgray-dark">{item.a}</dd>
                </div>
              ))}
            </dl>
          )}
        </Reveal>
      </div>
    </>
  );
}
