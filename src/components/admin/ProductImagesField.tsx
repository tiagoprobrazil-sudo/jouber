import { useState } from "react";
import { X, ImagePlus, Star } from "lucide-react";
import type { ProductImage } from "@/lib/data/types";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

interface ProductImagesFieldProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export function ProductImagesField({ images, onChange }: ProductImagesFieldProps) {
  const [open, setOpen] = useState(false);

  function addImage(url: string) {
    const created: ProductImage = { id: `img-${Date.now()}`, url, alt: "", position: images.length };
    onChange([...images, created]);
    setOpen(false);
  }

  function removeImage(id: string) {
    onChange(images.filter((i) => i.id !== id).map((i, idx) => ({ ...i, position: idx })));
  }

  function makePrimary(id: string) {
    const target = images.find((i) => i.id === id);
    if (!target) return;
    const rest = images.filter((i) => i.id !== id);
    onChange([target, ...rest].map((i, idx) => ({ ...i, position: idx })));
  }

  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-admin-muted">Images (first is the primary photo)</p>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={img.id} className="group relative h-28 w-24 shrink-0 overflow-hidden bg-admin-border-soft">
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 bg-olive px-1.5 py-0.5 font-sans text-[9px] uppercase tracking-wide text-ivory">
                Primary
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-charcoal/0 opacity-0 transition-opacity group-hover:bg-charcoal/40 group-hover:opacity-100">
              {i !== 0 && (
                <button type="button" onClick={() => makePrimary(img.id)} aria-label="Set as primary" className="rounded-full bg-ivory p-1.5 text-charcoal">
                  <Star size={12} strokeWidth={1.75} />
                </button>
              )}
              <button type="button" onClick={() => removeImage(img.id)} aria-label="Remove image" className="rounded-full bg-ivory p-1.5 text-charcoal">
                <X size={12} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-28 w-24 shrink-0 flex-col items-center justify-center gap-1.5 border border-dashed border-admin-border text-admin-muted hover:border-olive hover:text-olive"
        >
          <ImagePlus size={18} strokeWidth={1.5} />
          <span className="font-sans text-[11px]">Add</span>
        </button>
      </div>
      <MediaPickerModal isOpen={open} onClose={() => setOpen(false)} onSelect={addImage} />
    </div>
  );
}
