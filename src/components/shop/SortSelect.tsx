import type { ProductFilters } from "@/lib/data/types";

const OPTIONS: { value: NonNullable<ProductFilters["sort"]>; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

interface SortSelectProps {
  value: ProductFilters["sort"];
  onChange: (value: ProductFilters["sort"]) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-warmgray">
      Sort by
      <select
        value={value ?? "featured"}
        onChange={(e) => onChange(e.target.value as ProductFilters["sort"])}
        className="border-b border-warmgray bg-transparent py-1 pl-2 pr-1 text-charcoal focus:outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
