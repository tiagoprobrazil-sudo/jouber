import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { SeoHead } from "@/components/layout/SeoHead";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // No backend is connected yet — see supabase/README.md. This simply
    // confirms receipt locally rather than pretending to send an email.
    setStatus("sent");
  }

  return (
    <>
      <SeoHead title="Contact" description="Get in touch with Atelier Saint Sebastian." path="/contact" />

      <div className="container-editorial grid grid-cols-1 gap-16 pt-32 pb-24 sm:pt-40 md:grid-cols-2 md:gap-24">
        <Reveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.24em] text-warmgray">Contact</p>
          <h1 className="max-w-sm font-serif text-4xl leading-[1.1] text-charcoal text-balance sm:text-5xl">
            We'd love to hear from you.
          </h1>
          <p className="mt-6 max-w-sm font-sans text-[15px] leading-relaxed text-warmgray-dark">
            Questions about a piece, a custom order, or an existing order — write to us and the
            atelier will respond personally.
          </p>

          <div className="mt-10 space-y-4">
            <a href="mailto:hello@ateliersaintsebastian.com" className="flex items-center gap-3 font-sans text-sm text-charcoal hover:text-olive">
              <Mail size={16} strokeWidth={1.5} />
              hello@ateliersaintsebastian.com
            </a>
            <a
              href="https://www.instagram.com/ateliersaintsebastian"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 font-sans text-sm text-charcoal hover:text-olive"
            >
              <InstagramIcon size={16} strokeWidth={1.5} />
              @ateliersaintsebastian
            </a>
          </div>
        </Reveal>

        <Reveal delay={100}>
          {status === "sent" ? (
            <div className="border border-stone-dark p-8">
              <p className="font-serif text-xl text-charcoal">Thank you for writing.</p>
              <p className="mt-3 font-sans text-sm text-warmgray-dark">
                The atelier will reply to your message as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  className="w-full border border-stone-dark bg-transparent px-4 py-3 font-sans text-sm focus:border-olive focus:outline-none"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          )}
        </Reveal>
      </div>
    </>
  );
}
