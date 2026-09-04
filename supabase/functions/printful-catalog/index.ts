// Supabase Edge Function: printful-catalog
//
// Backs the admin catalog import page (/admin/printful):
//   GET  -> list sync products in the connected Printful store, with a
//           flag for ones already imported into Jouber.
//   POST { printfulProductId } -> import (or re-sync) one product into
//           Jouber's products table, linked via printful_product_id.
//           See _shared/printfulSync.ts for the actual sync logic — the
//           same code path printful-webhook uses for automatic re-sync on
//           Printful's product-updated event.
//
// Imported products land as active: false (draft) — Printful has no
// concept of Jouber's shop categories or marketing copy, so an admin
// picks categories and writes a description before publishing. Products
// are inherently print-on-demand (no real inventory), so they import as
// madeToOrder: true with a generic production-time estimate.
//
// Deploy with: supabase functions deploy printful-catalog

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getPrintfulConfig, printfulFetch, type PrintfulEnvelope, type PrintfulSyncProduct } from "../_shared/printful.ts";
import { syncPrintfulProduct } from "../_shared/printfulSync.ts";

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

  const printful = getPrintfulConfig();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!printful || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Printful is not configured yet (missing PRINTFUL_API_TOKEN)." }, 501);
  }
  const admin = createClient(supabaseUrl, serviceRoleKey);

  if (req.method === "GET") {
    const products: PrintfulSyncProduct[] = [];
    let offset = 0;
    const limit = 100;
    for (;;) {
      const res = await printfulFetch(printful, `/store/products?offset=${offset}&limit=${limit}`);
      if (!res.ok) return jsonResponse({ error: "Could not list Printful products", detail: await res.text() }, 502);
      const body = (await res.json()) as PrintfulEnvelope<PrintfulSyncProduct[]>;
      products.push(...body.result);
      const total = body.paging?.total ?? products.length;
      offset += limit;
      if (offset >= total) break;
    }

    const { data: linked } = await admin.from("products").select("id, printful_product_id").not("printful_product_id", "is", null);
    const importedProductIds = new Map((linked ?? []).map((p) => [p.printful_product_id, p.id]));

    return jsonResponse({
      products: products.map((p) => ({
        id: p.id,
        title: p.name,
        image: p.thumbnail_url ?? null,
        variantCount: p.variants,
        imported: importedProductIds.has(p.id),
        // Lets the admin UI link straight to the edit page across a page
        // refresh, not just right after clicking Import this session.
        productId: importedProductIds.get(p.id) ?? null,
      })),
    });
  }

  if (req.method === "POST") {
    let body: { printfulProductId?: number };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    if (!body.printfulProductId) return jsonResponse({ error: "printfulProductId is required" }, 400);

    const result = await syncPrintfulProduct(admin, printful, body.printfulProductId, { createIfMissing: true });
    if (!result.ok) return jsonResponse({ error: result.error }, result.status);
    return jsonResponse({ productId: result.productId, slug: result.slug });
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
});
