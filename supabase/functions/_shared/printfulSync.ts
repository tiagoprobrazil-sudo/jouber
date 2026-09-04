// Shared by printful-catalog (explicit admin import/re-sync) and
// printful-webhook (automatic re-sync on Printful's product-updated event).
// Fetches one product from Printful and upserts it into Jouber's products
// table, keyed by printful_product_id.

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { printfulFetch, type PrintfulConfig, type PrintfulEnvelope, type PrintfulProductDetail } from "./printful.ts";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type SyncResult = { ok: true; productId: string; slug: string } | { ok: false; status: number; error: string };

/**
 * Fetches `printfulProductId` from Printful and writes it into Jouber's
 * products table. Pass `createIfMissing: false` (the webhook's case) to
 * only touch a product Jouber already imported — never silently create a
 * new draft product from a background event; an admin imports new
 * products explicitly via /admin/printful.
 *
 * Note: unlike Printify, a Printful "sync product" carries no marketing
 * description — only a name, a thumbnail and its variants — so the
 * imported draft's description starts empty and needs the admin to write
 * one before publishing.
 */
export async function syncPrintfulProduct(
  admin: SupabaseClient,
  printful: PrintfulConfig,
  printfulProductId: number,
  { createIfMissing }: { createIfMissing: boolean },
): Promise<SyncResult> {
  const { data: existing } = await admin.from("products").select("id, slug").eq("printful_product_id", printfulProductId).maybeSingle();
  if (!existing && !createIfMissing) {
    return { ok: false, status: 204, error: "Not imported into Jouber — nothing to sync." };
  }

  const res = await printfulFetch(printful, `/store/products/${printfulProductId}`);
  if (!res.ok) return { ok: false, status: 502, error: `Could not load Printful product: ${await res.text()}` };
  const body = (await res.json()) as PrintfulEnvelope<PrintfulProductDetail>;
  const product = body.result.sync_product;
  const variants = body.result.sync_variants;

  const syncedVariants = variants.filter((v) => v.synced);
  if (syncedVariants.length === 0) return { ok: false, status: 400, error: "This product has no synced variants in Printful." };
  const basePrice = Math.min(...syncedVariants.map((v) => Number(v.retail_price)));
  const images = [...new Set(syncedVariants.map((v) => v.product?.image).filter((src): src is string => Boolean(src)))].map((src, i) => ({
    src,
    position: i,
  }));

  const columns = {
    title: product.name,
    excerpt: product.name.slice(0, 140),
    description: "",
    price: basePrice,
    currency: "USD",
    sku: syncedVariants[0].sku || String(product.id),
    stock: 0,
    made_to_order: true,
    lead_time: "5-7 business days (printed to order)",
    printful_product_id: product.id,
    active: false,
    featured: false,
    customizable: false,
  };

  let productId: string;
  let slug: string;
  if (existing) {
    productId = existing.id;
    slug = existing.slug;
    const { error } = await admin.from("products").update(columns).eq("id", productId);
    if (error) return { ok: false, status: 500, error: `Could not update product: ${error.message}` };
  } else {
    let candidateSlug = slugify(product.name);
    let suffix = 0;
    for (;;) {
      const trySlug = suffix === 0 ? candidateSlug : `${candidateSlug}-${suffix}`;
      const { data: taken } = await admin.from("products").select("id").eq("slug", trySlug).maybeSingle();
      if (!taken) {
        candidateSlug = trySlug;
        break;
      }
      suffix += 1;
    }
    slug = candidateSlug;
    const { data: created, error } = await admin.from("products").insert({ ...columns, slug }).select("id").single();
    if (error) return { ok: false, status: 500, error: `Could not create product: ${error.message}` };
    productId = created.id;
  }

  await admin.from("product_images").delete().eq("product_id", productId);
  if (images.length) {
    await admin.from("product_images").insert(images.map((img, i) => ({ product_id: productId, url: img.src, alt: product.name, position: i })));
  }

  await admin.from("product_variants").delete().eq("product_id", productId);
  if (syncedVariants.length > 1) {
    await admin.from("product_variants").insert(
      syncedVariants.map((v) => ({
        product_id: productId,
        name: v.name,
        option_label: "Option",
        price_modifier: Number((Number(v.retail_price) - basePrice).toFixed(2)) || null,
        in_stock: true,
        printful_variant_id: v.id,
      })),
    );
    await admin.from("products").update({ printful_variant_id: null }).eq("id", productId);
  } else {
    await admin.from("products").update({ printful_variant_id: syncedVariants[0].id }).eq("id", productId);
  }

  return { ok: true, productId, slug };
}
