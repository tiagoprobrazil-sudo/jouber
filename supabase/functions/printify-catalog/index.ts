// Supabase Edge Function: printify-catalog
//
// Backs the admin catalog import page (/admin/printify):
//   GET  -> list products in the connected Printify shop, with a flag for
//           ones already imported into Jouber.
//   POST { printifyProductId } -> import (or re-sync) one product into
//           Jouber's products table, linked via printify_product_id.
//
// Imported products land as active: false (draft) — Printify has no
// concept of Jouber's shop categories, so an admin picks those and
// reviews the copy before publishing. Products are inherently
// print-on-demand (no real inventory), so they import as
// madeToOrder: true with a generic Printify production-time estimate.
//
// Deploy with: supabase functions deploy printify-catalog

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getPrintifyConfig, printifyFetch, type PrintifyProduct } from "../_shared/printify.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  const printify = getPrintifyConfig();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!printify || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Printify is not configured yet (missing PRINTIFY_API_TOKEN/PRINTIFY_SHOP_ID)." }, 501);
  }
  const admin = createClient(supabaseUrl, serviceRoleKey);

  if (req.method === "GET") {
    const products: PrintifyProduct[] = [];
    let page = 1;
    for (;;) {
      const res = await listShopProductsPage(printify, page);
      if (!res.ok) return jsonResponse({ error: "Could not list Printify products", detail: await res.text() }, 502);
      const body = await res.json();
      products.push(...body.data);
      if (page >= body.last_page) break;
      page += 1;
    }

    const { data: linked } = await admin.from("products").select("printify_product_id").not("printify_product_id", "is", null);
    const importedIds = new Set((linked ?? []).map((p) => p.printify_product_id));

    return jsonResponse({
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        image: p.images.find((i) => i.is_default)?.src ?? p.images[0]?.src ?? null,
        variantCount: p.variants.filter((v) => v.is_enabled).length,
        imported: importedIds.has(p.id),
      })),
    });
  }

  if (req.method === "POST") {
    let body: { printifyProductId?: string };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    if (!body.printifyProductId) return jsonResponse({ error: "printifyProductId is required" }, 400);

    const res = await printifyFetch(printify, `/shops/${printify.shopId}/products/${body.printifyProductId}.json`);
    if (!res.ok) return jsonResponse({ error: "Could not load Printify product", detail: await res.text() }, 502);
    const product = (await res.json()) as PrintifyProduct;

    const enabledVariants = product.variants.filter((v) => v.is_enabled);
    if (enabledVariants.length === 0) return jsonResponse({ error: "This product has no enabled variants in Printify." }, 400);
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

    const { data: existing } = await admin.from("products").select("id, slug").eq("printify_product_id", product.id).maybeSingle();

    let productId: string;
    let slug: string;
    if (existing) {
      productId = existing.id;
      slug = existing.slug;
      const { error } = await admin.from("products").update(columns).eq("id", productId);
      if (error) return jsonResponse({ error: "Could not update product", detail: error.message }, 500);
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
      if (error) return jsonResponse({ error: "Could not create product", detail: error.message }, 500);
      productId = created.id;
    }

    await admin.from("product_images").delete().eq("product_id", productId);
    if (images.length) {
      await admin.from("product_images").insert(
        images.map((img, i) => ({ product_id: productId, url: img.src, alt: product.title, position: i })),
      );
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

    return jsonResponse({ productId, slug });
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
});

function listShopProductsPage(config: NonNullable<ReturnType<typeof getPrintifyConfig>>, page: number) {
  return printifyFetch(config, `/shops/${config.shopId}/products.json?page=${page}&limit=50`);
}
