import { useEffect, useState } from "react";
import type { Post, PostCategory } from "@/lib/data/types";
import { getPublishedPosts, getPostCategories } from "@/lib/data/repository";
import { SeoHead } from "@/components/layout/SeoHead";
import { PostCard } from "@/components/journal/PostCard";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import { Reveal } from "@/components/ui/Reveal";
import { CrownMark } from "@/components/brand/CrownMark";
import { SectionNumber } from "@/components/ui/SectionNumber";

export default function Journal() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    getPostCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setPosts(null);
    getPublishedPosts({ category: activeCategory }).then(setPosts);
  }, [activeCategory]);

  const [featured, ...rest] = posts ?? [];

  return (
    <>
      <SeoHead
        title="Journal"
        description="Stories from the atelier — the saints behind the statues, the process behind a finish, and the collections as they take shape."
        path="/journal"
      />

      <section className="relative overflow-hidden border-b border-stone-dark bg-ivory-dim pb-16 pt-28 sm:pb-20 sm:pt-36">
        <CrownMark className="absolute -right-8 top-20 w-48 opacity-[0.06] sm:right-[8%] sm:w-64" />
        <Reveal className="container-editorial editorial-grid items-end gap-y-8">
          <div className="col-span-4 sm:col-span-7 lg:col-span-8 lg:col-start-2">
          <div className="mb-5 flex items-center gap-4"><SectionNumber number={1} /><p className="type-eyebrow text-warmgray">Journal</p></div>
          <h1 className="type-display-lg max-w-[10ch] text-charcoal text-balance">
            Stories from the atelier.
          </h1>
          </div>
          <p className="type-caption col-span-4 max-w-[31ch] text-warmgray sm:col-span-4 lg:col-span-2 lg:col-start-10">Notes on saints, materials, memory and the slow making of devotional art.</p>
        </Reveal>
      </section>

      <div className="container-editorial py-14 sm:py-20">
        <div className="mb-12 flex flex-wrap gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={() => setActiveCategory(undefined)}
            className={`font-sans text-xs uppercase tracking-[0.16em] transition-colors ${
              !activeCategory ? "text-olive" : "text-warmgray hover:text-charcoal"
            }`}
          >
            All Stories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.slug)}
              className={`font-sans text-xs uppercase tracking-[0.16em] transition-colors ${
                activeCategory === c.slug ? "text-olive" : "text-warmgray hover:text-charcoal"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {!posts ? (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="py-16 text-center font-sans text-sm text-warmgray">No stories in this category yet.</p>
        ) : (
          <>
            {featured && (
              <Reveal className="mb-20 lg:ml-[8.333%] lg:w-[83.333%]">
                <PostCard post={featured} featured />
              </Reveal>
            )}
            <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
