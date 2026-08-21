import type { ComponentProps } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/brand/BrandMark";
import { cn } from "@/lib/utils/cn";

type BrandLogoSize = "sm" | "md" | "lg" | "header";
type BrandLogoTone = "dark" | "light";

interface BrandLogoProps extends Omit<ComponentProps<typeof Link>, "children" | "to"> {
  showMark?: boolean;
  size?: BrandLogoSize;
  tone?: BrandLogoTone;
  to?: ComponentProps<typeof Link>["to"];
}

const lockupSizes: Record<BrandLogoSize, string> = {
  sm: "gap-2.5",
  md: "gap-3",
  lg: "gap-4",
  header: "gap-2.5 sm:gap-3 lg:gap-4",
};

const markSizes: Record<BrandLogoSize, ComponentProps<typeof BrandMark>["size"]> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  header: "header",
};

const atelierSizes: Record<BrandLogoSize, string> = {
  sm: "text-[1.05rem]",
  md: "text-xl",
  lg: "text-2xl",
  header: "text-lg sm:text-xl lg:text-2xl",
};

const nameSizes: Record<BrandLogoSize, string> = {
  sm: "text-[0.65rem]",
  md: "text-[0.7rem]",
  lg: "text-xs",
  header: "text-[0.65rem] sm:text-[0.7rem] lg:text-xs",
};

export function BrandLogo({
  className,
  showMark = true,
  size = "md",
  tone = "dark",
  to = "/",
  ...props
}: BrandLogoProps) {
  const light = tone === "light";

  return (
    <Link
      to={to}
      aria-label="Atelier Saint Sebastian - Home"
      className={cn("inline-flex w-fit items-center", lockupSizes[size], className)}
      {...props}
    >
      {showMark && <BrandMark size={markSizes[size]} />}
      <span className={cn("font-serif leading-none", light ? "text-ivory" : "text-charcoal")}>
        <span className={cn("block", atelierSizes[size])}>Atelier</span>
        <span
          className={cn(
            "mt-1 block font-sans font-medium uppercase tracking-[0.24em]",
            nameSizes[size],
            light ? "text-stone" : "text-charcoal",
          )}
        >
          Saint Sebastian
        </span>
      </span>
    </Link>
  );
}
