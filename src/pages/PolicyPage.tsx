import { SeoHead } from "@/components/layout/SeoHead";
import { Reveal } from "@/components/ui/Reveal";
import { useSiteContent } from "@/lib/data/siteContent";

type Topic = "shipping" | "returns" | "privacy" | "terms" | "faq";
type PolicyContentKey = "policyShipping" | "policyReturns" | "policyPrivacy" | "policyTerms" | "policyFaq";

const TOPIC_TO_KEY: Record<Topic, PolicyContentKey> = {
  shipping: "policyShipping",
  returns: "policyReturns",
  privacy: "policyPrivacy",
  terms: "policyTerms",
  faq: "policyFaq",
};

export default function PolicyPage({ topic }: { topic: Topic }) {
  const content = useSiteContent<PolicyContentKey>(TOPIC_TO_KEY[topic]);

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
