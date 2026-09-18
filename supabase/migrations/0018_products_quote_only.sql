-- Lets the admin mark a product as "quote only": the product page hides
-- the normal price/variant/Add to Cart purchase flow and shows a
-- "Request a Quote" form instead (see product_quote_requests below).
-- Same pattern as made_to_order (0009_products_made_to_order.sql).
alter table products add column quote_only boolean not null default false;
