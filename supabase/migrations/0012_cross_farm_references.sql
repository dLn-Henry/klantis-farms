-- ============================================================================
-- 0012_cross_farm_references.sql
--
-- Row-level security only asks "is the caller a member of the farm named on
-- THIS row". It says nothing about the rows that row points at. A foreign
-- key only proves the target exists, not that it belongs to the same farm.
-- Verified against a live database: a Farm A worker inserted an inventory
-- ledger entry naming Farm B's inventory item, and the ledger trigger
-- (security definer) dutifully cut Farm B's stock from 100 to 10.
--
-- Found by asking the catalog for every foreign key between two
-- farm-scoped tables (ten of them). This adds one generic same-farm guard
-- and attaches it to all of them, and to UPDATE as well as INSERT so a
-- valid reference can't be swapped for a foreign one afterwards.
--
-- Skipped when auth.uid() is null (service_role, migrations, seeds).
-- ============================================================================

create or replace function guard_same_farm_reference()
returns trigger as $$
declare
  i int := 0;
  col text;
  parent text;
  ref uuid;
  parent_farm uuid;
begin
  if auth.uid() is null then
    return new;
  end if;

  -- TG_ARGV is pairs of: referencing column, referenced table.
  while i < TG_NARGS loop
    col := TG_ARGV[i];
    parent := TG_ARGV[i + 1];
    ref := (to_jsonb(new) ->> col)::uuid;

    if ref is not null then
      execute format('select farm_id from public.%I where id = $1', parent)
        into parent_farm using ref;
      if parent_farm is distinct from new.farm_id then
        raise exception 'The selected % does not belong to this farm.', replace(col, '_id', '');
      end if;
    end if;

    i := i + 2;
  end loop;

  return new;
end;
$$ language plpgsql security definer;

create trigger guard_ref_animal_events    before insert or update on animal_events
  for each row execute function guard_same_farm_reference('animal_id', 'animals');
create trigger guard_ref_crop_cycles      before insert or update on crop_cycles
  for each row execute function guard_same_farm_reference('field_id', 'fields');
create trigger guard_ref_crop_activities  before insert or update on crop_activities
  for each row execute function guard_same_farm_reference('crop_cycle_id', 'crop_cycles');
create trigger guard_ref_inv_transactions before insert or update on inventory_transactions
  for each row execute function guard_same_farm_reference('inventory_item_id', 'inventory_items');
create trigger guard_ref_products         before insert or update on products
  for each row execute function guard_same_farm_reference('inventory_item_id', 'inventory_items');
create trigger guard_ref_orders           before insert or update on orders
  for each row execute function guard_same_farm_reference('customer_id', 'customers');
create trigger guard_ref_supplier_purch   before insert or update on supplier_purchases
  for each row execute function guard_same_farm_reference('supplier_id', 'suppliers');
create trigger guard_ref_maintenance      before insert or update on maintenance_records
  for each row execute function guard_same_farm_reference('equipment_id', 'equipment');
create trigger guard_ref_expenses         before insert or update on expenses
  for each row execute function guard_same_farm_reference('supplier_id', 'suppliers');
-- 0011 checked these on INSERT only.
create trigger guard_ref_vet_reports      before update on veterinary_reports
  for each row execute function guard_same_farm_reference('animal_id', 'animals');
create trigger guard_ref_harvests         before update on harvests
  for each row execute function guard_same_farm_reference('crop_cycle_id', 'crop_cycles');

-- ----------------------------------------------------------------------------
-- Inventory ledger: attribution and stock that can't go below zero.
-- The spec is explicit that stock should not normally go negative, and
-- nothing enforced it.
-- ----------------------------------------------------------------------------
create or replace function guard_inventory_transaction()
returns trigger as $$
declare
  current_qty numeric;
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.created_by is distinct from auth.uid() then
    raise exception 'A stock movement can only be recorded as yourself.';
  end if;

  -- Lock the row so two simultaneous withdrawals can't both pass this check.
  select quantity into current_qty
  from inventory_items where id = new.inventory_item_id for update;

  if current_qty + new.quantity_change < 0 then
    raise exception 'Not enough stock: only % available.', current_qty;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger guard_inventory_transaction_trigger
  before insert on inventory_transactions
  for each row execute function guard_inventory_transaction();

-- Backstop at the table itself. NOT VALID enforces it for every new or
-- changed row without failing the migration over any historical rows.
alter table inventory_items
  add constraint inventory_items_quantity_non_negative check (quantity >= 0) not valid;

-- ----------------------------------------------------------------------------
-- Pin search_path on every security definer function. They run with the
-- owner's privileges, so an attacker who can create objects earlier in the
-- search path could otherwise get their own function or table resolved in
-- place of the intended one.
-- ----------------------------------------------------------------------------
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
  loop
    execute format('alter function %s set search_path = public, pg_temp', fn.sig);
  end loop;
end
$$;
