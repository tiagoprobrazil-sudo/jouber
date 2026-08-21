import { cn } from "@/lib/utils/cn";
import crownCross from "@/assets/brand/ornaments/crown-cross.webp";

interface CrownMarkProps {
  className?: string;
}

export function CrownMark({ className }: CrownMarkProps) {
  return (
    <img
      src={crownCross}
      alt=""
      aria-hidden="true"
      className={cn("pointer-events-none block h-auto max-w-full select-none object-contain", className)}
      loading="lazy"
    />
  );
}
