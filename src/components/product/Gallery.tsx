import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";
import type { ProductImage } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

// Matches the `fade-in` keyframe duration in index.css (--animate-fade-in).
const CROSSFADE_MS = 900;

const VIDEO_SLOT = "video" as const;

export function Gallery({ images, videoUrl }: { images: ProductImage[]; videoUrl?: string }) {
  const [active, setActive] = useState<number | typeof VIDEO_SLOT>(0);
  const showingVideo = active === VIDEO_SLOT && Boolean(videoUrl);
  const current = !showingVideo ? (images[active as number] ?? images[0]) : undefined;

  // Swapping an <img>'s src in place never animates -- the opacity value
  // never changes, so a `transition-opacity` class on it is a no-op. To get
  // a real crossfade across an arbitrary number of gallery photos, the
  // previously shown photo stays underneath (`backSrc`) while the newly
  // selected one is re-mounted on top and fades in over it; once the fade
  // finishes, the back layer quietly catches up so the next click has a
  // clean base to fade from again.
  const [backSrc, setBackSrc] = useState(current?.url);

  useEffect(() => {
    const timer = setTimeout(() => setBackSrc(current?.url), CROSSFADE_MS);
    return () => clearTimeout(timer);
  }, [current?.url]);

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-stone lg:aspect-[5/6]">
        {showingVideo ? (
          <video key={videoUrl} src={videoUrl} controls playsInline className="h-full w-full object-cover" />
        ) : (
          <>
            {backSrc && backSrc !== current?.url && (
              <img src={backSrc} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <img
              key={current?.id}
              src={current?.url}
              alt={current?.alt ?? ""}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="relative h-full w-full object-cover animate-fade-in motion-reduce:animate-none"
              fetchPriority="high"
            />
          </>
        )}
      </div>
      {(images.length > 1 || videoUrl) && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={!showingVideo && i === active}
              className={cn(
                "aspect-square overflow-hidden bg-stone transition-opacity duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive",
                !showingVideo && i === active ? "opacity-100 ring-1 ring-olive" : "opacity-60 hover:opacity-100",
              )}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" sizes="96px" />
            </button>
          ))}
          {videoUrl && (
            <button
              type="button"
              onClick={() => setActive(VIDEO_SLOT)}
              aria-label="Play product video"
              aria-current={showingVideo}
              className={cn(
                "relative flex aspect-square items-center justify-center overflow-hidden bg-charcoal text-ivory transition-opacity duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive",
                showingVideo ? "opacity-100 ring-1 ring-olive" : "opacity-60 hover:opacity-100",
              )}
            >
              <PlayCircle size={22} strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
