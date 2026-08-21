import { cn } from "@/lib/utils/cn";
import logoIcon from "@/assets/images/brand/logo-icon.webp";

type BrandMarkSize = "sm" | "md" | "lg" | "xl";

interface BrandMarkProps {
  className?: string;
  decorative?: boolean;
  size?: BrandMarkSize;
}

const sizes: Record<BrandMarkSize, string> = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

export function BrandMark({ className, decorative = true, size = "md" }: BrandMarkProps) {
  return (
    <img
      src={logoIcon}
      alt={decorative ? "" : "Atelier Saint Sebastian"}
      aria-hidden={decorative || undefined}
      className={cn("shrink-0 object-contain", sizes[size], className)}
      width="360"
      height="444"
    />
  );
}
