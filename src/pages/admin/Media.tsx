import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Upload, Trash2 } from "lucide-react";
import type { MediaItem } from "@/lib/data/types";
import { getMediaLibrary, uploadMedia, deleteMedia } from "@/lib/data/repository";

const FILTERS: { label: string; value: MediaItem["usedIn"] | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Products", value: "products" },
  { label: "Posts", value: "posts" },
  { label: "Unassigned", value: "unassigned" },
];

export default function Media() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<MediaItem["usedIn"] | "all">("all");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reload() {
    getMediaLibrary().then(setItems);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadMedia(file, "unassigned");
    reload();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(item: MediaItem) {
    if (!window.confirm(`Remove “${item.name}” from the media library?`)) return;
    await deleteMedia(item.id);
    reload();
  }

  const visible = filter === "all" ? items : items.filter((i) => i.usedIn === filter);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-admin-ink">Media Library</h1>
          <p className="mt-1 font-sans text-sm text-admin-muted">Images used across posts, products and pages.</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 border border-charcoal px-4 py-2.5 font-sans text-xs uppercase tracking-wide text-charcoal hover:bg-charcoal hover:text-ivory">
          <Upload size={14} strokeWidth={1.5} />
          {uploading ? "Uploading…" : "Upload image"}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="mb-6 flex gap-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`font-sans text-xs uppercase tracking-[0.16em] ${filter === f.value ? "text-olive" : "text-admin-muted hover:text-admin-ink"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {visible.map((item) => (
          <div key={item.id} className="group relative aspect-square overflow-hidden bg-admin-border-soft">
            <img src={item.url} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 truncate bg-charcoal/70 px-2 py-1 font-sans text-[10px] text-ivory opacity-0 transition-opacity group-hover:opacity-100">
              {item.name}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(item)}
              aria-label={`Delete ${item.name}`}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center bg-ivory/90 text-charcoal opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 size={12} strokeWidth={1.75} />
            </button>
          </div>
        ))}
        {visible.length === 0 && <p className="col-span-full py-16 text-center font-sans text-sm text-admin-muted">No images here yet.</p>}
      </div>
    </div>
  );
}
