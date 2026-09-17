-- ============================================================================
-- 0005_business_ops.sql
-- Suppliers, equipment, maintenance, expenses, income.
-- ============================================================================

create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  code text not null,
  name text not null,
  contact_person text,
  phone text,
  email text,
  category text,
  payment_terms text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now(),
  unique (farm_id, code)
);

create table supplier_purchases (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  farm_id uuid not null references farms(id) on delete cascade,
  purchase_date date not null,
  item text not null,
  amount numeric not null,
  created_at timestamptz not null default now()
);

create table equipment (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  code text not null,
  name text not null,
  category text,
  manufacturer text,
  model text,
  purchase_date date,
  condition text check (condition in ('Good', 'Fair', 'Needs Repair')),
  location text,
  status text not null default 'Operational' check (status in ('Operational', 'Maintenance Due', 'Under Repair')),
  created_at timestamptz not null default now(),
  unique (farm_id, code)
);

create table maintenance_records (
  id uuid primary key default uuid_generate_v4(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  farm_id uuid not null references farms(id) on delete cascade,
  maintenance_date date not null,
  maintenance_type text not null,
  cost numeric default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  category text not null,
  amount numeric not null,
  expense_date date not null,
  supplier_id uuid references suppliers(id),
  description text,
  payment_method text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table income_records (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  category text not null,
  amount numeric not null,
  income_date date not null,
  source text,
  description text,
  created_at timestamptz not null default now()
);

alter table suppliers enable row level security;
alter table supplier_purchases enable row level security;
alter table equipment enable row level security;
alter table maintenance_records enable row level security;
alter table expenses enable row level security;
alter table income_records enable row level security;

create policy "Farm members can view suppliers" on suppliers for select using (is_farm_member(farm_id));
create policy "Farm members can manage suppliers" on suppliers for all using (is_farm_member(farm_id));

create policy "Farm members can view supplier purchases" on supplier_purchases for select using (is_farm_member(farm_id));

create policy "Farm members can view equipment" on equipment for select using (is_farm_member(farm_id));
create policy "Farm members can manage equipment" on equipment for all using (is_farm_member(farm_id));

create policy "Farm members can view maintenance records" on maintenance_records for select using (is_farm_member(farm_id));
create policy "Farm members can manage maintenance records" on maintenance_records for all using (is_farm_member(farm_id));

create policy "Farm members can view expenses" on expenses for select using (is_farm_member(farm_id));
create policy "Farm members can manage expenses" on expenses for all using (is_farm_member(farm_id));

create policy "Farm members can view income" on income_records for select using (is_farm_member(farm_id));
create policy "Farm members can manage income" on income_records for all using (is_farm_member(farm_id));
