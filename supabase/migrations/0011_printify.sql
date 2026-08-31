-- Printify integration: links Jouber products/variants to their Printify
-- counterparts (for automatic order fulfillment), and tracks the
-- Printify order + shipment info back on the Jouber order once fulfilled.

alter table products add column printify_product_id text;
-- Used only when the product has no product_variants rows (a single-variant
-- item) — the Printify variant id to order for it.
alter table products add column printify_variant_id bigint;

alter table product_variants add column printify_variant_id bigint;

alter table orders add column printify_order_id text unique;
alter table orders add column tracking_number text;
alter table orders add column tracking_url text;
alter table orders add column carrier text;
