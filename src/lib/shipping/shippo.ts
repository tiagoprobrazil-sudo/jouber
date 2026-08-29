import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Parcel, ShippingAddress, ShippingRate, ShippingRatesResponse } from "@/lib/shipping/types";

const LATENCY_MS = 180;
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

/**
 * Flat estimate used when no Supabase project (and therefore no
 * `shipping-rates` edge function / Shippo account) is connected yet — so
 * checkout keeps working end to end on the mock/local setup, the same way
 * the rest of the data layer degrades gracefully (see lib/data/repository.ts).
 * Clearly labelled "Estimated" in the UI; never used once Shippo is wired up.
 */
function estimateFallbackRates(address: ShippingAddress): ShippingRate[] {
  const domestic = address.country === "US";
  return [
    {
      id: "estimate-standard",
      provider: "Estimated",
      service: domestic ? "Standard (5-7 business days)" : "International Standard (10-20 business days)",
      amount: domestic ? 8 : 28,
      currency: "USD",
      estimatedDays: domestic ? 6 : 15,
    },
    {
      id: "estimate-expedited",
      provider: "Estimated",
      service: domestic ? "Expedited (2-3 business days)" : "International Expedited (5-10 business days)",
      amount: domestic ? 18 : 48,
      currency: "USD",
      estimatedDays: domestic ? 3 : 7,
    },
  ];
}

/**
 * Requests live carrier rates for a cart from the `shipping-rates` Supabase
 * Edge Function, which holds the Shippo API key server-side and calls
 * https://api.goshippo.com/shipments/ (see supabase/functions/shipping-rates).
 *
 * Falls back to a flat estimate if Supabase isn't configured, or if the
 * function call fails for any reason (network issue, Shippo outage, no
 * carrier accounts connected yet) — shipping quotes should never be able to
 * block checkout entirely.
 */
export async function getShippingRates(address: ShippingAddress, parcel: Parcel): Promise<ShippingRate[]> {
  if (!isSupabaseConfigured) {
    return delay(estimateFallbackRates(address));
  }

  try {
    const { data, error } = await supabase!.functions.invoke<ShippingRatesResponse>("shipping-rates", {
      body: { addressTo: address, parcel },
    });
    if (error) throw error;
    if (!data?.rates?.length) throw new Error("No rates returned");
    return data.rates;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[shipping] shipping-rates function unavailable, using estimate:", err);
    return estimateFallbackRates(address);
  }
}
