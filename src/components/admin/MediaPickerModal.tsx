import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { X, Upload } from "lucide-react";
import type { MediaItem } from "@/lib/data/types";
import { getMediaLibrary, uploadMedia } from "@/lib/data/repository";
import { optimizedImageUrl } from "@/lib/utils/imageUrl";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  onUploadMany?: (urls: string[]) => void;
  usedIn?: MediaItem["usedIn"];
}

export function MediaPickerModal({ isOpen, onClose, onSelect, onUploadMany, usedIn = "posts" }: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (isOpen) getMediaLibrary().then(setItems);
  }, [isOpen]);

  async function uploadFiles(files: File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) {
      setUploadError("Please select one or more image files.");
      return;
    }
    setUploading(true);
    setUploadError("");
    const created: MediaItem[] = [];
    const failures: string[] = [];
    try {
      for (const [index, file] of images.entries()) {
        setUploadProgress(`${index + 1} / ${images.length}`);
        try {
          created.push(await uploadMedia(file, usedIn));
        } catch {
          failures.push(file.name);
        }
      }
      if (created.length) {
        setItems((previous) => [...created].reverse().concat(previous));
        onUploadMany?.(created.map((item) => item.url));
      }
      if (failures.length) setUploadError(`Could not upload: ${failures.join(", ")}`);
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    void uploadFiles(Array.from(event.target.files ?? []));
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!uploading) void uploadFiles(Array.from(event.dataTransfer.files));
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/50 p-4" role="dialog" aria-modal="true" aria-label="Select an image">
      <div className="flex max-h-[80vh] w-full max-w-3xl flex-col bg-admin-surface">
        <div className="flex items-center justify-between border-b border-admin-border px-6 py-4">
          <h2 className="font-serif text-lg">Media Library</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-admin-ink"><X size={18} strokeWidth={1.5} /></button>
        </div>
        <div className="border-b border-admin-border px-6 py-3">
          <label
            onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer items-center justify-center gap-2 border border-dashed px-4 py-4 font-sans text-xs uppercase tracking-wide transition-colors ${dragging ? "border-olive bg-olive/10 text-olive" : "border-admin-border text-admin-muted hover:border-olive hover:text-olive"} ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            <Upload size={15} strokeWidth={1.5} />
            {uploading ? `Optimizing and uploading ${uploadProgress}` : "Drop images here or choose multiple files"}
            <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
          </label>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-sans text-xs text-admin-muted">{items.length} images</p>
            <p className="font-sans text-[10px] text-admin-muted">JPEG, PNG or WebP</p>
          </div>
        </div>
        {uploadError && <p className="border-b border-admin-border px-6 py-2 font-sans text-xs text-red-700">{uploadError}</p>}
        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-6 sm:grid-cols-4 md:grid-cols-5">
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => onSelect(item.url)} className="aspect-square overflow-hidden bg-admin-border-soft transition-opacity hover:opacity-80" aria-label={`Use ${item.name}`}>
              <img
                src={optimizedImageUrl(item.url, 240)}
                alt={item.name}
                width={240}
                height={240}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
