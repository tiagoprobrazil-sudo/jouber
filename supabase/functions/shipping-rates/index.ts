// Supabase Edge Function: shipping-rates
//
// Calls the Shippo API (https://goshippo.com/products/api) server-side so
// the Shippo API key never reaches the browser, then returns a simplified
// list of rates to the client (see src/lib/shipping/shippo.ts).
//
// Required secrets (set with `supabase secrets set NAME=value`):
//   SHIPPO_API_KEY          Shippo token, e.g. shippo_test_xxx or shippo_live_xxx
//   SHIPPO_ADDRESS_FROM     JSON string, e.g.
//     {"name":"Atelier Saint Sebastian","street1":"123 Main St","city":"...",
//      "state":"..","zip":"..","country":"US","phone":"+1...","email":"..."}
//
// Deploy with: supabase functions deploy shipping-rates
//
// Request body (see src/lib/shipping/types.ts):
//   { addressTo: ShippingAddress, parcel: Parcel }
// Response:
//   { rates: ShippingRate[] }

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("SHIPPO_API_KEY");
  const addressFromRaw = Deno.env.get("SHIPPO_ADDRESS_FROM");
  if (!apiKey || !addressFromRaw) {
    return jsonResponse(
      { error: "Shipping is not configured yet (missing SHIPPO_API_KEY / SHIPPO_ADDRESS_FROM secrets)." },
      501,
    );
  }

  let addressFrom: ShippingAddress;
  try {
    addressFrom = JSON.parse(addressFromRaw);
  } catch {
    return jsonResponse({ error: "SHIPPO_ADDRESS_FROM secret is not valid JSON" }, 500);
  }

  let body: { addressTo?: ShippingAddress; parcel?: Parcel };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
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
