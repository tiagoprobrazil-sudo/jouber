import { Link } from "react-router-dom";
import type { Post } from "@/lib/data/types";
import { formatDate } from "@/lib/utils/format";

const CATEGORY_LABELS: Record<string, string> = {
  atelier: "Atelier",
  saints: "Saints & Stories",
  process: "Process",
  collections: "Collections",
};

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link to={`/journal/${post.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive">
      <div className={`overflow-hidden bg-stone ${featured ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <img
          src={post.coverImage.url}
          alt={post.coverImage.alt}
          loading="lazy"
          sizes={featured ? "(max-width: 1024px) 100vw, 84vw" : "(max-width: 640px) 100vw, 33vw"}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025] group-focus-visible:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="mt-4">
        <p className="font-sans text-[11px] uppercase tracking-[0.16em] text-warmgray">
          {CATEGORY_LABELS[post.category] ?? post.category}
          {post.publishedAt && <span className="mx-2 text-stone-dark">·</span>}
          {post.publishedAt && formatDate(post.publishedAt)}
        </p>
        <h3 className={`mt-2 font-serif leading-snug text-charcoal ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}>
          {post.title}
        </h3>
        <p className="mt-2 font-sans text-sm leading-relaxed text-warmgray-dark line-clamp-2">{post.excerpt}</p>
      </div>
    </Link>
  );
}
