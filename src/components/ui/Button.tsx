import { forwardRef } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

const base =
  "group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-[13px] tracking-[0.14em] uppercase transition-[background-color,color,transform] duration-300 active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-charcoal text-ivory hover:bg-olive",
  secondary: "border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory",
  ghost: "text-charcoal hover:text-olive",
};

const sizes: Record<Size, string> = {
  md: "px-8 py-3.5",
  sm: "px-5 py-2.5 text-[12px]",
};

const iconWrap = "inline-flex transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/btn:translate-x-0";

interface ButtonOwnProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

type ButtonProps = ButtonOwnProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon, className, children, ...props },
  ref,
) {
  return (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
      {icon && <span className={iconWrap}>{icon}</span>}
    </button>
  );
});

type ButtonLinkProps = ButtonOwnProps & LinkProps;

export function ButtonLink({ variant = "primary", size = "md", icon, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
      {icon && <span className={iconWrap}>{icon}</span>}
    </Link>
  );
}

type ButtonAnchorProps = ButtonOwnProps & AnchorHTMLAttributes<HTMLAnchorElement>;

export function ButtonAnchor({ variant = "primary", size = "md", icon, className, children, ...props }: ButtonAnchorProps) {
  return (
    <a className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
      {icon && <span className={iconWrap}>{icon}</span>}
    </a>
  );
}
