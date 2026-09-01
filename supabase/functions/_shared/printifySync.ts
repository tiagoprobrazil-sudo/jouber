// Shared by printify-catalog (explicit admin import/re-sync) and
// printify-webhook (automatic re-sync on Printify's product:updated event).
// Fetches one product from Printify and upserts it into Jouber's products
// table, keyed by printify_product_id.

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { printifyFetch, type PrintifyConfig, type PrintifyProduct } from "./printify.ts";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export type SyncResult = { ok: true; productId: string; slug: string } | { ok: false; status: number; error: string };

/**
 * Fetches `printifyProductId` from Printify and writes it into Jouber's
 * products table. Pass `createIfMissing: false` (the webhook's case) to
 * only touch a product Jouber already imported — never silently create a
 * new draft product from a background event; an admin imports new
 * products explicitly via /admin/printify.
 */
export async function syncPrintifyProduct(
  admin: SupabaseClient,
  printify: PrintifyConfig,
  printifyProductId: string,
  { createIfMissing }: { createIfMissing: boolean },
): Promise<SyncResult> {
  const { data: existing } = await admin.from("products").select("id, slug").eq("printify_product_id", printifyProductId).maybeSingle();
  if (!existing && !createIfMissing) {
    return { ok: false, status: 204, error: "Not imported into Jouber — nothing to sync." };
  }

  const res = await printifyFetch(printify, `/shops/${printify.shopId}/products/${printifyProductId}.json`);
  if (!res.ok) return { ok: false, status: 502, error: `Could not load Printify product: ${await res.text()}` };
  const product = (await res.json()) as PrintifyProduct;

  const enabledVariants = product.variants.filter((v) => v.is_enabled);
  if (enabledVariants.length === 0) return { ok: false, status: 400, error: "This product has no enabled variants in Printify." };
  const basePrice = Math.min(...enabledVariants.map((v) => v.price)) / 100;
  const images = product.images
    .filter((img, i, all) => all.findIndex((x) => x.src === img.src) === i)
    .sort((a, b) => Number(b.is_default) - Number(a.is_default));

  const columns = {
    title: product.title,
    excerpt: stripHtml(product.description ?? "").slice(0, 140) || product.title,
    description: product.description ?? "",
    price: basePrice,
    currency: "USD",
    sku: enabledVariants[0].sku || product.id,
    stock: 0,
    made_to_order: true,
    lead_time: "5-7 business days (printed to order)",
    printify_product_id: product.id,
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
    let candidateSlug = slugify(product.title);
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
    await admin.from("product_images").insert(images.map((img, i) => ({ product_id: productId, url: img.src, alt: product.title, position: i })));
  }

  await admin.from("product_variants").delete().eq("product_id", productId);
  if (enabledVariants.length > 1) {
    await admin.from("product_variants").insert(
      enabledVariants.map((v) => ({
        product_id: productId,
        name: v.title,
        option_label: "Option",
        price_modifier: Number((v.price / 100 - basePrice).toFixed(2)) || null,
        in_stock: true,
        printify_variant_id: v.id,
      })),
    );
    await admin.from("products").update({ printify_variant_id: null }).eq("id", productId);
  } else {
    await admin.from("products").update({ printify_variant_id: enabledVariants[0].id }).eq("id", productId);
  }

  return { ok: true, productId, slug };
}
