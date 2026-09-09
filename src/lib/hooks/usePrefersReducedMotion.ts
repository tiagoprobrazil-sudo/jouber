import { useEffect, useState } from "react";

/** True when the visitor's OS/browser requests reduced motion — used to skip auto-advancing content (WCAG 2.2.2), not just CSS animation (see the global `prefers-reduced-motion` rule in index.css for that half). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    function onChange() {
      setReduced(query.matches);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
