// Thin Printful API client shared across printful-catalog, printful-webhook
// and finalizeOrder. Printful API v1 — see https://developers.printful.com.
//
// Required secret:
//   PRINTFUL_API_TOKEN   Store-level Private Token, Bearer-authenticated —
//                         generated per-store in Printful, so it does not
//                         need a store id alongside it.
// Optional secret:
//   PRINTFUL_STORE_ID    Only needed if the token is an *account*-level
//                         token spanning multiple Printful stores — sent
//                         as the X-PF-Store-Id header. A store-level token
//                         (the normal case for a single-shop setup like
//                         this one) doesn't need it.

const BASE_URL = "https://api.printful.com";

export interface PrintfulConfig {
  token: string;
  storeId?: string;
}

export function getPrintfulConfig(): PrintfulConfig | null {
  const token = Deno.env.get("PRINTFUL_API_TOKEN");
  if (!token) return null;
  const storeId = Deno.env.get("PRINTFUL_STORE_ID") || undefined;
  return { token, storeId };
}

export async function printfulFetch(config: PrintfulConfig, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      ...(config.storeId ? { "X-PF-Store-Id": config.storeId } : {}),
      ...init?.headers,
    },
  });
}

// Printful wraps every response body as { code, result, paging? }.
export interface PrintfulEnvelope<T> {
  code: number;
  result: T;
  paging?: { total: number; offset: number; limit: number };
}

export interface PrintfulSyncVariant {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  retail_price: string; // decimal string, e.g. "24.00"
  sku: string;
  currency: string;
  product: { variant_id: number; product_id: number; image: string; name: string };
}

export interface PrintfulSyncProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url: string;
  is_ignored: boolean;
}

export interface PrintfulProductDetail {
  sync_product: PrintfulSyncProduct;
  sync_variants: PrintfulSyncVariant[];
}

export interface PrintfulShipment {
  carrier: string;
  tracking_number: string;
  tracking_url: string;
  ship_date: string | null;
}

export interface PrintfulOrder {
  id: number;
  external_id: string;
  status: string; // draft | pending | fulfilled | canceled | failed | onhold ...
  shipments?: PrintfulShipment[];
}
