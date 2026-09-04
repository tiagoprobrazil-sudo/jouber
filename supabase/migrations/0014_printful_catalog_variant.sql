-- Printful's shipping-rate endpoint (POST /shipping/rates) needs the
-- underlying *catalog* variant id (the blank product/size/color — same
-- across every seller), not the store's sync variant id used for order
-- line items (POST /orders wants sync_variant_id instead). Confirmed by
-- direct testing against the real API on 2026-09-04: sending
-- sync_variant_id to /shipping/rates fails validation; the catalog
-- variant_id (the sync variant's own `variant_id` field) is what it wants.
--
-- So each variant now needs both ids stored: printful_variant_id (sync,
-- for orders) and printful_catalog_variant_id (for shipping quotes).

alter table products add column printful_catalog_variant_id bigint;
alter table product_variants add column printful_catalog_variant_id bigint;
