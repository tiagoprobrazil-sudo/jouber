// Supabase Edge Function: printful-shipping
//
// Quotes real shipping cost for the Printful-fulfilled lines in a cart via
// Printful's own POST /shipping/rates — those items ship from the print
// provider's facility, not the atelier, so Shippo's atelier-address quote
// (see shipping-rates) doesn't apply to them. Checkout combines this with
// the Shippo quote for any non-Printful lines in the same cart.
//
// Confirmed by direct testing against the real API (2026-09-04): this
// endpoint is `/shipping/rates` (not `/shipping-rates`, as Printful's own
// docs page summary suggested), and each item needs the *catalog*
// variant_id — the sync_variant_id used for order creation is rejected
// here. See _shared/printfulSync.ts for where catalogVariantId comes from.
//
// Deploy with: supabase functions deploy printful-shipping
//
// Request body:  { items: [{ catalogVariantId, quantity }], address: ShippingAddress }
// Response:      { amount: number } (dollars, "STANDARD" rate)

import { getPrintfulConfig, printfulFetch, type PrintfulEnvelope } from "../_shared/printful.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

interface Item {
  catalogVariantId: number;
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

interface PrintfulRate {
  id: string;
  name: string;
  rate: string;
  currency: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const config = getPrintfulConfig();
  if (!config) return jsonResponse({ error: "Printful is not configured." }, 501);

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

  const res = await printfulFetch(config, "/shipping/rates", {
    method: "POST",
    body: JSON.stringify({
      recipient: {
        address1: address.street1,
        address2: address.street2 || "",
        city: address.city,
        state_code: address.state || "",
        country_code: address.country,
        zip: address.zip,
      },
      items: items.map((i) => ({ variant_id: i.catalogVariantId, quantity: i.quantity })),
    }),
  });

  if (!res.ok) {
    return jsonResponse({ error: "Could not get a Printful shipping quote", detail: await res.text() }, 502);
  }
  const envelope = (await res.json()) as PrintfulEnvelope<PrintfulRate[]>;
  const rates = envelope.result ?? [];
  const standard = rates.find((r) => r.id === "STANDARD") ?? rates[0];
  if (!standard) return jsonResponse({ error: "Printful did not return any shipping rates" }, 502);

  return jsonResponse({ amount: Number(standard.rate) });
});
