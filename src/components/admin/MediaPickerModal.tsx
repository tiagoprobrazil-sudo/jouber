import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { X, Upload } from "lucide-react";
import type { MediaItem } from "@/lib/data/types";
import { getMediaLibrary, uploadMedia } from "@/lib/data/repository";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (isOpen) getMediaLibrary().then(setItems);
  }, [isOpen]);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const created = await uploadMedia(file, "posts");
    setItems((prev) => [created, ...prev]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/50 p-4" role="dialog" aria-modal="true" aria-label="Select an image">
      <div className="flex max-h-[80vh] w-full max-w-3xl flex-col bg-admin-surface">
        <div className="flex items-center justify-between border-b border-admin-border px-6 py-4">
          <h2 className="font-serif text-lg">Media Library</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-admin-ink">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-admin-border px-6 py-3">
          <p className="font-sans text-xs text-admin-muted">{items.length} images</p>
          <label className="flex cursor-pointer items-center gap-2 font-sans text-xs uppercase tracking-wide text-olive">
            <Upload size={13} strokeWidth={1.5} />
            {uploading ? "Uploading…" : "Upload new"}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
          </label>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-6 sm:grid-cols-4 md:grid-cols-5">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.url)}
              className="aspect-square overflow-hidden bg-admin-border-soft transition-opacity hover:opacity-80"
              aria-label={`Use ${item.name}`}
            >
              <img src={item.url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
