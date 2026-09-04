import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ShippingAddress } from "@/lib/shipping/types";

export interface PrintfulCatalogProduct {
  id: number;
  title: string;
  image: string | null;
  variantCount: number;
  imported: boolean;
}

export const isPrintfulClientReady = isSupabaseConfigured;

/** Calls printful-catalog (GET) to list every sync product in the connected Printful store. */
export async function listPrintfulProducts(): Promise<PrintfulCatalogProduct[]> {
  const { data, error } = await supabase!.functions.invoke<{ products: PrintfulCatalogProduct[] }>("printful-catalog", {
    method: "GET",
  });
  if (error || !data) throw error ?? new Error("Could not load the Printful catalog.");
  return data.products;
}

/** Calls printful-catalog (POST) to import (or re-sync) one Printful product into Jouber's products table. */
export async function importPrintfulProduct(printfulProductId: number): Promise<{ productId: string; slug: string }> {
  const { data, error } = await supabase!.functions.invoke<{ productId: string; slug: string }>("printful-catalog", {
    body: { printfulProductId },
  });
  if (error || !data) throw error ?? new Error("Could not import this product.");
  return data;
}

export interface PrintfulShippingItem {
  /** Printful's *catalog* variant id — not the sync variant id used for orders. See _shared/printfulSync.ts. */
  catalogVariantId: number;
  quantity: number;
}

/** Quotes real shipping cost for Printful-fulfilled cart lines via printful-shipping — see Checkout.tsx. */
export async function getPrintfulShippingCost(items: PrintfulShippingItem[], address: ShippingAddress): Promise<number> {
  const { data, error } = await supabase!.functions.invoke<{ amount: number }>("printful-shipping", {
    body: { items, address },
  });
  if (error || !data) throw error ?? new Error("Could not get a Printful shipping quote.");
  return data.amount;
}

/** Admin-only: (re)submits an order's Printful-linked items — see printful-resend. */
export async function resendOrderToPrintful(orderId: string): Promise<number> {
  const { data, error } = await supabase!.functions.invoke<{ printfulOrderId: number }>("printful-resend", {
    body: { orderId },
  });
  if (error || !data) throw error ?? new Error("Could not resend this order to Printful.");
  return data.printfulOrderId;
}

/** Admin-only: cancels an order's Printful submission — only works before it enters production. See printful-cancel-order. */
export async function cancelPrintfulOrder(orderId: string): Promise<void> {
  const { data, error } = await supabase!.functions.invoke<{ ok: true }>("printful-cancel-order", {
    body: { orderId },
  });
  if (error || !data?.ok) throw error ?? new Error("Could not cancel this order.");
}

export interface PrintfulOrderSummary {
  id: number;
  status: string;
  totalCents: number;
  createdAt: string;
  customerName: string | null;
  itemCount: number;
  trackingUrl: string | null;
}

/** Admin-only: lists every order in the connected Printful store, for reconciliation — see printful-orders. */
export async function listPrintfulOrders(): Promise<PrintfulOrderSummary[]> {
  const { data, error } = await supabase!.functions.invoke<{ orders: PrintfulOrderSummary[] }>("printful-orders", {
    method: "GET",
  });
  if (error || !data) throw error ?? new Error("Could not load Printful orders.");
  return data.orders;
}
