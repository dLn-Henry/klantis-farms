-- ============================================================================
-- 0003_inventory.sql
-- Inventory is transaction-based: inventory_items.quantity is a CACHED
-- value kept in sync by a trigger on inventory_transactions, not the
-- source of truth. The transaction ledger is the source of truth.
-- ============================================================================

create table inventory_items (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  sku text not null,
  name text not null,
  category text not null check (category in ('Produce', 'Input', 'Packaging', 'Equipment')),
  quantity numeric not null default 0,
  unit text not null,
  reorder_level numeric not null default 0,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, sku)
);

create table inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  inventory_item_id uuid not null references inventory_items(id) on delete cascade,
  transaction_date date not null default current_date,
  transaction_type text not null
    check (transaction_type in ('Purchase', 'Harvest', 'Consumption', 'Sale', 'Adjustment')),
  quantity_change numeric not null, -- signed: positive = stock in, negative = stock out
  reference text, -- e.g. harvest code, order number, supplier name
  reference_type text, -- 'harvest' | 'order' | 'purchase' | 'manual'
  reference_id uuid, -- polymorphic FK, resolved in application code by reference_type
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- Keep inventory_items.quantity in sync with the transaction ledger.
-- The ledger remains authoritative; this is a performance cache only.
create function apply_inventory_transaction()
returns trigger as $$
begin
  update inventory_items
    set quantity = quantity + new.quantity_change,
        updated_at = now()
    where id = new.inventory_item_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_inventory_transaction_insert
  after insert on inventory_transactions
  for each row execute procedure apply_inventory_transaction();

alter table inventory_items enable row level security;
alter table inventory_transactions enable row level security;

create policy "Farm members can view inventory" on inventory_items for select using (is_farm_member(farm_id));
create policy "Farm members can manage inventory" on inventory_items for all using (is_farm_member(farm_id));

create policy "Farm members can view inventory transactions" on inventory_transactions for select using (is_farm_member(farm_id));
create policy "Farm members can create inventory transactions" on inventory_transactions for insert with check (is_farm_member(farm_id));
