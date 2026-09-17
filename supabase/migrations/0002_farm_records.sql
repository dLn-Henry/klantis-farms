-- ============================================================================
-- 0002_farm_records.sql
-- Livestock, crops, fields, harvests, veterinary reports.
-- Every table here carries farm_id directly for RLS and query simplicity.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- LIVESTOCK
-- ----------------------------------------------------------------------------
create table species (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null
);
insert into species (name) values ('Cattle'), ('Goat'), ('Sheep'), ('Poultry'), ('Fish');

create table breeds (
  id uuid primary key default uuid_generate_v4(),
  species_id uuid not null references species(id),
  name text not null,
  unique (species_id, name)
);

create table animals (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  tag text not null,
  species_id uuid references species(id),
  breed_id uuid references breeds(id),
  sex text check (sex in ('Male', 'Female')),
  date_of_birth date,
  current_weight numeric,
  weight_unit text default 'kg',
  location text,
  status text not null default 'Active' check (status in ('Active', 'Sick', 'Pregnant', 'Quarantined', 'Sold', 'Deceased')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, tag)
);

create table animal_events (
  id uuid primary key default uuid_generate_v4(),
  animal_id uuid not null references animals(id) on delete cascade,
  farm_id uuid not null references farms(id) on delete cascade,
  event_date date not null,
  event_type text not null,
  detail text,
  recorded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CROPS & FIELDS
-- ----------------------------------------------------------------------------
create table crop_types (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null
);
insert into crop_types (name) values ('Mango'), ('Cashew'), ('Yam'), ('Maize'), ('Cassava');

create table fields (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  code text not null,
  name text not null,
  area numeric,
  area_unit text default 'acres',
  soil_type text,
  irrigation_type text,
  status text not null default 'In Use' check (status in ('In Use', 'Fallow', 'Preparing')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, code)
);

create table field_history (
  id uuid primary key default uuid_generate_v4(),
  field_id uuid not null references fields(id) on delete cascade,
  season text not null,
  crop text not null,
  outcome text,
  created_at timestamptz not null default now()
);

create table crop_cycles (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  field_id uuid references fields(id),
  crop_type_id uuid references crop_types(id),
  code text not null,
  variety text,
  season text,
  planting_date text,
  expected_harvest_date date,
  area text,
  status text not null default 'Planned' check (status in ('Planned', 'Planted', 'Growing', 'Harvesting', 'Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, code)
);

create table crop_activities (
  id uuid primary key default uuid_generate_v4(),
  crop_cycle_id uuid not null references crop_cycles(id) on delete cascade,
  farm_id uuid not null references farms(id) on delete cascade,
  activity_date date not null,
  activity_type text not null,
  detail text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- HARVESTS
-- ----------------------------------------------------------------------------
create table harvests (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  crop_cycle_id uuid references crop_cycles(id),
  code text not null,
  harvest_date date not null,
  quantity numeric not null,
  unit text not null,
  quality_grade text,
  destination text,
  recorded_by uuid references profiles(id),
  status text not null default 'Recorded' check (status in ('Recorded', 'Approved', 'Added to Inventory')),
  created_at timestamptz not null default now(),
  unique (farm_id, code)
);

-- ----------------------------------------------------------------------------
-- VETERINARY REPORTS
-- Professional submissions become official records only after review —
-- the report itself, and its status, ARE the audit trail.
-- ----------------------------------------------------------------------------
create table veterinary_reports (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  animal_id uuid not null references animals(id),
  code text not null,
  submitted_by uuid references profiles(id),
  visit_date date not null,
  reason text,
  findings text,
  diagnosis text,
  treatment_plan text,
  status text not null default 'Submitted'
    check (status in ('Submitted', 'Under Review', 'Approved', 'Rejected', 'Changes Requested')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, code)
);

-- ----------------------------------------------------------------------------
-- RLS — every table below follows the same pattern: read/write only if the
-- user is an active member of the farm the record belongs to.
-- ----------------------------------------------------------------------------
alter table animals enable row level security;
alter table species enable row level security;
alter table breeds enable row level security;
alter table crop_types enable row level security;

create policy "Anyone can view species" on species for select using (true);
create policy "Anyone can view breeds" on breeds for select using (true);
create policy "Anyone can view crop types" on crop_types for select using (true);
-- Same reasoning as roles in 0001_core.sql: reference data, read-only via
-- the API, no insert/update/delete policy so the default anon/authenticated
-- grants can't be used to tamper with it.

alter table animal_events enable row level security;
alter table fields enable row level security;
alter table field_history enable row level security;
alter table crop_cycles enable row level security;
alter table crop_activities enable row level security;
alter table harvests enable row level security;
alter table veterinary_reports enable row level security;

create policy "Farm members can view animals" on animals for select using (is_farm_member(farm_id));
create policy "Farm members can manage animals" on animals for all using (is_farm_member(farm_id));

create policy "Farm members can view animal events" on animal_events for select using (is_farm_member(farm_id));
create policy "Farm members can manage animal events" on animal_events for all using (is_farm_member(farm_id));

create policy "Farm members can view fields" on fields for select using (is_farm_member(farm_id));
create policy "Farm members can manage fields" on fields for all using (is_farm_member(farm_id));

create policy "Farm members can view field history" on field_history for select using (
  exists (select 1 from fields f where f.id = field_history.field_id and is_farm_member(f.farm_id))
);

create policy "Farm members can view crop cycles" on crop_cycles for select using (is_farm_member(farm_id));
create policy "Farm members can manage crop cycles" on crop_cycles for all using (is_farm_member(farm_id));

create policy "Farm members can view crop activities" on crop_activities for select using (is_farm_member(farm_id));
create policy "Farm members can manage crop activities" on crop_activities for all using (is_farm_member(farm_id));

create policy "Farm members can view harvests" on harvests for select using (is_farm_member(farm_id));
create policy "Farm members can manage harvests" on harvests for all using (is_farm_member(farm_id));

create policy "Farm members can view vet reports" on veterinary_reports for select using (is_farm_member(farm_id));
create policy "Farm members can manage vet reports" on veterinary_reports for all using (is_farm_member(farm_id));
