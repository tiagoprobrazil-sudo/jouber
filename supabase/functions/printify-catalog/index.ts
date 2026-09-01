// Supabase Edge Function: printify-catalog
//
// Backs the admin catalog import page (/admin/printify):
//   GET  -> list products in the connected Printify shop, with a flag for
//           ones already imported into Jouber.
//   POST { printifyProductId } -> import (or re-sync) one product into
//           Jouber's products table, linked via printify_product_id.
//           See _shared/printifySync.ts for the actual sync logic — the
//           same code path printify-webhook uses for automatic re-sync on
//           Printify's product:updated event.
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
import { syncPrintifyProduct } from "../_shared/printifySync.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
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

    const result = await syncPrintifyProduct(admin, printify, body.printifyProductId, { createIfMissing: true });
    if (!result.ok) return jsonResponse({ error: result.error }, result.status);
    return jsonResponse({ productId: result.productId, slug: result.slug });
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
});

function listShopProductsPage(config: NonNullable<ReturnType<typeof getPrintifyConfig>>, page: number) {
  return printifyFetch(config, `/shops/${config.shopId}/products.json?page=${page}&limit=50`);
}
