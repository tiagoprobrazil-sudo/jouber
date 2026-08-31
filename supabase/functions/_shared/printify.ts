// Thin Printify API client shared across printify-catalog, printify-webhook
// and finalizeOrder. Printify API v1 — see https://developers.printify.com.
//
// Required secrets:
//   PRINTIFY_API_TOKEN   Personal Access Token, Bearer-authenticated
//   PRINTIFY_SHOP_ID     the shop id to operate on (this account has one
//                         shop — see /admin/settings for the connection
//                         status, or GET /v1/shops.json to look it up again)

const BASE_URL = "https://api.printify.com/v1";

export interface PrintifyConfig {
  token: string;
  shopId: string;
}

export function getPrintifyConfig(): PrintifyConfig | null {
  const token = Deno.env.get("PRINTIFY_API_TOKEN");
  const shopId = Deno.env.get("PRINTIFY_SHOP_ID");
  if (!token || !shopId) return null;
  return { token, shopId };
}

export async function printifyFetch(config: PrintifyConfig, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      "User-Agent": "AtelierSaintSebastian/1.0 (jouber)",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export interface PrintifyVariant {
  id: number;
  sku: string;
  price: number; // cents
  title: string;
  is_enabled: boolean;
  is_default: boolean;
}

export interface PrintifyImage {
  src: string;
  position: string;
  is_default: boolean;
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string | null;
  variants: PrintifyVariant[];
  images: PrintifyImage[];
  visible: boolean;
}

export interface PrintifyShipment {
  carrier: string;
  number: string;
  url: string;
  delivered_at: string | null;
}

export interface PrintifyOrder {
  id: string;
  status: string;
  shipments?: PrintifyShipment[];
}
