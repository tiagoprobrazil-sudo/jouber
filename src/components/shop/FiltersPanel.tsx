import type { ProductCategory, ProductFilters } from "@/lib/data/types";

interface FiltersPanelProps {
  categories: ProductCategory[];
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
}

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: "Any price" },
  { label: "Under $50", max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "Over $100", min: 100 },
];

export function FiltersPanel({ categories, filters, onChange }: FiltersPanelProps) {
  return (
    <div className="space-y-10">
      <fieldset>
        <legend className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-warmgray">Category</legend>
        <ul className="space-y-2.5">
          <li>
            <button
              type="button"
              onClick={() => onChange({ ...filters, categorySlug: undefined })}
              className={`font-sans text-sm transition-colors ${
                !filters.categorySlug ? "text-olive" : "text-charcoal hover:text-olive"
              }`}
            >
              All Works
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onChange({ ...filters, categorySlug: c.slug })}
                className={`font-sans text-sm transition-colors ${
                  filters.categorySlug === c.slug ? "text-olive" : "text-charcoal hover:text-olive"
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-warmgray">Price</legend>
        <ul className="space-y-2.5">
          {PRICE_PRESETS.map((preset) => {
            const active = filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <li key={preset.label}>
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, minPrice: preset.min, maxPrice: preset.max })}
                  className={`font-sans text-sm transition-colors ${active ? "text-olive" : "text-charcoal hover:text-olive"}`}
                >
                  {preset.label}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-warmgray">Availability</legend>
        <label className="flex items-center gap-2.5 font-sans text-sm text-charcoal">
          <input
            type="checkbox"
            checked={Boolean(filters.inStockOnly)}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className="h-4 w-4 accent-olive"
          />
          In stock only
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-warmgray">Collection</legend>
        <label className="flex items-center gap-2.5 font-sans text-sm text-charcoal">
          <input
            type="checkbox"
            checked={Boolean(filters.featuredOnly)}
            onChange={(e) => onChange({ ...filters, featuredOnly: e.target.checked })}
            className="h-4 w-4 accent-olive"
          />
          Selected Sacred Works
        </label>
      </fieldset>
    </div>
  );
}
