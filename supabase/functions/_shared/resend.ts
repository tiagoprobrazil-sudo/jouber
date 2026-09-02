// Thin Resend (https://resend.com) client — transactional email, used for
// the automatic post-purchase review-request email (send-review-requests).
//
// Required secret: RESEND_API_KEY
//
// FROM_EMAIL defaults to Resend's shared onboarding@resend.dev sender,
// which works without any domain setup but shows "via resend.dev" to the
// recipient. Once ateliersaintsebastian.com is verified in the Resend
// dashboard (DNS records added in Cloudflare, same pattern as every other
// domain-verification step this project has done), set FROM_EMAIL to
// something like "Atelier Saint Sebastian <avaliacoes@ateliersaintsebastian.com>".

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — cannot send email.");
    return false;
  }
  const from = Deno.env.get("FROM_EMAIL") || "Atelier Saint Sebastian <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    console.error("Resend send failed:", await res.text());
    return false;
  }
  return true;
}
