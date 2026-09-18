// Supabase Edge Function: create-product-quote-request
//
// Called from a `quote_only` product's page (src/components/product/ProductQuoteModal.tsx)
// when a visitor submits "Request My Quote". Persists the request
// (product_quote_requests table, visible at /admin/commissions or a
// dedicated admin view) and emails a notification via Resend.
//
// Distinct from create-commission-request, which is for the separate
// "Commission a Piece" flow sourced from an external catalog.
//
// Deploy with: supabase functions deploy create-product-quote-request --no-verify-jwt
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
// ADMIN_NOTIFICATION_EMAIL (same secrets already used by create-commission-request).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendEmail } from "../_shared/resend.ts";

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

interface RequestBody {
  product: {
    id: string;
    title: string;
    url: string;
    image?: string;
    variantName?: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  desiredSize: string;
  finish: string;
  customization: boolean;
  zipCode?: string;
  message?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Server is not fully configured." }, 501);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const product = body.product;
  const customer = body.customer;

  if (!product?.id || !product?.title || !product?.url) {
    return jsonResponse({ error: "Missing product information." }, 400);
  }
  if (!customer?.name?.trim() || !customer?.email?.trim()) {
    return jsonResponse({ error: "Name and email are required." }, 400);
  }
  if (!body.desiredSize?.trim() || !body.finish?.trim()) {
    return jsonResponse({ error: "Desired size and finish are required." }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await admin
    .from("product_quote_requests")
    .insert({
      product_id: product.id,
      product_title: product.title,
      product_url: product.url,
      product_image: product.image ?? null,
      variant_name: product.variantName ?? null,
      customer_name: customer.name.trim(),
      customer_email: customer.email.trim(),
      customer_phone: customer.phone?.trim() || null,
      desired_size: body.desiredSize.trim(),
      finish: body.finish.trim(),
      customization: body.customization,
      zip_code: body.zipCode?.trim() || null,
      message: body.message?.trim() || null,
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("create-product-quote-request insert failed:", error.message);
    return jsonResponse({ error: "Could not save the request." }, 500);
  }

  const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
  if (adminEmail) {
    const submittedAt = new Date(data.created_at).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const html = `
      <h2>NEW QUOTE REQUEST</h2>
      <p><strong>Customer:</strong> ${escapeHtml(customer.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(customer.email)}</p>
      ${customer.phone ? `<p><strong>Phone:</strong> ${escapeHtml(customer.phone)}</p>` : ""}
      <hr />
      <p><strong>Product:</strong> ${escapeHtml(product.title)}${product.variantName ? ` (${escapeHtml(product.variantName)})` : ""}</p>
      <p><strong>Product URL:</strong> <a href="${escapeHtml(product.url)}">${escapeHtml(product.url)}</a></p>
      <hr />
      <p><strong>Requested size:</strong> ${escapeHtml(body.desiredSize)}</p>
      <p><strong>Finish:</strong> ${escapeHtml(body.finish)}</p>
      <p><strong>Customization:</strong> ${body.customization ? "Yes" : "No"}</p>
      ${body.zipCode ? `<p><strong>ZIP Code:</strong> ${escapeHtml(body.zipCode)}</p>` : ""}
      ${body.message ? `<p><strong>Message:</strong><br/>${escapeHtml(body.message)}</p>` : ""}
      <hr />
      <p><strong>Submitted:</strong> ${submittedAt}</p>
      <p>Request ID: ${data.id}</p>
    `;
    // Best-effort — the request is already saved even if the email fails.
    await sendEmail(adminEmail, `New quote request: ${product.title}`, html);
  } else {
    console.warn("ADMIN_NOTIFICATION_EMAIL is not set — request saved but no email sent.");
  }

  return jsonResponse({ requestId: data.id });
});
