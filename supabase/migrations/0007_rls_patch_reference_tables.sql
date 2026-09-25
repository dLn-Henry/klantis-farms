-- ============================================================================
-- 0007_rls_patch_reference_tables.sql
--
-- Idempotent by design: every statement can be re-run safely regardless of
-- whether 0001/0002/0004 already created these exact policies, and
-- regardless of the order or tooling (manual SQL editor, `supabase db
-- push`, CI) used to apply migrations. Drop-then-create avoids the
-- "policy already exists" error that previously made this file fail
-- outright on a fresh database.
--
-- Fixes: roles, species, breeds, crop_types, and product_categories had no
-- Row-Level Security at all. Under Supabase's default grants, that meant
-- anyone holding the public anon key could insert, update, or delete rows
-- in these tables directly via the REST API.
-- ============================================================================

alter table roles enable row level security;
drop policy if exists "Anyone can view roles" on roles;
create policy "Anyone can view roles" on roles for select using (true);

alter table species enable row level security;
drop policy if exists "Anyone can view species" on species;
create policy "Anyone can view species" on species for select using (true);

alter table breeds enable row level security;
drop policy if exists "Anyone can view breeds" on breeds;
create policy "Anyone can view breeds" on breeds for select using (true);

alter table crop_types enable row level security;
drop policy if exists "Anyone can view crop types" on crop_types;
create policy "Anyone can view crop types" on crop_types for select using (true);

alter table product_categories enable row level security;
drop policy if exists "Anyone can view product categories" on product_categories;
create policy "Anyone can view product categories" on product_categories for select using (true);
