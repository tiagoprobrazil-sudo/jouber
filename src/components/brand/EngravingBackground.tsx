import { cn } from "@/lib/utils/cn";
import frameLower from "@/assets/brand/ornaments/frame-lower.webp";
import frameSide from "@/assets/brand/ornaments/frame-side.webp";
import frameTop from "@/assets/brand/ornaments/frame-top.webp";
import paperInk from "@/assets/brand/textures/paper-ink.webp";

type EngravingBackgroundVariant = "frame-lower" | "frame-side" | "frame-top" | "paper";

interface EngravingBackgroundProps {
  className?: string;
  variant: EngravingBackgroundVariant;
}

const assets: Record<EngravingBackgroundVariant, string> = {
  "frame-lower": frameLower,
  "frame-side": frameSide,
  "frame-top": frameTop,
  paper: paperInk,
};

export function EngravingBackground({ className, variant }: EngravingBackgroundProps) {
  return (
    <img
      src={assets[variant]}
      alt=""
      aria-hidden="true"
      className={cn("pointer-events-none block h-full w-full select-none object-cover", className)}
      loading="lazy"
    />
  );
}
