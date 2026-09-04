# To do

Business/ops tasks for Atelier Saint Sebastian, plus smaller code follow-ups
that don't warrant their own tracking doc (see `DESIGN_REFINEMENT_TASKS.md`
for the design refinement backlog and `ADMIN_DASHBOARD_TASKS.md` for the
admin dashboard buildout).

- [ ] Create and manage the store on Instagram Shop.

## Printful — next steps

See [[jouber-printful-integration]] memory for the full architecture.
Switched from Printify to Printful on 2026-09-04 (Printify's shop was
never actually populated, so nothing was lost) — same feature set
(fulfillment, catalog import, tracking, resend, cancel, orders
reconciliation), rebuilt against Printful's API. Unlike the original
Printify build, **none of this has been verified against a real account
yet** — it was written from Printful's official docs but there's no
token to test with so far. First real task once the user provides a
Printful Private Token:

- [ ] Set `PRINTFUL_API_TOKEN` (and `PRINTFUL_STORE_ID` only if it's an
  account-level token spanning multiple stores) and smoke-test every
  function against the real API — `printful-catalog` (GET/POST),
  `printful-shipping`, `printful-orders`, and a real end-to-end order to
  confirm `finalizeOrder`'s `submitToPrintful` actually creates +
  confirms an order. Pay special attention to the exact response shapes
  assumed for `/shipping-rates` and the `/orders` list (written from
  docs, not confirmed live) — fix field names if the real API disagrees.
- [ ] Register the Printful webhook (package_shipped / order_updated /
  order_failed / order_canceled / product updated) pointing at
  `printful-webhook`, deployed with `--no-verify-jwt`. Confirm the
  event payload's resource-id field actually lives where
  `printful-webhook/index.ts` expects it (`data.order.id` /
  `data.sync_product.id`) — adjust if Printful's real payload differs.
  Whether Printful signs its payloads hasn't been checked yet either way
  — doesn't matter functionally since the handler never trusts payload
  contents, only re-fetches from the API, but worth confirming for
  completeness.
- [ ] Cross-check `printful-cancel-order`'s `DELETE /orders/{id}` call —
  inferred from Printful's docs pattern, not yet confirmed against a
  real pending order.
- [ ] Create Printful products from inside the Jouber admin instead of
  only importing ones already set up on printful.com. Deferred for the
  same reason the Printify version of this was: importing already-set-up
  products works fine; a full product-creation wizard is a large lift
  for something that may not be used often.
