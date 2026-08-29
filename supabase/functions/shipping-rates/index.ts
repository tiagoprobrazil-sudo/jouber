// Supabase Edge Function: shipping-rates
//
// Calls the Shippo API (https://goshippo.com/products/api) server-side so
// the Shippo API key never reaches the browser, then returns a simplified
// list of rates to the client (see src/lib/shipping/shippo.ts).
//
// Required secret (set with `supabase secrets set SHIPPO_API_KEY=...`):
//   SHIPPO_API_KEY  Shippo token, e.g. shippo_test_xxx or shippo_live_xxx
//
// The ship-from address is NOT a secret — it's read from the
// `store_settings` table (key 'shippo_address_from'), editable by an
// admin at /admin/settings (see src/pages/admin/Settings.tsx). This
// function uses the SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY env vars
// Supabase injects into every Edge Function automatically (no secret to
// set) to read it, bypassing RLS since this function itself is trusted.
//
// Deploy with: supabase functions deploy shipping-rates
//
// Request body (see src/lib/shipping/types.ts):
//   { addressTo: ShippingAddress, parcel: Parcel }
//   or { statusCheck: true } — a cheap connectivity/config check used by
//   the admin Settings panel that does NOT call Shippo.
// Response:
//   { rates: ShippingRate[] } or { ok: boolean, keyMode, addressFromConfigured }

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  email?: string;
  phone?: string;
}

interface Parcel {
  weightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function toShippoAddress(address: ShippingAddress) {
  return {
    name: address.name,
    street1: address.street1,
    street2: address.street2 || undefined,
    city: address.city,
    state: address.state,
    zip: address.zip,
    country: address.country,
    email: address.email || undefined,
    phone: address.phone || undefined,
  };
}

function toShippoParcel(parcel: Parcel) {
  return {
    length: String(parcel.lengthIn),
    width: String(parcel.widthIn),
    height: String(parcel.heightIn),
    distance_unit: "in",
    weight: String(parcel.weightOz),
    mass_unit: "oz",
  };
}

async function getAddressFrom(): Promise<ShippingAddress | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await admin.from("store_settings").select("value").eq("key", "shippo_address_from").maybeSingle();
  if (error || !data) return null;
  return data.value as ShippingAddress;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("SHIPPO_API_KEY");
  const keyMode = apiKey?.startsWith("shippo_live_") ? "live" : apiKey?.startsWith("shippo_test_") ? "test" : "unknown";

  let body: { addressTo?: ShippingAddress; parcel?: Parcel; statusCheck?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (body.statusCheck) {
    const addressFrom = await getAddressFrom();
    return jsonResponse({ ok: Boolean(apiKey), keyMode, addressFromConfigured: Boolean(addressFrom?.street1) });
  }

  if (!apiKey) {
    return jsonResponse({ error: "Shipping is not configured yet (missing SHIPPO_API_KEY secret)." }, 501);
  }

  const addressFrom = await getAddressFrom();
  if (!addressFrom?.street1) {
    return jsonResponse({ error: "Ship-from address is not configured — set it in /admin/settings." }, 501);
  }

  const { addressTo, parcel } = body;
  if (!addressTo?.street1 || !addressTo.city || !addressTo.zip || !addressTo.country) {
    return jsonResponse({ error: "addressTo is missing required fields" }, 400);
  }
  if (!parcel?.weightOz || !parcel.lengthIn || !parcel.widthIn || !parcel.heightIn) {
    return jsonResponse({ error: "parcel is missing required fields" }, 400);
  }

  const shippoRes = await fetch("https://api.goshippo.com/shipments/", {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address_from: toShippoAddress(addressFrom),
      address_to: toShippoAddress(addressTo),
      parcels: [toShippoParcel(parcel)],
      async: false,
    }),
  });

  if (!shippoRes.ok) {
    const detail = await shippoRes.text();
    return jsonResponse({ error: "Shippo request failed", detail }, 502);
  }

  const shipment = await shippoRes.json();
  if (shipment.status === "ERROR") {
    return jsonResponse({ error: "Shippo could not create the shipment", detail: shipment.messages }, 502);
  }

  interface ShippoRate {
    object_id: string;
    provider: string;
    servicelevel: { name: string };
    amount: string;
    currency: string;
    estimated_days?: number;
  }

  const rates = ((shipment.rates ?? []) as ShippoRate[])
    .map((rate) => ({
      id: rate.object_id,
      provider: rate.provider,
      service: rate.servicelevel?.name ?? "Shipping",
      amount: Number(rate.amount),
      currency: rate.currency,
      estimatedDays: rate.estimated_days,
    }))
    .sort((a, b) => a.amount - b.amount);

  return jsonResponse({ rates });
});
