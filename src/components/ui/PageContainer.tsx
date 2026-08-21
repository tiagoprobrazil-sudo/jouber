import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ContainerSize = "editorial" | "narrow" | "full";

interface PageContainerProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  size?: ContainerSize;
}

const sizes: Record<ContainerSize, string> = {
  editorial: "container-editorial",
  narrow: "container-editorial-narrow",
  full: "w-full",
};

export function PageContainer({
  as: Tag = "div",
  children,
  className,
  size = "editorial",
}: PageContainerProps) {
  return <Tag className={cn(sizes[size], className)}>{children}</Tag>;
}
