import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

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
