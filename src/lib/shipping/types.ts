/**
 * Shipping domain types shared between the checkout UI and the
 * `shipping-rates` Supabase Edge Function (supabase/functions/shipping-rates).
 *
 * Keep this file's shapes in sync with the edge function's request/response
 * contract — it is duplicated there (Deno can't import from `src/`).
 */

export interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  /** ISO 3166-1 alpha-2, e.g. "US" */
  country: string;
  email?: string;
  phone?: string;
}

export interface Parcel {
  weightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
}

/** Used for any cart line missing structured shipping data (see Product.shippingWeightOz etc). */
export const DEFAULT_PARCEL: Parcel = {
  weightOz: 16,
  lengthIn: 8,
  widthIn: 8,
  heightIn: 6,
};

export interface ShippingRate {
  id: string;
  provider: string;
  service: string;
  amount: number;
  currency: string;
  estimatedDays?: number;
}

export interface ShippingRatesRequest {
  addressTo: ShippingAddress;
  parcel: Parcel;
}

export interface ShippingRatesResponse {
  rates: ShippingRate[];
}
