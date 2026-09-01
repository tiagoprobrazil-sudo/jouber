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
- [x] Auto-resync a Jouber product when its Printify counterpart changes
  — done 2026-09-01. Registered a `product:updated` webhook; extracted
  the import/sync logic into `_shared/printifySync.ts` (used by both the
  explicit `/admin/printify` import button and the webhook). The webhook
  only re-syncs products already imported into Jouber — it never
  auto-creates a new draft product from a background event, that's still
  an explicit admin action. Verified the webhook gracefully no-ops for a
  product id Jouber hasn't imported.
- [ ] Create Printify products from inside the Jouber admin (blueprint +
  print provider + art upload) instead of only importing ones already set
  up on printify.com. **Deliberately deferred** (2026-09-01, user's
  choice when asked) — creating products directly on printify.com and
  importing via `/admin/printify` already works well; this would be a
  large wizard (blueprint/print-provider picker, art upload, print-area
  placement) for something that may not be used often. Revisit only if
  it becomes a real workflow pain point.
- [x] Admin view listing all orders in the connected Printify shop — done
  2026-09-01. New admin-only `printify-orders` function (same auth check
  as resend/cancel) + a reconciliation table at the bottom of
  `/admin/printify` (customer, status, items, total, tracking link).
