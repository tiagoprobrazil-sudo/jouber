-- Switches print-on-demand fulfillment from Printify to Printful. The
-- Printify catalog was never actually imported (shop had zero products),
-- so there is no linked data to migrate — these columns are dropped and
-- re-added under Printful's naming/types instead of renamed in place.
-- Printful ids are numeric (unlike Printify's alphanumeric ids), so the
-- product-id column also changes type from text to bigint.

alter table products drop column if exists printify_product_id;
alter table products add column printful_product_id bigint;
-- Used only when the product has no product_variants rows (a single-variant
-- item) — the Printful sync variant id to order for it.
alter table products drop column if exists printify_variant_id;
alter table products add column printful_variant_id bigint;

alter table product_variants drop column if exists printify_variant_id;
alter table product_variants add column printful_variant_id bigint;

alter table orders drop column if exists printify_order_id;
alter table orders add column printful_order_id bigint unique;
-- tracking_number / tracking_url / carrier are already provider-agnostic —
-- left as-is.
