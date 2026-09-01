// Supabase Edge Function: printify-shipping
//
// Quotes real shipping cost for the Printify-fulfilled lines in a cart via
// Printify's own /orders/shipping.json — those items ship from the print
// provider's facility, not the atelier, so Shippo's atelier-address quote
// (see shipping-rates) doesn't apply to them. Checkout combines this with
// the Shippo quote for any non-Printify lines in the same cart.
//
// Deploy with: supabase functions deploy printify-shipping
//
// Request body:  { items: [{ productId, variantId, quantity }], address: ShippingAddress }
// Response:      { amount: number } (dollars, "standard" tier)

import { getPrintifyConfig, printifyFetch } from "../_shared/printify.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

interface Item {
  productId: string;
  variantId: number;
  quantity: number;
}

interface Address {
  name?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  email?: string;
  phone?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const config = getPrintifyConfig();
  if (!config) return jsonResponse({ error: "Printify is not configured." }, 501);

  let body: { items?: Item[]; address?: Address };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { items, address } = body;
  if (!items?.length) return jsonResponse({ error: "items is required" }, 400);
  if (!address?.street1 || !address.city || !address.zip || !address.country) {
    return jsonResponse({ error: "address is missing required fields" }, 400);
  }

  const [firstName, ...rest] = (address.name ?? "").split(" ");

  const res = await printifyFetch(config, `/shops/${config.shopId}/orders/shipping.json`, {
    method: "POST",
    body: JSON.stringify({
      line_items: items.map((i) => ({ product_id: i.productId, variant_id: i.variantId, quantity: i.quantity })),
      address_to: {
        first_name: firstName || "Customer",
        last_name: rest.join(" ") || "-",
        email: address.email || "",
        phone: address.phone || "",
        address1: address.street1,
        address2: address.street2 || "",
        city: address.city,
        region: address.state || "",
        zip: address.zip,
        country: address.country,
      },
    }),
  });

  if (!res.ok) {
    return jsonResponse({ error: "Could not get a Printify shipping quote", detail: await res.text() }, 502);
  }
  const costs = await res.json();
  if (typeof costs.standard !== "number") {
    return jsonResponse({ error: "Printify did not return a standard shipping cost" }, 502);
  }

  return jsonResponse({ amount: costs.standard / 100 });
});
