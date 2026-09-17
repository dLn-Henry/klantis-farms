-- ============================================================================
-- 0001_core.sql
-- Identity, organizations, farms, and farm membership — the foundation
-- everything else in the schema hangs off of. Per Doc 3/12: every
-- farm-owned record must be traceable to a farm, and the platform is
-- multi-tenant by design even with a single farm today.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- PROFILES
-- Extends auth.users (Supabase-managed) with app-specific fields.
-- A row is created here automatically via trigger when a user signs up.
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ----------------------------------------------------------------------------
-- ORGANIZATIONS & FARMS
-- ----------------------------------------------------------------------------
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table farms (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  slug text unique not null,
  farm_code text unique not null,
  farm_type text,
  location_name text,
  address text,
  latitude numeric,
  longitude numeric,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ROLES & FARM MEMBERSHIP
-- A user's access to a given farm's data is entirely determined by having a
-- row here. RLS policies throughout the schema check against this table.
-- ----------------------------------------------------------------------------
create table roles (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  description text
);

insert into roles (name, description) values
  ('Farm Owner', 'Full access to all modules on their farm'),
  ('Farm Manager', 'Manages daily operations across all modules'),
  ('Veterinarian', 'Submits veterinary reports, views assigned animal health history'),
  ('Inventory Officer', 'Views and adjusts inventory, records stock movements'),
  ('Sales Manager', 'Manages products, orders and customers'),
  ('Farm Worker', 'Views and completes assigned tasks');

create table farm_members (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role_id uuid not null references roles(id),
  status text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  joined_at timestamptz not null default now(),
  unique (farm_id, user_id)
);

-- Helper used by RLS policies throughout the schema: does the current user
-- belong to this farm (in any active role)?
create function is_farm_member(target_farm_id uuid)
returns boolean as $$
  select exists (
    select 1 from farm_members
    where farm_id = target_farm_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$ language sql security definer stable;

alter table profiles enable row level security;
alter table organizations enable row level security;
alter table farms enable row level security;
alter table farm_members enable row level security;
alter table roles enable row level security;

create policy "Anyone can view roles" on roles for select using (true);
-- No insert/update/delete policy: roles are reference data, managed by
-- migrations/admin only. The anon/authenticated grants Supabase applies by
-- default would otherwise allow ANYONE to modify or delete these rows.

create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Members can view their organization" on organizations
  for select using (
    exists (select 1 from farms f where f.organization_id = organizations.id and is_farm_member(f.id))
  );

create policy "Members can view their farm" on farms
  for select using (is_farm_member(id));

create policy "Members can view their farm's membership list" on farm_members
  for select using (is_farm_member(farm_id));
