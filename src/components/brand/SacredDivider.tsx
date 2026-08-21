import { CrownMark } from "@/components/brand/CrownMark";
import { cn } from "@/lib/utils/cn";

interface SacredDividerProps {
  className?: string;
}

export function SacredDivider({ className }: SacredDividerProps) {
  return (
    <div className={cn("flex items-center gap-4", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-current opacity-30" />
      <CrownMark className="w-10 opacity-70" />
      <span className="h-px flex-1 bg-current opacity-30" />
    </div>
  );
}
