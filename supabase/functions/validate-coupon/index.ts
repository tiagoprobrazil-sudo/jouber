// Supabase Edge Function: validate-coupon
//
// Public, unauthenticated — called from the Cart and Checkout pages as
// the shopper types a code (and again from create-payment-intent right
// before charging) so the coupon rule engine and the coupons/products
// tables never reach the browser. See supabase/functions/_shared/couponEngine.ts.
//
// Deploy with: supabase functions deploy validate-coupon
//
// Request body:
//   {
//     codes: string[],                 // every code currently applied to the cart
//     email?: string,                  // omitted on the Cart page (not collected yet); required for allowed_emails to be enforced
//     items: { productSlug: string; quantity: number; unitPrice: number }[]
//   }
// Response:
//   { applied: AppliedCoupon[], rejected: RejectedCoupon[], discountAmount: number, freeShipping: boolean }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { evaluateCoupons, resolveCartItems } from "../_shared/couponEngine.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

interface ItemInput {
  productSlug?: string;
  quantity?: number;
  unitPrice?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: "Server is not fully configured." }, 501);

  let body: { codes?: string[]; email?: string; items?: ItemInput[] };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const codes = (body.codes ?? []).filter((c): c is string => typeof c === "string" && c.trim().length > 0);
  const items = body.items ?? [];
  if (codes.length === 0) return jsonResponse({ applied: [], rejected: [], discountAmount: 0, freeShipping: false });

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const cart = await resolveCartItems(admin, items);
  const result = await evaluateCoupons(admin, codes, cart, body.email ?? "");
  return jsonResponse(result);
});
