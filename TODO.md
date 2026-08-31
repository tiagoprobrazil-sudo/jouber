# To do

Business/ops tasks for Atelier Saint Sebastian, plus smaller code follow-ups
that don't warrant their own tracking doc (see `DESIGN_REFINEMENT_TASKS.md`
for the design refinement backlog and `ADMIN_DASHBOARD_TASKS.md` for the
admin dashboard buildout).

- [ ] Create and manage the store on Instagram Shop.

## Printify — next steps

See [[jouber-printify-integration]] memory for the full architecture. In
rough priority order:

- [ ] **Real shipping cost per Printify item** — call Printify's
  `/orders/shipping.json` to quote actual fulfillment shipping cost instead
  of folding Printify-fulfilled items into the Shippo-only calculation.
  Do this before any Printify product goes live for real sales.
- [ ] Manual "Resend to Printify" action on an order in the admin, for when
  the automatic submission fails (currently silent/best-effort).
- [ ] Order cancellation support (Printify allows cancelling before
  production starts).
- [ ] Auto-resync a Jouber product when its Printify counterpart changes —
  register a `product:updated` webhook instead of relying on the admin
  clicking "Re-sync" in `/admin/printify`.
- [ ] Create Printify products from inside the Jouber admin (blueprint +
  print provider + art upload) instead of only importing ones already set
  up on printify.com.
- [ ] Admin view listing all orders in the connected Printify shop (not
  just ones Jouber itself created), for reconciliation.
