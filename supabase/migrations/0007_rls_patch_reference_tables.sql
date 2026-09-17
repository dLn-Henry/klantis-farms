-- ============================================================================
-- 0007_rls_patch_reference_tables.sql
--
-- Run this ONLY if you already ran migrations 0001-0006 before this fix.
-- If you're setting up fresh, this is already included in 0001, 0002 and
-- 0004 — running it again is harmless (the policies will just already
-- exist and this will error on the duplicate, which is fine to ignore).
--
-- Fixes: roles, species, breeds, crop_types, and product_categories had no
-- Row-Level Security at all. Under Supabase's default grants, that meant
-- anyone holding the public anon key could insert, update, or delete rows
-- in these tables directly via the REST API.
-- ============================================================================

alter table roles enable row level security;
create policy "Anyone can view roles" on roles for select using (true);

alter table species enable row level security;
create policy "Anyone can view species" on species for select using (true);

alter table breeds enable row level security;
create policy "Anyone can view breeds" on breeds for select using (true);

alter table crop_types enable row level security;
create policy "Anyone can view crop types" on crop_types for select using (true);

alter table product_categories enable row level security;
create policy "Anyone can view product categories" on product_categories for select using (true);
