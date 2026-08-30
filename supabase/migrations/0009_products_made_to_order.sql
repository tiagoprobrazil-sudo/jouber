-- Lets the admin mark a product as made-to-order (doesn't ship from
-- existing stock) and give it a custom production lead time, shown to
-- customers on the product page instead of the default stock-based
-- availability line.
alter table products add column made_to_order boolean not null default false;
alter table products add column lead_time text;
