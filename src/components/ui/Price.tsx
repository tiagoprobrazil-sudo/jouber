import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface PriceProps {
  price: number;
  compareAtPrice?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
};

export function Price({ price, compareAtPrice, className, size = "sm" }: PriceProps) {
  const onSale = compareAtPrice != null && compareAtPrice > price;
  return (
    <span className={cn("inline-flex items-baseline gap-2 font-sans", sizes[size], className)}>
      <span className={onSale ? "text-olive" : "text-charcoal"}>{formatPrice(price)}</span>
      {onSale && (
        <span className="text-warmgray line-through text-[0.85em]">{formatPrice(compareAtPrice!)}</span>
      )}
    </span>
  );
}
