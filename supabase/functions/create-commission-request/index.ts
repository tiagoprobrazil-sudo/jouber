// Supabase Edge Function: create-commission-request
//
// Called from the public "Commission a Piece" page (src/pages/Commission.tsx)
// when a visitor clicks "Encomendar" on a catalog item sourced from a
// partner site (currently Exú Caveira's public-products.php feed — see
// src/lib/commissions). Persists the request for the admin (commission_requests
// table, visible at /admin/commissions) and emails a notification via Resend.
//
// This does NOT sell or deliver the STL file itself — that purchase still
// happens on the source site. The response just echoes back the product's
// `link_produto` so the UI can point the customer there.
//
// Deploy with: supabase functions deploy create-commission-request --no-verify-jwt
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
// ADMIN_NOTIFICATION_EMAIL (email that should receive new-request alerts).

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
    nome: string;
    categoria?: string;
    preco?: number;
    imagem?: string;
    link_produto: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  message?: string;
  quotedServicePrice?: number;
  quotedTotalPrice?: number;
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

  if (!product?.id || !product?.nome || !product?.link_produto) {
    return jsonResponse({ error: "Missing product information." }, 400);
  }
  if (!customer?.name?.trim() || !customer?.email?.trim()) {
    return jsonResponse({ error: "Name and email are required." }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await admin
    .from("commission_requests")
    .insert({
      source: "exucaveira",
      source_product_id: product.id,
      source_product_name: product.nome,
      source_product_category: product.categoria ?? null,
      source_product_price: product.preco ?? null,
      source_product_image: product.imagem ?? null,
      source_product_link: product.link_produto,
      customer_name: customer.name.trim(),
      customer_email: customer.email.trim(),
      customer_phone: customer.phone?.trim() || null,
      message: body.message?.trim() || null,
      quoted_service_price: body.quotedServicePrice ?? null,
      quoted_total_price: body.quotedTotalPrice ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("create-commission-request insert failed:", error.message);
    return jsonResponse({ error: "Could not save the request." }, 500);
  }

  const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
  if (adminEmail) {
    const html = `
      <h2>New commission request</h2>
      <p><strong>${escapeHtml(product.nome)}</strong> (${escapeHtml(product.categoria ?? "Uncategorized")})</p>
      ${
        body.quotedTotalPrice
          ? `<p>Quoted to customer: R$ ${body.quotedTotalPrice.toFixed(2)} (labor R$ ${(body.quotedServicePrice ?? 0).toFixed(2)} + file R$ ${(product.preco ?? 0).toFixed(2)})</p>`
          : ""
      }
      ${product.preco ? `<p>File reference price on source site: R$ ${Number(product.preco).toFixed(2)}</p>` : ""}
      <p><a href="${escapeHtml(product.link_produto)}">View / buy the STL on the source site</a></p>
      <hr />
      <p><strong>Customer:</strong> ${escapeHtml(customer.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(customer.email)}</p>
      ${customer.phone ? `<p><strong>Phone:</strong> ${escapeHtml(customer.phone)}</p>` : ""}
      ${body.message ? `<p><strong>Message:</strong><br/>${escapeHtml(body.message)}</p>` : ""}
      <hr />
      <p>Request ID: ${data.id}</p>
    `;
    // Best-effort — the request is already saved even if the email fails.
    await sendEmail(adminEmail, `New commission request: ${product.nome}`, html);
  } else {
    console.warn("ADMIN_NOTIFICATION_EMAIL is not set — request saved but no email sent.");
  }

  return jsonResponse({ requestId: data.id, buyLink: product.link_produto });
});
