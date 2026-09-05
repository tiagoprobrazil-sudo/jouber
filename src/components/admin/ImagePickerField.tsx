import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { optimizedImageUrl } from "@/lib/utils/imageUrl";

interface ImagePickerFieldProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  aspect?: string;
  /** Numeric width/height counterpart to `aspect` (a Tailwind class string) — needed so the CDN thumbnail is requested at the right shape. Keep in sync with `aspect`. */
  aspectRatio?: number;
}

export function ImagePickerField({ label, value, onChange, aspect = "aspect-[4/5]", aspectRatio = 4 / 5 }: ImagePickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-admin-muted">{label}</p>
      {value ? (
        <div className={`relative ${aspect} w-full max-w-[220px] overflow-hidden bg-admin-border-soft`}>
          <img
            src={optimizedImageUrl(value, 440, aspectRatio)}
            alt=""
            width={440}
            height={Math.round(440 / aspectRatio)}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-charcoal/70 text-ivory hover:bg-charcoal"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex ${aspect} w-full max-w-[220px] flex-col items-center justify-center gap-2 border border-dashed border-admin-border text-admin-muted hover:border-olive hover:text-olive`}
        >
          <ImagePlus size={20} strokeWidth={1.5} />
          <span className="font-sans text-xs">Choose image</span>
        </button>
      )}
      <MediaPickerModal isOpen={open} onClose={() => setOpen(false)} onSelect={(url) => { onChange(url); setOpen(false); }} />
    </div>
  );
}
