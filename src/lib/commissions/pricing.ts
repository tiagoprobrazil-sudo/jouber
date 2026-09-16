import { supabase } from "@/lib/supabase/client";

export interface CommissionPricing {
  /** Admin's default labor price, or null if never set (hide pricing until it is). */
  defaultServicePrice: number | null;
  /** Per-product overrides, keyed by CatalogItem.id. */
  overrides: Record<string, number>;
}

/**
 * Public read (no auth) — used by the /commissions catalog page to compute
 * what to show before any request exists. RLS on commission_pricing allows
 * anyone to SELECT (writes are admin-only).
 */
export async function getCommissionPricing(): Promise<CommissionPricing> {
  if (!supabase) return { defaultServicePrice: null, overrides: {} };

  const { data, error } = await supabase.from("commission_pricing").select("product_id, service_price");
  if (error || !data) return { defaultServicePrice: null, overrides: {} };

  let defaultServicePrice: number | null = null;
  const overrides: Record<string, number> = {};
  for (const row of data) {
    if (row.product_id === null) {
      defaultServicePrice = Number(row.service_price);
    } else {
      overrides[row.product_id] = Number(row.service_price);
    }
  }
  return { defaultServicePrice, overrides };
}

/** The price to charge for a given catalog item's labor, or null if the
 * admin hasn't set one yet (default or override) — callers should hide
 * pricing in that case rather than show just the raw file price. */
export function servicePriceFor(pricing: CommissionPricing, productId: string): number | null {
  return pricing.overrides[productId] ?? pricing.defaultServicePrice;
}

// Deliberately not using .upsert()/onConflict here: the "default" row is
// identified by product_id IS NULL, which needs a partial unique index
// (a plain unique constraint treats every NULL as distinct) — and
// PostgREST's on_conflict target can't express that partial predicate.
// Explicit check-then-update-or-insert sidesteps that entirely and is
// simple enough for this low-frequency, admin-only write.
async function upsertServicePrice(productId: string | null, price: number): Promise<void> {
  let existing;
  if (productId === null) {
    ({ data: existing } = await supabase!.from("commission_pricing").select("id").is("product_id", null).maybeSingle());
  } else {
    ({ data: existing } = await supabase!
      .from("commission_pricing")
      .select("id")
      .eq("product_id", productId)
      .maybeSingle());
  }

  if (existing) {
    const { error } = await supabase!
      .from("commission_pricing")
      .update({ service_price: price })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase!
      .from("commission_pricing")
      .insert({ product_id: productId, service_price: price });
    if (error) throw error;
  }
}

export async function setDefaultServicePrice(price: number): Promise<void> {
  await upsertServicePrice(null, price);
}

export async function setProductServicePriceOverride(productId: string, price: number): Promise<void> {
  await upsertServicePrice(productId, price);
}

export async function removeProductServicePriceOverride(productId: string): Promise<void> {
  const { error } = await supabase!.from("commission_pricing").delete().eq("product_id", productId);
  if (error) throw error;
}
