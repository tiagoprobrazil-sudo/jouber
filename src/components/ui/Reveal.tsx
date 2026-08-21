import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils/cn";

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  variant?: "rise" | "fade" | "slide";
}

/** Fades + slides content up the first time it enters the viewport. */
export function Reveal({ children, className, as: Tag = "div", delay = 0, variant = "rise" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(
        "transition-[opacity,transform] duration-[var(--motion-reveal)] ease-[var(--ease-editorial)] motion-reduce:transition-none",
        visible ? "opacity-100 translate-x-0 translate-y-0" : variant === "fade" ? "opacity-0" : variant === "slide" ? "-translate-x-5 opacity-0" : "translate-y-5 opacity-0",
        className,
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
