import { useEffect, useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getSiteContent, updateSiteContent } from "@/lib/data/repository";
import {
  SITE_CONTENT_DEFAULTS,
  type SiteContentKey,
  type ProcessStep,
} from "@/lib/data/siteContent";
import { Button } from "@/components/ui/Button";

/** Loads/saves one site_content key, pre-filled with its current default (hardcoded) copy until a saved edit loads. */
function useContentForm<K extends SiteContentKey>(key: K) {
  const [value, setValue] = useState<(typeof SITE_CONTENT_DEFAULTS)[K]>(SITE_CONTENT_DEFAULTS[key]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteContent<Partial<(typeof SITE_CONTENT_DEFAULTS)[K]>>(key).then((existing) => {
      if (existing) setValue((v) => ({ ...v, ...existing }));
    });
  }, [key]);

  async function save() {
    setSaving(true);
    await updateSiteContent(key, value);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return { value, setValue, saving, saved, save };
}

function Panel({ title, hint, children, onSave, saving, saved }: {
  title: string;
  hint?: string;
  children: ReactNode;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <div className="border border-admin-border bg-admin-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg">{title}</h2>
          {hint && <p className="mt-1 font-sans text-xs text-admin-muted">{hint}</p>}
        </div>
        <Button size="sm" disabled={saving} onClick={onSave}>
          {saving ? "Saving…" : saved ? "Saved" : "Save"}
        </Button>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, multiline = false, rows = 3 }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  const cls = "w-full border border-admin-border bg-admin-surface px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none";
  return (
    <div>
      <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-admin-muted">{label}</label>
      {multiline ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}

/** Editable display headline broken across lines — one line per row, rendered with a line break between each on the public page. */
function LinesField({ label, lines, onChange }: { label: string; lines: string[]; onChange: (lines: string[]) => void }) {
  return (
    <div>
      <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-admin-muted">
        {label} <span className="normal-case text-admin-muted/70">— one line per row</span>
      </label>
      <textarea
        rows={Math.max(2, lines.length)}
        value={lines.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        className="w-full border border-admin-border bg-admin-surface px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
      />
    </div>
  );
}

/** A `string[]` of paragraphs, edited as blank-line-separated text. */
function ParagraphsField({ label, paragraphs, onChange }: { label: string; paragraphs: string[]; onChange: (p: string[]) => void }) {
  return (
    <div>
      <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-admin-muted">
        {label} <span className="normal-case text-admin-muted/70">— separate paragraphs with a blank line</span>
      </label>
      <textarea
        rows={8}
        value={paragraphs.join("\n\n")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(/\n\s*\n/)
              .map((p) => p.trim())
              .filter(Boolean),
          )
        }
        className="w-full border border-admin-border bg-admin-surface px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
      />
    </div>
  );
}

function HeroSection() {
  const { value, setValue, saving, saved, save } = useContentForm("hero");
  return (
    <Panel title="Hero" hint="The first screen on the Home page." onSave={save} saving={saving} saved={saved}>
      <Field label="Eyebrow" value={value.eyebrow} onChange={(v) => setValue({ ...value, eyebrow: v })} />
      <LinesField label="Headline" lines={value.headlineLines} onChange={(lines) => setValue({ ...value, headlineLines: lines })} />
      <Field label="Body" value={value.body} onChange={(v) => setValue({ ...value, body: v })} multiline />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Primary button label" value={value.ctaPrimaryLabel} onChange={(v) => setValue({ ...value, ctaPrimaryLabel: v })} />
        <Field label="Secondary link label" value={value.ctaSecondaryLabel} onChange={(v) => setValue({ ...value, ctaSecondaryLabel: v })} />
      </div>
    </Panel>
  );
}

function IntroSection() {
  const { value, setValue, saving, saved, save } = useContentForm("intro");
  return (
    <Panel title="Intro" hint="The “Atelier” section on Home." onSave={save} saving={saving} saved={saved}>
      <Field label="Eyebrow" value={value.eyebrow} onChange={(v) => setValue({ ...value, eyebrow: v })} />
      <Field label="Heading" value={value.heading} onChange={(v) => setValue({ ...value, heading: v })} />
      <Field label="Lead paragraph" value={value.bodyLead} onChange={(v) => setValue({ ...value, bodyLead: v })} multiline />
      <Field label="Second paragraph" value={value.bodySecondary} onChange={(v) => setValue({ ...value, bodySecondary: v })} multiline />
      <Field label="Caption" value={value.caption} onChange={(v) => setValue({ ...value, caption: v })} />
    </Panel>
  );
}

function EditorialFeatureSection() {
  const { value, setValue, saving, saved, save } = useContentForm("editorialFeature");
  return (
    <Panel title="Editorial Feature" hint="The full-bleed “Created not simply as decoration…” section on Home." onSave={save} saving={saving} saved={saved}>
      <Field label="Eyebrow" value={value.eyebrow} onChange={(v) => setValue({ ...value, eyebrow: v })} />
      <LinesField label="Headline" lines={value.headlineLines} onChange={(lines) => setValue({ ...value, headlineLines: lines })} />
      <Field label="Caption" value={value.caption} onChange={(v) => setValue({ ...value, caption: v })} />
      <Field label="Button label" value={value.ctaLabel} onChange={(v) => setValue({ ...value, ctaLabel: v })} />
    </Panel>
  );
}

function ProcessSection() {
  const { value, setValue, saving, saved, save } = useContentForm("process");

  function updateStep(index: number, patch: Partial<ProcessStep>) {
    const steps = value.steps.map((s, i) => (i === index ? { ...s, ...patch } : s));
    setValue({ ...value, steps });
  }

  return (
    <Panel title="Process" hint="The “Process” section on Home." onSave={save} saving={saving} saved={saved}>
      <Field label="Eyebrow" value={value.eyebrow} onChange={(v) => setValue({ ...value, eyebrow: v })} />
      <LinesField label="Headline" lines={value.headlineLines} onChange={(lines) => setValue({ ...value, headlineLines: lines })} />
      <div>
        <p className="mb-2 font-sans text-xs uppercase tracking-wide text-admin-muted">Steps</p>
        <div className="space-y-3">
          {value.steps.map((step, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 border border-admin-border bg-admin-surface p-3 sm:grid-cols-[1fr_2fr]">
              <Field label="Title" value={step.title} onChange={(v) => updateStep(i, { title: v })} />
              <Field label="Text" value={step.text} onChange={(v) => updateStep(i, { text: v })} />
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ArtistSection() {
  const { value, setValue, saving, saved, save } = useContentForm("artist");
  return (
    <Panel title="Artist page" hint="The /artist page and its Home teaser." onSave={save} saving={saving} saved={saved}>
      <Field label="Lead paragraph" value={value.leadParagraph} onChange={(v) => setValue({ ...value, leadParagraph: v })} multiline />
      <Field label="Intro paragraph" value={value.introParagraph} onChange={(v) => setValue({ ...value, introParagraph: v })} multiline />
      <Field label="Second section heading" value={value.section2Heading} onChange={(v) => setValue({ ...value, section2Heading: v })} />
      <Field label="Second section, paragraph 1" value={value.section2Body1} onChange={(v) => setValue({ ...value, section2Body1: v })} multiline />
      <Field label="Second section, paragraph 2" value={value.section2Body2} onChange={(v) => setValue({ ...value, section2Body2: v })} multiline />
      <Field label="Third section heading" value={value.section3Heading} onChange={(v) => setValue({ ...value, section3Heading: v })} />
      <Field label="Third section, paragraph 1" value={value.section3Body1} onChange={(v) => setValue({ ...value, section3Body1: v })} multiline />
      <Field label="Third section, paragraph 2" value={value.section3Body2} onChange={(v) => setValue({ ...value, section3Body2: v })} multiline />
      <Field label="Closing line" value={value.closingLine} onChange={(v) => setValue({ ...value, closingLine: v })} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Signature name" value={value.signatureName} onChange={(v) => setValue({ ...value, signatureName: v })} />
        <Field label="Signature title" value={value.signatureTitle} onChange={(v) => setValue({ ...value, signatureTitle: v })} />
      </div>
    </Panel>
  );
}

function NewsletterSectionForm() {
  const { value, setValue, saving, saved, save } = useContentForm("newsletter");
  return (
    <Panel title="Newsletter" hint="The Atelier Letter section, on Home and the footer." onSave={save} saving={saving} saved={saved}>
      <Field label="Eyebrow" value={value.eyebrow} onChange={(v) => setValue({ ...value, eyebrow: v })} />
      <Field label="Heading" value={value.heading} onChange={(v) => setValue({ ...value, heading: v })} />
      <Field label="Body" value={value.body} onChange={(v) => setValue({ ...value, body: v })} />
      <Field label="Caption" value={value.caption} onChange={(v) => setValue({ ...value, caption: v })} />
    </Panel>
  );
}

function FooterSection() {
  const { value, setValue, saving, saved, save } = useContentForm("footer");
  return (
    <Panel title="Footer" onSave={save} saving={saving} saved={saved}>
      <Field label="Description" value={value.description} onChange={(v) => setValue({ ...value, description: v })} multiline />
      <Field label="Tagline" value={value.tagline} onChange={(v) => setValue({ ...value, tagline: v })} />
    </Panel>
  );
}

function PolicyBodySection({ contentKey, title }: { contentKey: "policyShipping" | "policyReturns" | "policyPrivacy" | "policyTerms"; title: string }) {
  const { value, setValue, saving, saved, save } = useContentForm(contentKey);
  return (
    <Panel title={title} hint={`The /${title.toLowerCase().replace(" of service", "")} page.`} onSave={save} saving={saving} saved={saved}>
      <Field label="Page title" value={value.title} onChange={(v) => setValue({ ...value, title: v })} />
      <ParagraphsField label="Body" paragraphs={value.body} onChange={(body) => setValue({ ...value, body })} />
    </Panel>
  );
}

function FaqSection() {
  const { value, setValue, saving, saved, save } = useContentForm("policyFaq");

  function updateItem(index: number, patch: Partial<{ q: string; a: string }>) {
    setValue({ ...value, faq: value.faq.map((item, i) => (i === index ? { ...item, ...patch } : item)) });
  }
  function addItem() {
    setValue({ ...value, faq: [...value.faq, { q: "", a: "" }] });
  }
  function removeItem(index: number) {
    setValue({ ...value, faq: value.faq.filter((_, i) => i !== index) });
  }

  return (
    <Panel title="FAQ" hint="The /faq page." onSave={save} saving={saving} saved={saved}>
      <Field label="Page title" value={value.title} onChange={(v) => setValue({ ...value, title: v })} />
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-sans text-xs uppercase tracking-wide text-admin-muted">Questions</p>
          <button type="button" onClick={addItem} className="flex items-center gap-1.5 font-sans text-xs uppercase tracking-wide text-olive hover:text-olive-dark">
            <Plus size={13} strokeWidth={1.5} />
            Add question
          </button>
        </div>
        <div className="space-y-3">
          {value.faq.map((item, i) => (
            <div key={i} className="space-y-2 border border-admin-border bg-admin-surface p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Field label="Question" value={item.q} onChange={(v) => updateItem(i, { q: v })} />
                  <Field label="Answer" value={item.a} onChange={(v) => updateItem(i, { a: v })} multiline rows={2} />
                </div>
                <button type="button" onClick={() => removeItem(i)} aria-label="Remove question" className="mt-6 text-admin-muted hover:text-red-700">
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export default function Content() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-admin-ink">Site Content</h1>
      <p className="mt-1 font-sans text-sm text-admin-muted">
        Edit the site's copy directly — changes go live immediately. Each section saves independently.
      </p>

      <div className="mt-8 space-y-8">
        <HeroSection />
        <IntroSection />
        <EditorialFeatureSection />
        <ProcessSection />
        <ArtistSection />
        <NewsletterSectionForm />
        <FooterSection />
        <PolicyBodySection contentKey="policyShipping" title="Shipping" />
        <PolicyBodySection contentKey="policyReturns" title="Returns" />
        <PolicyBodySection contentKey="policyPrivacy" title="Privacy" />
        <PolicyBodySection contentKey="policyTerms" title="Terms of Service" />
        <FaqSection />
      </div>
    </div>
  );
}
