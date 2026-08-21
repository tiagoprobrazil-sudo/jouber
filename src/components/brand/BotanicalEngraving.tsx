import { cn } from "@/lib/utils/cn";
import botanicalBranch from "@/assets/brand/engravings/botanical-branch.webp";

interface BotanicalEngravingProps {
  className?: string;
}

export function BotanicalEngraving({ className }: BotanicalEngravingProps) {
  return (
    <img
      src={botanicalBranch}
      alt=""
      aria-hidden="true"
      className={cn("pointer-events-none block h-auto w-full select-none object-contain", className)}
      loading="lazy"
    />
  );
}
