import { useState } from "react";
import type { ProductImage } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

export function Gallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="aspect-[4/5] overflow-hidden bg-stone lg:aspect-[5/6]">
        <img
          src={current?.url}
          alt={current?.alt ?? ""}
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="h-full w-full object-cover transition-opacity duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
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
