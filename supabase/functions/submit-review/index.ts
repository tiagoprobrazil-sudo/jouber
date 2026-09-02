// Supabase Edge Function: submit-review
//
// Handles both review-submission paths:
//   - Verified purchase: { token, rating, text, authorName } — token comes
//     from the review-request email link (/review/:token). Product,
//     email and order_item linkage are all resolved server-side from the
//     token (via review_requests), never trusted from the client.
//   - Open (product page "Write a review"): { productSlug, rating, text,
//     authorName, email? } — anyone, no purchase required.
//
// Both land as status: "pending" — an admin has to approve it in
// /admin/reviews before it's shown publicly (RLS already enforces this:
// "reviews: public read approved").
//
// Deploy with: supabase functions deploy submit-review

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

  let body: { token?: string; productSlug?: string; rating?: number; text?: string; authorName?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const rating = Math.round(Number(body.rating));
  const text = (body.text ?? "").trim().slice(0, 2000);
  const authorName = (body.authorName ?? "").trim().slice(0, 80);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return jsonResponse({ error: "rating must be 1-5" }, 400);
  if (!text) return jsonResponse({ error: "A review needs some text." }, 400);
  if (!authorName) return jsonResponse({ error: "Your name is required." }, 400);

  if (body.token) {
    const { data: request } = await admin
      .from("review_requests")
      .select("id, product_id, email, order_item_id, reviewed_at")
      .eq("token", body.token)
      .maybeSingle();
    if (!request) return jsonResponse({ error: "This review link is invalid." }, 404);
    if (request.reviewed_at) return jsonResponse({ error: "This purchase has already been reviewed." }, 409);
    if (!request.product_id) return jsonResponse({ error: "The product for this review is no longer available." }, 400);

    const { error: insertError } = await admin.from("reviews").insert({
      product_id: request.product_id,
      author: authorName,
      email: request.email,
      rating,
      body: text,
      status: "pending",
      is_verified_purchase: true,
      order_item_id: request.order_item_id,
    });
    if (insertError) return jsonResponse({ error: "Could not save your review.", detail: insertError.message }, 500);

    await admin.from("review_requests").update({ reviewed_at: new Date().toISOString() }).eq("id", request.id);
    return jsonResponse({ ok: true });
  }

  // Open path — no purchase verification.
  if (!body.productSlug) return jsonResponse({ error: "productSlug is required" }, 400);
  const { data: product } = await admin.from("products").select("id").eq("slug", body.productSlug).maybeSingle();
  if (!product) return jsonResponse({ error: "Product not found" }, 404);

  const { error: insertError } = await admin.from("reviews").insert({
    product_id: product.id,
    author: authorName,
    email: body.email?.trim().slice(0, 200) || null,
    rating,
    body: text,
    status: "pending",
    is_verified_purchase: false,
  });
  if (insertError) return jsonResponse({ error: "Could not save your review.", detail: insertError.message }, 500);

  return jsonResponse({ ok: true });
});
