import { useEffect, useState } from "react";
import { SeoHead } from "@/components/layout/SeoHead";
import { Reveal } from "@/components/ui/Reveal";
import { SectionNumber } from "@/components/ui/SectionNumber";
import { CommissionCard } from "@/components/commissions/CommissionCard";
import { CommissionRequestModal } from "@/components/commissions/CommissionRequestModal";
import { getCommissionCatalog } from "@/lib/commissions/catalog";
import type { CatalogItem } from "@/lib/commissions/types";

const PAGE_SIZE = 24;

export default function Commission() {
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CatalogItem | null>(null);

  useEffect(() => {
    getCommissionCatalog({ page: 1, pageSize: PAGE_SIZE })
      .then((data) => {
        setItems(data.items);
        setHasMore(data.hasMore);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the catalog."));
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getCommissionCatalog({ page: nextPage, pageSize: PAGE_SIZE });
      setItems((prev) => [...(prev ?? []), ...data.items]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load more pieces.");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <SeoHead
        title="Commissions"
        description="Choose a sacred 3D-sculpted design and have it hand-printed and finished by Atelier Saint Sebastian."
        path="/commissions"
      />

      <section className="border-b border-stone-dark bg-ivory-dim pb-16 pt-28 sm:pb-20 sm:pt-36">
        <Reveal className="container-editorial editorial-grid items-end gap-y-8">
          <div className="col-span-4 sm:col-span-6 lg:col-span-8 lg:col-start-2">
            <div className="mb-5 flex items-center gap-4">
              <SectionNumber number={1} />
              <p className="type-eyebrow text-warmgray">Commissions</p>
            </div>
            <h1 className="type-display-lg max-w-[16ch] text-charcoal">Choose a Design, We'll Bring It to Life</h1>
          </div>
          <p className="type-caption col-span-4 max-w-[28ch] text-warmgray sm:col-span-2 lg:col-span-2 lg:col-start-10">
            A curated 3D-sculpture catalog. Pick a piece and the atelier hand-prints and finishes it for you — the
            digital file itself is sold separately by its original creator.
          </p>
        </Reveal>
      </section>

      <div className="container-editorial py-14 sm:py-16">
        {error && <p className="py-10 text-center font-sans text-sm text-red-700">{error}</p>}

        {!error && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-8">
              {items
                ? items.map((item) => (
                    <CommissionCard key={item.id} item={item} onCommission={setSelected} />
                  ))
                : Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-stone" />
                  ))}
            </div>

            {items && items.length === 0 && (
              <p className="py-20 text-center font-sans text-sm text-warmgray">
                No pieces available for commission right now — check back soon.
              </p>
            )}

            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="font-sans text-xs uppercase tracking-[0.16em] text-charcoal underline decoration-warmgray underline-offset-4 hover:text-olive disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CommissionRequestModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
