import { BrandLogo } from "@/components/brand/BrandLogo";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return <BrandLogo className={className} size="md" tone={light ? "light" : "dark"} />;
}
