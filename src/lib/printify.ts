import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ShippingAddress } from "@/lib/shipping/types";

export interface PrintifyCatalogProduct {
  id: string;
  title: string;
  image: string | null;
  variantCount: number;
  imported: boolean;
}

export const isPrintifyClientReady = isSupabaseConfigured;

/** Calls printify-catalog (GET) to list every product in the connected Printify shop. */
export async function listPrintifyProducts(): Promise<PrintifyCatalogProduct[]> {
  const { data, error } = await supabase!.functions.invoke<{ products: PrintifyCatalogProduct[] }>("printify-catalog", {
    method: "GET",
  });
  if (error || !data) throw error ?? new Error("Could not load the Printify catalog.");
  return data.products;
}

/** Calls printify-catalog (POST) to import (or re-sync) one Printify product into Jouber's products table. */
export async function importPrintifyProduct(printifyProductId: string): Promise<{ productId: string; slug: string }> {
  const { data, error } = await supabase!.functions.invoke<{ productId: string; slug: string }>("printify-catalog", {
    body: { printifyProductId },
  });
  if (error || !data) throw error ?? new Error("Could not import this product.");
  return data;
}

export interface PrintifyShippingItem {
  productId: string;
  variantId: number;
  quantity: number;
}

/** Quotes real shipping cost for Printify-fulfilled cart lines via printify-shipping — see Checkout.tsx. */
export async function getPrintifyShippingCost(items: PrintifyShippingItem[], address: ShippingAddress): Promise<number> {
  const { data, error } = await supabase!.functions.invoke<{ amount: number }>("printify-shipping", {
    body: { items, address },
  });
  if (error || !data) throw error ?? new Error("Could not get a Printify shipping quote.");
  return data.amount;
}
