import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type HeadingLevel = "h1" | "h2" | "h3";
type HeadingSize = "display-xl" | "display-lg" | "heading-lg" | "heading-md";
type HeadingTone = "ink" | "light" | "muted";

interface EditorialHeadingProps {
  as?: HeadingLevel;
  children: ReactNode;
  className?: string;
  size?: HeadingSize;
  tone?: HeadingTone;
}

const sizes: Record<HeadingSize, string> = {
  "display-xl": "type-display-xl",
  "display-lg": "type-display-lg",
  "heading-lg": "type-heading-lg",
  "heading-md": "type-heading-md",
};

const tones: Record<HeadingTone, string> = {
  ink: "text-ink",
  light: "text-ivory",
  muted: "text-ink-muted",
};

export function EditorialHeading({
  as: Tag = "h2",
  children,
  className,
  size = "heading-lg",
  tone = "ink",
}: EditorialHeadingProps) {
  return <Tag className={cn(sizes[size], tones[tone], "text-balance", className)}>{children}</Tag>;
}
