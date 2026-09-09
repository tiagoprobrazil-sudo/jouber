import { useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import type { HeroImage } from "@/lib/data/siteContent";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { optimizedImageUrl } from "@/lib/utils/imageUrl";

interface HeroSlidesFieldProps {
  images: HeroImage[];
  onChange: (images: HeroImage[]) => void;
}

/** Manages the Hero's manual image slides (see Hero.tsx, mode: "images") — add/reorder/remove, no caption fields since these render as plain, unlabeled photo slides. */
export function HeroSlidesField({ images, onChange }: HeroSlidesFieldProps) {
  const [open, setOpen] = useState(false);

  function addImage(url: string) {
    onChange([...images, { id: `hero-${Date.now()}`, url }]);
    setOpen(false);
  }

  function addUploadedImages(urls: string[]) {
    onChange([...images, ...urls.map((url, i): HeroImage => ({ id: `hero-${Date.now()}-${i}`, url }))]);
    setOpen(false);
  }

  function removeImage(id: string) {
    onChange(images.filter((img) => img.id !== id));
  }

  function move(id: string, direction: -1 | 1) {
    const i = images.findIndex((img) => img.id === id);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-admin-muted">
        Slides <span className="normal-case text-admin-muted/70">— horizontal images, shown full-bleed with no text, in this order</span>
      </p>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={img.id} className="group relative h-20 w-36 shrink-0 overflow-hidden bg-admin-border-soft">
            <img
              src={optimizedImageUrl(img.url, 288, 16 / 9)}
              alt=""
              width={288}
              height={162}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <span className="absolute left-1 top-1 bg-charcoal/70 px-1.5 py-0.5 font-sans text-[9px] uppercase tracking-wide text-ivory">{i + 1}</span>
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-charcoal/0 opacity-0 transition-opacity group-hover:bg-charcoal/40 group-hover:opacity-100">
              {i !== 0 && (
                <button type="button" onClick={() => move(img.id, -1)} aria-label="Move earlier" className="rounded-full bg-ivory p-1.5 text-charcoal">
                  <ChevronLeft size={12} strokeWidth={1.75} />
                </button>
              )}
              {i !== images.length - 1 && (
                <button type="button" onClick={() => move(img.id, 1)} aria-label="Move later" className="rounded-full bg-ivory p-1.5 text-charcoal">
                  <ChevronRight size={12} strokeWidth={1.75} />
                </button>
              )}
              <button type="button" onClick={() => removeImage(img.id)} aria-label="Remove slide" className="rounded-full bg-ivory p-1.5 text-charcoal">
                <X size={12} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-20 w-36 shrink-0 flex-col items-center justify-center gap-1.5 border border-dashed border-admin-border text-admin-muted hover:border-olive hover:text-olive"
        >
          <ImagePlus size={18} strokeWidth={1.5} />
          <span className="font-sans text-[11px]">Add slide</span>
        </button>
      </div>
      <MediaPickerModal isOpen={open} onClose={() => setOpen(false)} onSelect={addImage} onUploadMany={addUploadedImages} usedIn="unassigned" />
    </div>
  );
}
