import { cn } from "@/lib/utils/cn";
import saintSebastian from "@/assets/brand/saint-sebastian/saint-sebastian-institutional.webp";

interface SaintSebastianIllustrationProps {
  className?: string;
  decorative?: boolean;
}

export function SaintSebastianIllustration({
  className,
  decorative = true,
}: SaintSebastianIllustrationProps) {
  return (
    <img
      src={saintSebastian}
      alt={decorative ? "" : "Hand-drawn engraving of Saint Sebastian bound to a tree"}
      aria-hidden={decorative || undefined}
      className={cn("block h-auto w-full object-contain", className)}
      loading="lazy"
    />
  );
}
