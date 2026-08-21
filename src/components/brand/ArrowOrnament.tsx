import { cn } from "@/lib/utils/cn";
import arrowDiagonal from "@/assets/brand/ornaments/arrow-diagonal.webp";
import arrowHorizontal from "@/assets/brand/ornaments/arrow-horizontal.webp";
import arrowVertical from "@/assets/brand/ornaments/arrow-vertical.webp";

type ArrowDirection = "diagonal" | "horizontal" | "vertical";

interface ArrowOrnamentProps {
  className?: string;
  direction?: ArrowDirection;
}

const arrows: Record<ArrowDirection, string> = {
  diagonal: arrowDiagonal,
  horizontal: arrowHorizontal,
  vertical: arrowVertical,
};

export function ArrowOrnament({ className, direction = "horizontal" }: ArrowOrnamentProps) {
  return (
    <img
      src={arrows[direction]}
      alt=""
      aria-hidden="true"
      className={cn("pointer-events-none block h-auto max-w-full select-none object-contain", className)}
      loading="lazy"
    />
  );
}
