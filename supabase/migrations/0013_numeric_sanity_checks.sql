-- ============================================================================
-- 0013_numeric_sanity_checks.sql
--
-- The spec says outright that the backend must reject nonsense like
-- quantity = -500 even if the frontend never sends it. Sixteen numeric
-- columns had no constraint at all, so a direct API call could record a
-- negative harvest, a negative order quantity, a negative price, a product
-- rating of 500, and so on.
--
-- NOT VALID: enforced for every new or changed row, without failing the
-- migration over any historical rows that predate the rule.
-- ============================================================================

alter table animals                add constraint animals_weight_non_negative       check (current_weight is null or current_weight >= 0) not valid;
alter table expenses               add constraint expenses_amount_positive          check (amount > 0) not valid;
alter table income_records         add constraint income_amount_positive            check (amount > 0) not valid;
alter table supplier_purchases     add constraint supplier_purchases_amount_positive check (amount > 0) not valid;
alter table maintenance_records    add constraint maintenance_cost_non_negative     check (cost is null or cost >= 0) not valid;
alter table fields                 add constraint fields_area_non_negative          check (area is null or area >= 0) not valid;
alter table harvests               add constraint harvests_quantity_positive        check (quantity > 0) not valid;
alter table inventory_items        add constraint inventory_reorder_non_negative    check (reorder_level is null or reorder_level >= 0) not valid;
alter table inventory_transactions add constraint inventory_change_non_zero         check (quantity_change <> 0) not valid;
alter table order_items            add constraint order_items_quantity_positive     check (quantity > 0) not valid;
alter table order_items            add constraint order_items_price_non_negative    check (unit_price >= 0) not valid;
alter table orders                 add constraint orders_delivery_fee_non_negative  check (delivery_fee is null or delivery_fee >= 0) not valid;
alter table products               add constraint products_price_non_negative       check (price >= 0) not valid;
alter table products               add constraint products_rating_range             check (rating is null or (rating >= 0 and rating <= 5)) not valid;
alter table products               add constraint products_review_count_non_negative check (review_count is null or review_count >= 0) not valid;
alter table farms                  add constraint farms_coordinates_valid           check ((latitude is null or latitude between -90 and 90) and (longitude is null or longitude between -180 and 180)) not valid;
