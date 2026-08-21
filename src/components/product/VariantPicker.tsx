import type { ProductVariant } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

interface VariantPickerProps {
  variants: ProductVariant[];
  selected: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export function VariantPicker({ variants, selected, onSelect }: VariantPickerProps) {
  const label = variants[0]?.optionLabel ?? "Option";

  return (
    <fieldset>
      <legend className="mb-3 font-sans text-xs uppercase tracking-[0.16em] text-warmgray">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <button
            key={v.id}
            type="button"
            disabled={!v.inStock}
            onClick={() => onSelect(v)}
            aria-pressed={selected?.id === v.id}
            className={cn(
              "border px-4 py-2 font-sans text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              selected?.id === v.id
                ? "border-charcoal bg-charcoal text-ivory"
                : "border-stone-dark text-charcoal hover:border-charcoal",
            )}
          >
            {v.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
