// Supabase Edge Function: get-review-request
//
// Backs the public /review/:token page: resolves a review-request token
// into the product it's for (so the page can show "Review your Our Lady
// of Aparecida statue" instead of a bare form), and whether it's already
// been used.
//
// Deploy with: supabase functions deploy get-review-request
//
// Request body:  { token: string }
// Response:      { productTitle, productSlug, productImage, alreadyReviewed }

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: "Not configured" }, 501);
  const admin = createClient(supabaseUrl, serviceRoleKey);

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  if (!body.token) return jsonResponse({ error: "token is required" }, 400);

  const { data: request } = await admin
    .from("review_requests")
    .select("reviewed_at, products(title, slug, product_images(url, position))")
    .eq("token", body.token)
    .maybeSingle();
  if (!request || !request.products) return jsonResponse({ error: "This review link is invalid." }, 404);

  const product = request.products as unknown as {
    title: string;
    slug: string;
    product_images: { url: string; position: number }[];
  };
  const image = [...(product.product_images ?? [])].sort((a, b) => a.position - b.position)[0]?.url ?? null;

  return jsonResponse({
    productTitle: product.title,
    productSlug: product.slug,
    productImage: image,
    alreadyReviewed: Boolean(request.reviewed_at),
  });
});
