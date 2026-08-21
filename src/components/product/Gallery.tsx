import { useEffect, useState } from "react";
import type { ProductImage } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

// Matches the `fade-in` keyframe duration in index.css (--animate-fade-in).
const CROSSFADE_MS = 900;

export function Gallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

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
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "aspect-square overflow-hidden bg-stone transition-opacity duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive",
                i === active ? "opacity-100 ring-1 ring-olive" : "opacity-60 hover:opacity-100",
              )}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
