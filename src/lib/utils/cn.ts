import { clsx, type ClassValue } from "clsx";

/** Small classname combinator; kept as its own helper in case a
 * Tailwind-merge dependency is added later. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
