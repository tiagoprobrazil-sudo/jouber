import { useRef, useState } from "react";
import { Film, X, Loader2 } from "lucide-react";
import { uploadProductVideo } from "@/lib/data/repository";

interface ProductVideoFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function ProductVideoField({ value, onChange }: ProductVideoFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadProductVideo(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload video.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-admin-muted">
        Video (optional) <span className="normal-case text-admin-muted/70">— .mp4, up to 20MB</span>
      </p>

      {value ? (
        <div className="relative w-full max-w-xs">
          <video src={value} controls className="aspect-[4/5] w-full bg-admin-border-soft object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove video"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-charcoal/70 text-ivory hover:bg-charcoal"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <label
          className={`flex aspect-[4/5] w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-admin-border text-admin-muted hover:border-olive hover:text-olive ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {uploading ? <Loader2 size={20} strokeWidth={1.5} className="animate-spin" /> : <Film size={20} strokeWidth={1.5} />}
          <span className="font-sans text-xs">{uploading ? "Uploading…" : "Upload video"}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </label>
      )}

      {error && <p className="mt-2 font-sans text-xs text-red-700">{error}</p>}
    </div>
  );
}
