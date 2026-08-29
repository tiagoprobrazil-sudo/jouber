import { Link } from "react-router-dom";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { BrandMark } from "@/components/brand/BrandMark";
import { SaintSebastianIllustration } from "@/components/brand/SaintSebastianIllustration";
import { useSiteContent } from "@/lib/data/siteContent";

const EXPLORE_LINKS = [
  { label: "Home", to: "/" },
  { label: "The Artist", to: "/artist" },
  { label: "Journal", to: "/journal" },
  { label: "Shop", to: "/shop" },
  { label: "Contact", to: "/contact" },
];

const CARE_LINKS = [
  { label: "Shipping", to: "/shipping" },
  { label: "Returns", to: "/returns" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "FAQ", to: "/faq" },
];

export function Footer() {
  const content = useSiteContent("footer");

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-charcoal text-stone">
      <SaintSebastianIllustration className="pointer-events-none absolute -bottom-[12%] right-[-9rem] hidden w-[34rem] opacity-[0.075] lg:block wide:right-[-4rem] wide:w-[40rem]" />

      <div className="container-editorial relative py-12 sm:py-16 lg:py-20">
        <div className="editorial-grid items-start gap-y-10">
          <div className="col-span-4 sm:col-span-8 lg:col-span-5">
            <div className="flex items-center gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-ivory/95 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <BrandMark decorative={false} size="lg" />
              </span>
              <span className="font-serif leading-none text-ivory">
                <span className="block text-2xl">Atelier</span>
                <span className="mt-1 block font-sans text-[0.7rem] font-medium uppercase tracking-[0.24em] text-stone">
                  Saint Sebastian
                </span>
              </span>
            </div>
            <p className="mt-6 max-w-[34rem] font-sans text-sm leading-relaxed text-stone/70">{content.description}</p>
          </div>

          <div className="col-span-2 sm:col-span-3 lg:col-start-6 lg:col-span-2">
            <FooterLinks title="Explore" links={EXPLORE_LINKS} />
          </div>
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <FooterLinks title="Customer care" links={CARE_LINKS} />
          </div>
          <div className="col-span-4 sm:col-span-2 lg:col-span-2">
            <p className="type-eyebrow text-warmgray">Follow</p>
            <a
              href="https://www.instagram.com/ateliersaintsebastian"
              target="_blank"
              rel="noreferrer"
              className="link-underline mt-5 inline-flex items-center gap-2 font-sans text-sm text-stone hover:text-ivory"
            >
              <InstagramIcon size={15} strokeWidth={1.5} /> Instagram
            </a>
          </div>
        </div>

        <div className="editorial-grid mt-10 items-center border-t border-white/12 pt-8 lg:mt-14">
          <div className="col-span-4 sm:col-span-6 lg:col-span-5">
            <p className="type-eyebrow text-warmgray">Atelier letter</p>
            <NewsletterForm variant="dark" className="mt-4" />
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-editorial flex flex-col gap-2 py-5 font-sans text-[0.6875rem] uppercase tracking-[0.12em] text-stone/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Atelier Saint Sebastian</p>
          <p>{content.tagline}</p>
          <p>
            Powered by{" "}
            <a
              href="https://www.tiagobrazil.com.br"
              target="_blank"
              rel="noreferrer"
              className="link-underline text-stone/55 hover:text-ivory"
            >
              Tiago Brazil
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: typeof EXPLORE_LINKS }) {
  return (
    <div>
      <p className="type-eyebrow text-warmgray">{title}</p>
      <ul className="mt-5 space-y-2.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="link-underline font-sans text-sm text-stone hover:text-ivory">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
