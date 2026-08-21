import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import type { Product, ProductCategory, ProductFilters } from "@/lib/data/types";
import { getProducts, getProductCategories } from "@/lib/data/repository";
import { SeoHead } from "@/components/layout/SeoHead";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { FiltersPanel } from "@/components/shop/FiltersPanel";
import { SortSelect } from "@/components/shop/SortSelect";
import { MobileFilterDrawer } from "@/components/shop/MobileFilterDrawer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionNumber } from "@/components/ui/SectionNumber";

export default function Shop() {
  const { category } = useParams<{ category?: string }>();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({ categorySlug: category, sort: "featured" });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    getProductCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setFilters((f) => ({ ...f, categorySlug: category }));
  }, [category]);

  useEffect(() => {
    setProducts(null);
    getProducts(filters).then(setProducts);
  }, [filters]);

  const activeCategory = categories.find((c) => c.slug === filters.categorySlug);

  return (
    <>
      <SeoHead
        title={activeCategory ? activeCategory.name : "Shop"}
        description={
          activeCategory?.description ??
          "Browse the full collection of hand-painted statues, sacred icons and devotional objects from Atelier Saint Sebastian."
        }
        path={category ? `/shop/${category}` : "/shop"}
      />

      <section className="border-b border-stone-dark bg-ivory-dim pb-16 pt-28 sm:pb-20 sm:pt-36">
        <Reveal className="container-editorial editorial-grid items-end gap-y-8">
          <div className="col-span-4 sm:col-span-6 lg:col-span-8 lg:col-start-2">
          <div className="mb-5 flex items-center gap-4"><SectionNumber number={1} /><p className="type-eyebrow text-warmgray">The Shop</p></div>
          <h1 className="type-display-lg max-w-[11ch] text-charcoal">
            {activeCategory ? activeCategory.name : "The Collection"}
          </h1>
          {activeCategory?.description && (
            <p className="mt-4 max-w-lg font-sans text-[15px] leading-relaxed text-warmgray-dark">
              {activeCategory.description}
            </p>
          )}</div>
          <p className="type-caption col-span-4 max-w-[28ch] text-warmgray sm:col-span-2 lg:col-span-2 lg:col-start-10">Hand-finished devotional works, arranged as an evolving atelier catalogue.</p>
        </Reveal>
      </section>

      <div className="container-editorial py-14 sm:py-16">
        <div className="mb-8 flex items-center justify-between md:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.16em] text-charcoal"
          >
            <SlidersHorizontal size={15} strokeWidth={1.5} />
            Filter &amp; Sort
          </button>
          <p className="font-sans text-xs text-warmgray">{products?.length ?? "…"} works</p>
        </div>

        <div className="flex flex-col gap-12 md:flex-row md:gap-12 lg:gap-16">
          <aside className="hidden w-52 shrink-0 md:sticky md:top-28 md:block md:self-start">
            <FiltersPanel categories={categories} filters={filters} onChange={setFilters} />
          </aside>

          <div className="flex-1">
            <div className="mb-8 hidden items-center justify-between md:flex">
              <p className="font-sans text-xs text-warmgray">{products?.length ?? "…"} works</p>
              <SortSelect value={filters.sort} onChange={(sort) => setFilters((f) => ({ ...f, sort }))} />
            </div>
            <ProductGrid products={products} />
          </div>
        </div>
      </div>

      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        categories={categories}
        filters={filters}
        onChange={setFilters}
        resultCount={products?.length ?? 0}
      />
    </>
  );
}
