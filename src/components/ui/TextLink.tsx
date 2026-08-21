import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils/cn";

interface SharedProps {
  children: ReactNode;
  className?: string;
  externalIndicator?: boolean;
}

type TextLinkProps = SharedProps & LinkProps;
type TextAnchorProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement>;

const base = "link-underline inline-flex w-fit items-center gap-2 font-sans text-xs font-medium uppercase tracking-[0.14em] text-current transition-colors duration-300";

function Indicator() {
  return <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.5} />;
}

export function TextLink({ children, className, externalIndicator = false, ...props }: TextLinkProps) {
  return (
    <Link className={cn(base, className)} {...props}>
      {children}
      {externalIndicator && <Indicator />}
    </Link>
  );
}

export function TextAnchor({ children, className, externalIndicator = true, ...props }: TextAnchorProps) {
  return (
    <a className={cn(base, className)} {...props}>
      {children}
      {externalIndicator && <Indicator />}
    </a>
  );
}
