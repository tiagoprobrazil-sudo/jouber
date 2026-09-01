# To do

Business/ops tasks for Atelier Saint Sebastian, plus smaller code follow-ups
that don't warrant their own tracking doc (see `DESIGN_REFINEMENT_TASKS.md`
for the design refinement backlog and `ADMIN_DASHBOARD_TASKS.md` for the
admin dashboard buildout).

- [ ] Create and manage the store on Instagram Shop.

## Printify — next steps

See [[jouber-printify-integration]] memory for the full architecture. In
rough priority order:

- [x] **Real shipping cost per Printify item** — done 2026-09-01. Checkout
  now splits cart lines into atelier (Shippo) vs Printify-fulfilled, quotes
  each separately (`printify-shipping` function calling
  `/orders/shipping.json`, "standard" tier), and combines both into the
  total. Verified the function calls Printify's real API correctly (a
  fake product id returns Printify's own "Not found" error) — full
  success-path testing needs a real imported product, still pending since
  the shop has none yet.
- [x] Manual "Resend to Printify" action — done 2026-09-01. New
  `printify-resend` function (admin-only — verified it rejects a call
  carrying just the anon key with 401) + a button per order row in
  `/admin/orders` that only shows once an order lacks a
  `printify_order_id`.
- [x] Order cancellation support — done 2026-09-01. New
  `printify-cancel-order` function (same admin-only check as resend —
  verified it rejects a call carrying just the anon key with 401) + a
  "Cancel" button in `/admin/orders`, shown only while an order is
  sent to Printify but not yet cancelled/refunded. Printify only allows
  this before production starts; a later-stage order surfaces
  Printify's own rejection to the admin instead of failing silently.
- [ ] Auto-resync a Jouber product when its Printify counterpart changes —
  register a `product:updated` webhook instead of relying on the admin
  clicking "Re-sync" in `/admin/printify`.
- [ ] Create Printify products from inside the Jouber admin (blueprint +
  print provider + art upload) instead of only importing ones already set
  up on printify.com.
- [ ] Admin view listing all orders in the connected Printify shop (not
  just ones Jouber itself created), for reconciliation.
