import type { PostImage } from "@/lib/data/types";

interface RichContentProps {
  html: string;
  gallery?: PostImage[];
}

export function RichContent({ html, gallery }: RichContentProps) {
  return (
    <div>
      {/* eslint-disable-next-line react/no-danger */}
      <div className="journal-prose journal-prose--publication" dangerouslySetInnerHTML={{ __html: html }} />

      {gallery && gallery.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.map((img) => (
            <figure key={img.id}>
              <div className="aspect-square overflow-hidden">
                <img src={img.url} alt={img.alt} loading="lazy" sizes="(max-width: 640px) 50vw, 220px" className="h-full w-full object-cover" />
              </div>
              {img.caption && <figcaption className="mt-1.5 font-sans text-[11px] text-warmgray">{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
