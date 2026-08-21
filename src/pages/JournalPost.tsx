import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Share2 } from "lucide-react";
import type { Post } from "@/lib/data/types";
import { getPublishedPostBySlug, getRelatedPosts } from "@/lib/data/repository";
import { SeoHead } from "@/components/layout/SeoHead";
import { PageLoader } from "@/components/layout/PageLoader";
import { RichContent } from "@/components/journal/RichContent";
import { PostCard } from "@/components/journal/PostCard";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/utils/format";
import { SacredDivider } from "@/components/brand/SacredDivider";
import { CrownMark } from "@/components/brand/CrownMark";

export default function JournalPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [related, setRelated] = useState<Post[]>([]);

  useEffect(() => {
    if (!slug) return;
    setPost(undefined);
    getPublishedPostBySlug(slug).then(setPost);
  }, [slug]);

  useEffect(() => {
    if (post) getRelatedPosts(post, 3).then(setRelated);
  }, [post]);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title, url });
      } catch {
        // user cancelled — ignore
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  if (post === undefined) return <PageLoader />;
  if (post === null) return <Navigate to="/journal" replace />;

  return (
    <>
      <SeoHead title={post.title} description={post.excerpt} path={`/journal/${post.slug}`} type="article" image={post.coverImage.url} />

      <div className="relative h-[55vh] min-h-[380px] overflow-hidden bg-charcoal sm:h-[70vh]">
        <img src={post.coverImage.url} alt={post.coverImage.alt} className="h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent" aria-hidden="true" />
        <div className="container-editorial absolute inset-x-0 bottom-0 pb-12 sm:pb-16">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-stone/90">
            {post.category}
            {post.publishedAt && <span className="mx-2">·</span>}
            {post.publishedAt && formatDate(post.publishedAt)}
          </p>
          <h1 className="max-w-2xl font-serif text-3xl leading-[1.15] text-ivory text-balance sm:text-5xl">{post.title}</h1>
          {post.subtitle && <p className="mt-3 max-w-xl font-sans text-base text-stone/90">{post.subtitle}</p>}
        </div>
      </div>

      <article className="container-editorial editorial-grid relative py-16 sm:py-24">
        <CrownMark className="absolute left-8 top-24 hidden w-20 opacity-[0.12] lg:block" />
        <Reveal className="col-span-4 sm:col-span-6 sm:col-start-2 lg:col-span-6 lg:col-start-4">
          <RichContent html={post.content} gallery={post.gallery} />
        </Reveal>

        <SacredDivider className="col-span-4 my-12 text-olive sm:col-span-6 sm:col-start-2 lg:col-span-6 lg:col-start-4" />
        <div className="col-span-4 flex items-center justify-between border-t border-stone-dark pt-6 sm:col-span-6 sm:col-start-2 lg:col-span-6 lg:col-start-4">
          <Link to="/journal" className="font-sans text-xs uppercase tracking-[0.16em] text-warmgray link-underline">
            Back to Journal
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.16em] text-warmgray hover:text-charcoal"
          >
            <Share2 size={14} strokeWidth={1.5} />
            Share
          </button>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-stone-dark bg-ivory-dim py-20">
          <div className="container-editorial">
            <Reveal>
              <h2 className="mb-10 font-serif text-2xl text-charcoal sm:text-3xl">More from the Journal</h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 70}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
