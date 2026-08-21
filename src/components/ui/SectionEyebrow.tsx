import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type EyebrowTone = "muted" | "light" | "gold" | "olive";

interface SectionEyebrowProps {
  children: ReactNode;
  className?: string;
  tone?: EyebrowTone;
}

const tones: Record<EyebrowTone, string> = {
  muted: "text-ink-muted",
  light: "text-stone",
  gold: "text-gold",
  olive: "text-olive",
};

export function SectionEyebrow({ children, className, tone = "muted" }: SectionEyebrowProps) {
  return <p className={cn("type-eyebrow", tones[tone], className)}>{children}</p>;
}
