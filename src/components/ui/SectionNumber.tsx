import { cn } from "@/lib/utils/cn";

interface SectionNumberProps {
  className?: string;
  number: number | string;
}

export function SectionNumber({ className, number }: SectionNumberProps) {
  const label = typeof number === "number" ? String(number).padStart(2, "0") : number;

  return (
    <span aria-hidden="true" className={cn("type-caption font-medium tabular-nums text-warmgray", className)}>
      {label}
    </span>
  );
}
