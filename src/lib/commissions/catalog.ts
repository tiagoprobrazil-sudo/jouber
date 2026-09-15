import type { CatalogPage } from "./types";

/**
 * Fetches the public product feed from Exú Caveira (partner site) directly
 * from the browser — the feed is a read-only, key-gated public API meant
 * for exactly this (see exucaveira's public-products.php). No secret data
 * flows through this key; it only identifies this site as a registered
 * partner and can be revoked/rotated independently on their end.
 */
const API_BASE = "https://exucaveira.com.br/api/public-products.php";
const PARTNER_KEY = import.meta.env.VITE_EXUCAVEIRA_PARTNER_KEY as string | undefined;

export async function getCommissionCatalog(options: {
  page?: number;
  pageSize?: number;
  category?: string;
} = {}): Promise<CatalogPage> {
  if (!PARTNER_KEY) {
    throw new Error(
      "VITE_EXUCAVEIRA_PARTNER_KEY is not set. Request a partner key via exucaveira.com.br's admin-partners.php and add it to .env.",
    );
  }

  const params = new URLSearchParams({
    page: String(options.page ?? 1),
    pageSize: String(options.pageSize ?? 24),
  });
  if (options.category) params.set("category", options.category);

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: { "X-Partner-Key": PARTNER_KEY },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.message || "Could not load the commission catalog.");
  }

  return json.data as CatalogPage;
}
