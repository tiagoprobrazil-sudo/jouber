import type { Product } from "@/lib/data/types";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

interface ProductGridProps {
  products: Product[] | null;
  emptyMessage?: string;
}

export function ProductGrid({ products, emptyMessage = "No works match these filters yet." }: ProductGridProps) {
  if (products && products.length === 0) {
    return <p className="py-20 text-center font-sans text-sm text-warmgray">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-8">
      {products
        ? products.map((p) => <ProductCard key={p.id} product={p} />)
        : Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}
