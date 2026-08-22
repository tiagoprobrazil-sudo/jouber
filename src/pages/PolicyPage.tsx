import { SeoHead } from "@/components/layout/SeoHead";
import { Reveal } from "@/components/ui/Reveal";

type Topic = "shipping" | "returns" | "privacy" | "terms" | "faq";

const CONTENT: Record<Topic, { title: string; body: string[] } | { title: string; faq: { q: string; a: string }[] }> = {
  shipping: {
    title: "Shipping",
    body: [
      "Estimated arrival times are noted on each product page and vary by destination. The atelier ships worldwide.",
      "Buyers are responsible for any customs and import taxes that may apply on international orders — the atelier is not responsible for delays caused by customs processing.",
    ],
  },
  returns: {
    title: "Returns",
    body: [
      "We offer a 30-day return policy — you have 30 days after receiving your item to request a return. To be eligible, the piece must be unused and in the same condition you received it, in its original packaging, with proof of purchase.",
      "To start a return, write to us at jouber.costa@icloud.com. Please inspect your order on arrival and contact us right away if a piece arrives damaged or incorrect. Personalized or customized pieces, and sale items, are final sale.",
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "Atelier Saint Sebastian collects only the information needed to process orders, respond to inquiries and, with consent, send newsletter updates — name, email, shipping address and order details.",
      "We do not sell customer information. Data is stored securely and used solely to operate the atelier's shop and customer communications.",
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
      { q: "Can I request a custom finish?", a: "Many pieces can be personalized through colors, finishes and embellishments — write to us at jouber.costa@icloud.com before ordering." },
      { q: "Do you ship internationally?", a: "Yes, the atelier ships worldwide. Buyers are responsible for any customs or import taxes on international orders." },
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
