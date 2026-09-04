// Supabase Edge Function: send-review-requests
//
// Runs daily via pg_cron (see 0012_reviews.sql's `net.http_post` job) —
// not meant to be called by anyone else, so it checks a shared secret
// (X-Cron-Secret) instead of a Supabase session, the same idea as
// stripe-webhook/printful-webhook checking a signature/trust boundary
// appropriate to their own caller.
//
// For every order_item that's old enough (orders.created_at + the
// configurable store_settings 'review_request_delay_days', default 7)
// and doesn't already have a review_requests row, creates one with a
// fresh token and emails the customer a link to /review/:token. Orders
// that are cancelled/refunded, or line items with no product_id, are
// skipped. Idempotent by design: re-running never double-sends, since a
// row's mere existence (even if the send itself failed) marks that
// order_item as handled — see the code comment below for why that
// trade-off was made.
//
// Deploy with: supabase functions deploy send-review-requests --no-verify-jwt

import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendEmail } from "../_shared/resend.ts";

const SITE_URL = "https://ateliersaintsebastian.com";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function reviewEmailHtml(productTitle: string, authorName: string, reviewUrl: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1c1b19;">
      <h1 style="font-size: 20px; font-weight: normal;">Atelier Saint Sebastian</h1>
      <p>Hi ${authorName || "there"},</p>
      <p>We hope your <strong>${productTitle}</strong> has settled into its new home. Would you take a moment to share how it turned out? It helps other collectors, and means a lot to the atelier.</p>
      <p style="margin: 28px 0;">
        <a href="${reviewUrl}" style="background: #1c1b19; color: #f7f4ee; padding: 12px 24px; text-decoration: none; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">
          Write a review
        </a>
      </p>
      <p style="color: #6b6357; font-size: 13px;">Thank you for supporting handmade sacred art.</p>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || req.headers.get("X-Cron-Secret") !== cronSecret) {
    return jsonResponse({ error: "Not authorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: "Not configured" }, 501);
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: setting } = await admin.from("store_settings").select("value").eq("key", "review_request_delay_days").maybeSingle();
  const delayDays = typeof setting?.value === "number" ? setting.value : 7;
  const cutoff = new Date(Date.now() - delayDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: items, error } = await admin
    .from("order_items")
    .select("id, product_id, product_title, orders(customer_email, shipping_address, status, created_at)")
    .not("product_id", "is", null)
    .lte("orders.created_at", cutoff);
  if (error) return jsonResponse({ error: "Could not load order items", detail: error.message }, 500);

  const { data: existingRequests } = await admin.from("review_requests").select("order_item_id");
  const alreadyHandled = new Set((existingRequests ?? []).map((r) => r.order_item_id));

  let sent = 0;
  let failed = 0;

  for (const item of items ?? []) {
    if (alreadyHandled.has(item.id)) continue;
    const order = item.orders as unknown as { customer_email: string; shipping_address: Record<string, unknown> | null; status: string; created_at: string } | null;
    if (!order || order.status === "cancelled" || order.status === "refunded") continue;
    if (new Date(order.created_at) > new Date(cutoff)) continue; // embedded .lte above isn't always honored by PostgREST for nested resources — double-check here

    const token = crypto.randomUUID();
    const authorName = (order.shipping_address?.name as string | undefined) ?? "";

    // Create the row before sending: even if the email send itself fails
    // below, this order_item is now considered "handled" and won't be
    // retried tomorrow. Deliberate trade-off for a first version — a rare
    // transient send failure just means one customer doesn't get asked,
    // rather than risking a retry loop that double-emails on a partial
    // failure elsewhere in this function.
    const { error: insertError } = await admin.from("review_requests").insert({
      order_item_id: item.id,
      product_id: item.product_id,
      email: order.customer_email,
      author_name: authorName || null,
      token,
    });
    if (insertError) {
      failed += 1;
      continue;
    }

    const reviewUrl = `${SITE_URL}/review/${token}`;
    const ok = await sendEmail(order.customer_email, `How's your ${item.product_title}?`, reviewEmailHtml(item.product_title, authorName, reviewUrl));
    if (ok) {
      sent += 1;
      await admin.from("review_requests").update({ sent_at: new Date().toISOString() }).eq("order_item_id", item.id);
    } else {
      failed += 1;
    }
  }

  return jsonResponse({ sent, failed, checked: items?.length ?? 0 });
});
