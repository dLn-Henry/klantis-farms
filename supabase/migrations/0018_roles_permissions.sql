-- ============================================================================
-- 0018: Permission-based roles, multiple roles per person (Phase 1B)
--
-- BEFORE this migration the database only enforced roles for approvals; every
-- other table let ANY farm member read and write everything on their farm
-- (a Farm Worker could edit finance records). Now:
--
--   permissions        catalogue of module.action keys   (finance.view ...)
--   role_permissions   which role grants which keys      (plain data)
--   farm_member_roles  a person can hold SEVERAL roles on a farm
--   has_permission()   union of the permissions of all the caller's roles
--
-- Every table policy and guard trigger is rewritten onto has_permission().
-- Only a Farm Owner can assign roles (permission team.assign_roles, held by no
-- other role). A farm always keeps one active Farm Owner. Role changes are
-- audited. Platform Super Administrator is a separate table, sees no farm
-- operational data, and can only be granted from the SQL editor / service role.
--
-- Run after 0017. Existing members keep their current role (backfilled).
-- ============================================================================

-- 1. New roles ---------------------------------------------------------------
insert into roles (name, description) values
  ('Accountant', 'Finance Officer. Records and reviews financial transactions; sees financial reports.'),
  ('Agronomist', 'Crop Officer. Manages crop cycles, field records and crop activities.'),
  ('Equipment Officer', 'Equipment / Maintenance Officer. Manages equipment and maintenance records.'),
  ('Procurement Officer', 'Manages suppliers and purchasing.'),
  ('Auditor', 'Read-only access to every module, the audit log and all reports. Cannot change anything.')
on conflict (name) do nothing;

-- 2. Permission catalogue ----------------------------------------------------
create table permissions (
  key text primary key,
  module text not null,
  action text not null,
  description text not null
);
create table role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_key text not null references permissions(key) on delete cascade,
  primary key (role_id, permission_key)
);
create index role_permissions_key_idx on role_permissions (permission_key);
alter table permissions enable row level security;
alter table role_permissions enable row level security;
create policy "Signed-in users can read the permission catalogue" on permissions
  for select to authenticated using (true);
create policy "Signed-in users can read role permissions" on role_permissions
  for select to authenticated using (true);
-- No write policies: the catalogue changes only through migrations.
revoke insert, update, delete on permissions, role_permissions from anon, authenticated;

insert into permissions (key, module, action, description) values
  ('livestock.view', 'livestock', 'view', 'View livestock'),
  ('livestock.create', 'livestock', 'create', 'Create / record livestock'),
  ('livestock.edit', 'livestock', 'edit', 'Edit livestock'),
  ('livestock.delete', 'livestock', 'delete', 'Delete livestock'),
  ('crops.view', 'crops', 'view', 'View crops'),
  ('crops.create', 'crops', 'create', 'Create / record crops'),
  ('crops.edit', 'crops', 'edit', 'Edit crops'),
  ('crops.delete', 'crops', 'delete', 'Delete crops'),
  ('fields.view', 'fields', 'view', 'View fields'),
  ('fields.create', 'fields', 'create', 'Create / record fields'),
  ('fields.edit', 'fields', 'edit', 'Edit fields'),
  ('fields.delete', 'fields', 'delete', 'Delete fields'),
  ('harvests.view', 'harvests', 'view', 'View harvests'),
  ('harvests.create', 'harvests', 'create', 'Create / record harvests'),
  ('harvests.edit', 'harvests', 'edit', 'Edit harvests'),
  ('harvests.delete', 'harvests', 'delete', 'Delete harvests'),
  ('harvests.approve', 'harvests', 'approve', 'Approve harvests'),
  ('veterinary.view', 'veterinary', 'view', 'View veterinary'),
  ('veterinary.create', 'veterinary', 'create', 'Create / record veterinary'),
  ('veterinary.edit', 'veterinary', 'edit', 'Edit veterinary'),
  ('veterinary.delete', 'veterinary', 'delete', 'Delete veterinary'),
  ('veterinary.review', 'veterinary', 'review', 'Approve, reject or request changes on veterinary'),
  ('inventory.view', 'inventory', 'view', 'View inventory'),
  ('inventory.create', 'inventory', 'create', 'Create / record inventory'),
  ('inventory.edit', 'inventory', 'edit', 'Edit inventory'),
  ('inventory.delete', 'inventory', 'delete', 'Delete inventory'),
  ('inventory.adjust', 'inventory', 'adjust', 'Make manual stock adjustments in inventory'),
  ('equipment.view', 'equipment', 'view', 'View equipment'),
  ('equipment.create', 'equipment', 'create', 'Create / record equipment'),
  ('equipment.edit', 'equipment', 'edit', 'Edit equipment'),
  ('equipment.delete', 'equipment', 'delete', 'Delete equipment'),
  ('suppliers.view', 'suppliers', 'view', 'View suppliers'),
  ('suppliers.create', 'suppliers', 'create', 'Create / record suppliers'),
  ('suppliers.edit', 'suppliers', 'edit', 'Edit suppliers'),
  ('suppliers.delete', 'suppliers', 'delete', 'Delete suppliers'),
  ('tasks.view', 'tasks', 'view', 'View tasks'),
  ('tasks.create', 'tasks', 'create', 'Create / record tasks'),
  ('tasks.edit', 'tasks', 'edit', 'Edit tasks'),
  ('tasks.delete', 'tasks', 'delete', 'Delete tasks'),
  ('tasks.complete', 'tasks', 'complete', 'Complete assigned tasks'),
  ('customers.view', 'customers', 'view', 'View customers'),
  ('customers.create', 'customers', 'create', 'Create / record customers'),
  ('customers.edit', 'customers', 'edit', 'Edit customers'),
  ('customers.delete', 'customers', 'delete', 'Delete customers'),
  ('orders.view', 'orders', 'view', 'View orders'),
  ('orders.create', 'orders', 'create', 'Create / record orders'),
  ('orders.edit', 'orders', 'edit', 'Edit orders'),
  ('orders.delete', 'orders', 'delete', 'Delete orders'),
  ('products.view', 'products', 'view', 'View products'),
  ('products.create', 'products', 'create', 'Create / record products'),
  ('products.edit', 'products', 'edit', 'Edit products'),
  ('products.delete', 'products', 'delete', 'Delete products'),
  ('finance.view', 'finance', 'view', 'View finance'),
  ('finance.create', 'finance', 'create', 'Create / record finance'),
  ('finance.edit', 'finance', 'edit', 'Edit finance'),
  ('finance.delete', 'finance', 'delete', 'Delete finance'),
  ('content.view', 'content', 'view', 'View content'),
  ('content.create', 'content', 'create', 'Create / record content'),
  ('content.edit', 'content', 'edit', 'Edit content'),
  ('content.delete', 'content', 'delete', 'Delete content'),
  ('content.publish', 'content', 'publish', 'Publish, schedule and unpublish content'),
  ('media.view', 'media', 'view', 'View media'),
  ('media.create', 'media', 'create', 'Create / record media'),
  ('media.edit', 'media', 'edit', 'Edit media'),
  ('media.delete', 'media', 'delete', 'Delete media'),
  ('settings.view', 'settings', 'view', 'View settings'),
  ('settings.edit', 'settings', 'edit', 'Edit settings'),
  ('team.view', 'team', 'view', 'View team'),
  ('team.view_contact', 'team', 'view_contact', 'See email addresses in team'),
  ('team.assign_roles', 'team', 'assign_roles', 'Add people and assign or remove roles in team'),
  ('audit.view', 'audit', 'view', 'View audit'),
  ('reports.operations', 'reports', 'operations', 'View operational and production reports'),
  ('reports.financial', 'reports', 'financial', 'View financial reports'),
  ('reports.sales', 'reports', 'sales', 'View sales reports');

insert into role_permissions (role_id, permission_key)
select r.id, p.key from (values
  ('Farm Owner', 'livestock.view'),
  ('Farm Owner', 'livestock.create'),
  ('Farm Owner', 'livestock.edit'),
  ('Farm Owner', 'livestock.delete'),
  ('Farm Owner', 'crops.view'),
  ('Farm Owner', 'crops.create'),
  ('Farm Owner', 'crops.edit'),
  ('Farm Owner', 'crops.delete'),
  ('Farm Owner', 'fields.view'),
  ('Farm Owner', 'fields.create'),
  ('Farm Owner', 'fields.edit'),
  ('Farm Owner', 'fields.delete'),
  ('Farm Owner', 'harvests.view'),
  ('Farm Owner', 'harvests.create'),
  ('Farm Owner', 'harvests.edit'),
  ('Farm Owner', 'harvests.delete'),
  ('Farm Owner', 'harvests.approve'),
  ('Farm Owner', 'veterinary.view'),
  ('Farm Owner', 'veterinary.create'),
  ('Farm Owner', 'veterinary.edit'),
  ('Farm Owner', 'veterinary.delete'),
  ('Farm Owner', 'veterinary.review'),
  ('Farm Owner', 'inventory.view'),
  ('Farm Owner', 'inventory.create'),
  ('Farm Owner', 'inventory.edit'),
  ('Farm Owner', 'inventory.delete'),
  ('Farm Owner', 'inventory.adjust'),
  ('Farm Owner', 'equipment.view'),
  ('Farm Owner', 'equipment.create'),
  ('Farm Owner', 'equipment.edit'),
  ('Farm Owner', 'equipment.delete'),
  ('Farm Owner', 'suppliers.view'),
  ('Farm Owner', 'suppliers.create'),
  ('Farm Owner', 'suppliers.edit'),
  ('Farm Owner', 'suppliers.delete'),
  ('Farm Owner', 'tasks.view'),
  ('Farm Owner', 'tasks.create'),
  ('Farm Owner', 'tasks.edit'),
  ('Farm Owner', 'tasks.delete'),
  ('Farm Owner', 'tasks.complete'),
  ('Farm Owner', 'customers.view'),
  ('Farm Owner', 'customers.create'),
  ('Farm Owner', 'customers.edit'),
  ('Farm Owner', 'customers.delete'),
  ('Farm Owner', 'orders.view'),
  ('Farm Owner', 'orders.create'),
  ('Farm Owner', 'orders.edit'),
  ('Farm Owner', 'orders.delete'),
  ('Farm Owner', 'products.view'),
  ('Farm Owner', 'products.create'),
  ('Farm Owner', 'products.edit'),
  ('Farm Owner', 'products.delete'),
  ('Farm Owner', 'finance.view'),
  ('Farm Owner', 'finance.create'),
  ('Farm Owner', 'finance.edit'),
  ('Farm Owner', 'finance.delete'),
  ('Farm Owner', 'content.view'),
  ('Farm Owner', 'content.create'),
  ('Farm Owner', 'content.edit'),
  ('Farm Owner', 'content.delete'),
  ('Farm Owner', 'content.publish'),
  ('Farm Owner', 'media.view'),
  ('Farm Owner', 'media.create'),
  ('Farm Owner', 'media.edit'),
  ('Farm Owner', 'media.delete'),
  ('Farm Owner', 'settings.view'),
  ('Farm Owner', 'settings.edit'),
  ('Farm Owner', 'team.view'),
  ('Farm Owner', 'team.view_contact'),
  ('Farm Owner', 'team.assign_roles'),
  ('Farm Owner', 'audit.view'),
  ('Farm Owner', 'reports.operations'),
  ('Farm Owner', 'reports.financial'),
  ('Farm Owner', 'reports.sales'),
  ('Farm Manager', 'livestock.view'),
  ('Farm Manager', 'livestock.create'),
  ('Farm Manager', 'livestock.edit'),
  ('Farm Manager', 'livestock.delete'),
  ('Farm Manager', 'crops.view'),
  ('Farm Manager', 'crops.create'),
  ('Farm Manager', 'crops.edit'),
  ('Farm Manager', 'crops.delete'),
  ('Farm Manager', 'fields.view'),
  ('Farm Manager', 'fields.create'),
  ('Farm Manager', 'fields.edit'),
  ('Farm Manager', 'fields.delete'),
  ('Farm Manager', 'harvests.view'),
  ('Farm Manager', 'harvests.create'),
  ('Farm Manager', 'harvests.edit'),
  ('Farm Manager', 'harvests.delete'),
  ('Farm Manager', 'harvests.approve'),
  ('Farm Manager', 'veterinary.view'),
  ('Farm Manager', 'veterinary.create'),
  ('Farm Manager', 'veterinary.edit'),
  ('Farm Manager', 'veterinary.delete'),
  ('Farm Manager', 'veterinary.review'),
  ('Farm Manager', 'inventory.view'),
  ('Farm Manager', 'inventory.create'),
  ('Farm Manager', 'inventory.edit'),
  ('Farm Manager', 'inventory.delete'),
  ('Farm Manager', 'inventory.adjust'),
  ('Farm Manager', 'equipment.view'),
  ('Farm Manager', 'equipment.create'),
  ('Farm Manager', 'equipment.edit'),
  ('Farm Manager', 'equipment.delete'),
  ('Farm Manager', 'suppliers.view'),
  ('Farm Manager', 'suppliers.create'),
  ('Farm Manager', 'suppliers.edit'),
  ('Farm Manager', 'suppliers.delete'),
  ('Farm Manager', 'tasks.view'),
  ('Farm Manager', 'tasks.create'),
  ('Farm Manager', 'tasks.edit'),
  ('Farm Manager', 'tasks.delete'),
  ('Farm Manager', 'tasks.complete'),
  ('Farm Manager', 'customers.view'),
  ('Farm Manager', 'customers.create'),
  ('Farm Manager', 'customers.edit'),
  ('Farm Manager', 'customers.delete'),
  ('Farm Manager', 'orders.view'),
  ('Farm Manager', 'orders.create'),
  ('Farm Manager', 'orders.edit'),
  ('Farm Manager', 'orders.delete'),
  ('Farm Manager', 'products.view'),
  ('Farm Manager', 'products.create'),
  ('Farm Manager', 'products.edit'),
  ('Farm Manager', 'products.delete'),
  ('Farm Manager', 'finance.view'),
  ('Farm Manager', 'finance.create'),
  ('Farm Manager', 'finance.edit'),
  ('Farm Manager', 'content.view'),
  ('Farm Manager', 'content.create'),
  ('Farm Manager', 'content.edit'),
  ('Farm Manager', 'content.delete'),
  ('Farm Manager', 'content.publish'),
  ('Farm Manager', 'media.view'),
  ('Farm Manager', 'media.create'),
  ('Farm Manager', 'media.edit'),
  ('Farm Manager', 'media.delete'),
  ('Farm Manager', 'settings.view'),
  ('Farm Manager', 'settings.edit'),
  ('Farm Manager', 'team.view'),
  ('Farm Manager', 'team.view_contact'),
  ('Farm Manager', 'audit.view'),
  ('Farm Manager', 'reports.operations'),
  ('Farm Manager', 'reports.sales'),
  ('Veterinarian', 'livestock.view'),
  ('Veterinarian', 'veterinary.view'),
  ('Veterinarian', 'veterinary.create'),
  ('Veterinarian', 'veterinary.edit'),
  ('Veterinarian', 'inventory.view'),
  ('Veterinarian', 'media.view'),
  ('Veterinarian', 'media.create'),
  ('Veterinarian', 'tasks.view'),
  ('Veterinarian', 'tasks.complete'),
  ('Inventory Officer', 'inventory.view'),
  ('Inventory Officer', 'inventory.create'),
  ('Inventory Officer', 'inventory.edit'),
  ('Inventory Officer', 'inventory.adjust'),
  ('Inventory Officer', 'harvests.view'),
  ('Inventory Officer', 'harvests.approve'),
  ('Inventory Officer', 'suppliers.view'),
  ('Inventory Officer', 'products.view'),
  ('Inventory Officer', 'media.view'),
  ('Inventory Officer', 'media.create'),
  ('Inventory Officer', 'tasks.view'),
  ('Inventory Officer', 'tasks.complete'),
  ('Inventory Officer', 'reports.operations'),
  ('Sales Manager', 'products.view'),
  ('Sales Manager', 'products.create'),
  ('Sales Manager', 'products.edit'),
  ('Sales Manager', 'orders.view'),
  ('Sales Manager', 'orders.create'),
  ('Sales Manager', 'orders.edit'),
  ('Sales Manager', 'customers.view'),
  ('Sales Manager', 'customers.create'),
  ('Sales Manager', 'customers.edit'),
  ('Sales Manager', 'inventory.view'),
  ('Sales Manager', 'media.view'),
  ('Sales Manager', 'media.create'),
  ('Sales Manager', 'media.edit'),
  ('Sales Manager', 'tasks.view'),
  ('Sales Manager', 'tasks.complete'),
  ('Sales Manager', 'reports.sales'),
  ('Farm Worker', 'livestock.view'),
  ('Farm Worker', 'livestock.create'),
  ('Farm Worker', 'livestock.edit'),
  ('Farm Worker', 'crops.view'),
  ('Farm Worker', 'crops.create'),
  ('Farm Worker', 'fields.view'),
  ('Farm Worker', 'harvests.view'),
  ('Farm Worker', 'harvests.create'),
  ('Farm Worker', 'inventory.view'),
  ('Farm Worker', 'inventory.create'),
  ('Farm Worker', 'equipment.view'),
  ('Farm Worker', 'media.view'),
  ('Farm Worker', 'media.create'),
  ('Farm Worker', 'tasks.view'),
  ('Farm Worker', 'tasks.complete'),
  ('Accountant', 'finance.view'),
  ('Accountant', 'finance.create'),
  ('Accountant', 'finance.edit'),
  ('Accountant', 'orders.view'),
  ('Accountant', 'customers.view'),
  ('Accountant', 'suppliers.view'),
  ('Accountant', 'inventory.view'),
  ('Accountant', 'products.view'),
  ('Accountant', 'media.view'),
  ('Accountant', 'media.create'),
  ('Accountant', 'tasks.view'),
  ('Accountant', 'tasks.complete'),
  ('Accountant', 'reports.financial'),
  ('Accountant', 'reports.sales'),
  ('Agronomist', 'crops.view'),
  ('Agronomist', 'crops.create'),
  ('Agronomist', 'crops.edit'),
  ('Agronomist', 'fields.view'),
  ('Agronomist', 'fields.edit'),
  ('Agronomist', 'harvests.view'),
  ('Agronomist', 'harvests.create'),
  ('Agronomist', 'inventory.view'),
  ('Agronomist', 'media.view'),
  ('Agronomist', 'media.create'),
  ('Agronomist', 'tasks.view'),
  ('Agronomist', 'tasks.complete'),
  ('Agronomist', 'reports.operations'),
  ('Equipment Officer', 'equipment.view'),
  ('Equipment Officer', 'equipment.create'),
  ('Equipment Officer', 'equipment.edit'),
  ('Equipment Officer', 'inventory.view'),
  ('Equipment Officer', 'suppliers.view'),
  ('Equipment Officer', 'media.view'),
  ('Equipment Officer', 'media.create'),
  ('Equipment Officer', 'tasks.view'),
  ('Equipment Officer', 'tasks.complete'),
  ('Equipment Officer', 'reports.operations'),
  ('Procurement Officer', 'suppliers.view'),
  ('Procurement Officer', 'suppliers.create'),
  ('Procurement Officer', 'suppliers.edit'),
  ('Procurement Officer', 'inventory.view'),
  ('Procurement Officer', 'equipment.view'),
  ('Procurement Officer', 'media.view'),
  ('Procurement Officer', 'media.create'),
  ('Procurement Officer', 'tasks.view'),
  ('Procurement Officer', 'tasks.complete'),
  ('Auditor', 'livestock.view'),
  ('Auditor', 'crops.view'),
  ('Auditor', 'fields.view'),
  ('Auditor', 'harvests.view'),
  ('Auditor', 'veterinary.view'),
  ('Auditor', 'inventory.view'),
  ('Auditor', 'equipment.view'),
  ('Auditor', 'suppliers.view'),
  ('Auditor', 'tasks.view'),
  ('Auditor', 'customers.view'),
  ('Auditor', 'orders.view'),
  ('Auditor', 'products.view'),
  ('Auditor', 'finance.view'),
  ('Auditor', 'content.view'),
  ('Auditor', 'media.view'),
  ('Auditor', 'settings.view'),
  ('Auditor', 'team.view'),
  ('Auditor', 'audit.view'),
  ('Auditor', 'reports.operations'),
  ('Auditor', 'reports.financial'),
  ('Auditor', 'reports.sales')
) as p(role_name, key)
join roles r on r.name = p.role_name
join permissions perm on perm.key = p.key;

-- 3. Several roles per person ------------------------------------------------
create table farm_member_roles (
  member_id uuid not null references farm_members(id) on delete cascade,
  role_id uuid not null references roles(id),
  assigned_by uuid references profiles(id),
  assigned_at timestamptz not null default now(),
  primary key (member_id, role_id)
);
create index farm_member_roles_role_idx on farm_member_roles (role_id);

-- Everyone keeps the single role they have today.
insert into farm_member_roles (member_id, role_id)
select id, role_id from farm_members where role_id is not null;

alter table farm_member_roles enable row level security;
create policy "Members can view their farm's role assignments" on farm_member_roles
  for select using (exists (
    select 1 from farm_members fm
    where fm.id = farm_member_roles.member_id and is_farm_member(fm.farm_id)));
-- No client write policies: assignments change only via set_member_roles() /
-- add_farm_member(), which hold all the rules.
revoke insert, update, delete on farm_member_roles from anon, authenticated;

-- 4. Permission helpers --------------------------------------------------------
-- has_farm_role keeps working (now across ALL of a person's roles) so any
-- policy not yet moved over, and the owner-only checks, stay correct.
create or replace function has_farm_role(target_farm_id uuid, allowed_role_names text[])
returns boolean as $$
  select exists (
    select 1
    from farm_members fm
    join farm_member_roles fmr on fmr.member_id = fm.id
    join roles r on r.id = fmr.role_id
    where fm.farm_id = target_farm_id
      and fm.user_id = auth.uid()
      and fm.status = 'active'
      and r.name = any(allowed_role_names)
  );
$$ language sql security definer stable set search_path = public, pg_temp;

-- The one question every policy asks: may the caller do `perm` on this farm?
-- True if ANY of their roles grants it (permissions combine). Suspended or
-- non-members get false. auth.uid() is null for anonymous callers -> false,
-- which is why anon may execute it (policies on public tables call it).
create or replace function has_permission(target_farm_id uuid, perm text)
returns boolean as $$
  select exists (
    select 1
    from farm_members fm
    join farm_member_roles fmr on fmr.member_id = fm.id
    join role_permissions rp on rp.role_id = fmr.role_id
    where fm.farm_id = target_farm_id
      and fm.user_id = auth.uid()
      and fm.status = 'active'
      and rp.permission_key = perm
  );
$$ language sql security definer stable set search_path = public, pg_temp;

revoke execute on function has_permission(uuid, text) from public;
grant execute on function has_permission(uuid, text) to anon, authenticated, service_role;

-- What the UI needs to decide what to show: roles + permissions in one call.
-- Display only -- the database re-checks on every write.
create or replace function my_access(p_farm_id uuid)
returns jsonb as $$
  select jsonb_build_object(
    'roles', coalesce((
      select jsonb_agg(distinct r.name order by r.name)
      from farm_members fm
      join farm_member_roles fmr on fmr.member_id = fm.id
      join roles r on r.id = fmr.role_id
      where fm.farm_id = p_farm_id and fm.user_id = auth.uid() and fm.status = 'active'), '[]'::jsonb),
    'permissions', coalesce((
      select jsonb_agg(distinct rp.permission_key order by rp.permission_key)
      from farm_members fm
      join farm_member_roles fmr on fmr.member_id = fm.id
      join role_permissions rp on rp.role_id = fmr.role_id
      where fm.farm_id = p_farm_id and fm.user_id = auth.uid() and fm.status = 'active'), '[]'::jsonb)
  );
$$ language sql stable security definer set search_path = public, pg_temp;

revoke execute on function my_access(uuid) from public, anon;
grant execute on function my_access(uuid) to authenticated;

-- 5. Team management, now multi-role ------------------------------------------
drop function if exists list_farm_team(uuid);
drop function if exists add_farm_member(uuid, text, text);
drop function if exists set_member_role(uuid, text);

create or replace function farm_has_other_active_owner(p_farm_id uuid, p_excluding_member uuid)
returns boolean as $$
  select exists (
    select 1 from farm_members fm
    join farm_member_roles fmr on fmr.member_id = fm.id
    join roles r on r.id = fmr.role_id
    where fm.farm_id = p_farm_id
      and fm.id <> p_excluding_member
      and fm.status = 'active'
      and r.name = 'Farm Owner'
  );
$$ language sql stable security definer set search_path = public, pg_temp;
revoke execute on function farm_has_other_active_owner(uuid, uuid) from public, anon, authenticated;

create or replace function list_farm_team(p_farm_id uuid)
returns table (
  member_id uuid, user_id uuid, display_name text, email text,
  role_names text[], status text, joined_at timestamptz
) as $$
  select
    fm.id,
    fm.user_id,
    coalesce(nullif(p.display_name, ''), nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''), 'Unnamed'),
    case when has_permission(p_farm_id, 'team.view_contact') then u.email::text else null end,
    coalesce((select array_agg(r.name order by r.name)
              from farm_member_roles fmr join roles r on r.id = fmr.role_id
              where fmr.member_id = fm.id), '{}'::text[]),
    fm.status,
    fm.joined_at
  from farm_members fm
  join profiles p on p.id = fm.user_id
  join auth.users u on u.id = fm.user_id
  where fm.farm_id = p_farm_id
    and has_permission(p_farm_id, 'team.view')
  order by fm.joined_at;
$$ language sql stable security definer set search_path = public, pg_temp;
revoke execute on function list_farm_team(uuid) from public, anon;
grant execute on function list_farm_team(uuid) to authenticated;

-- Validates a role-name list and returns the matching ids.
create or replace function resolve_role_ids(p_role_names text[])
returns uuid[] as $$
declare
  v_names text[];
  v_ids uuid[];
begin
  select coalesce(array_agg(distinct trim(n)), '{}') into v_names
  from unnest(coalesce(p_role_names, '{}')) n where trim(n) <> '';
  if coalesce(array_length(v_names, 1), 0) = 0 then
    raise exception 'Choose at least one role.';
  end if;
  select array_agg(id) into v_ids from roles where name = any(v_names);
  if coalesce(array_length(v_ids, 1), 0) <> array_length(v_names, 1) then
    raise exception 'One of those is not a valid role.';
  end if;
  return v_ids;
end;
$$ language plpgsql stable security definer set search_path = public, pg_temp;
revoke execute on function resolve_role_ids(text[]) from public, anon, authenticated;

create or replace function add_farm_member(p_farm_id uuid, p_email text, p_role_names text[])
returns void as $$
declare
  v_user uuid;
  v_ids uuid[];
  v_member uuid;
  v_label text;
begin
  if not has_permission(p_farm_id, 'team.assign_roles') then
    raise exception 'Only a Farm Owner can add team members.';
  end if;

  v_ids := resolve_role_ids(p_role_names);

  select id into v_user from auth.users where lower(email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'No account found for that email. Ask them to create an account first, then add them here.';
  end if;
  if exists (select 1 from farm_members where farm_id = p_farm_id and user_id = v_user) then
    raise exception 'That person is already on this farm''s team.';
  end if;

  insert into farm_members (farm_id, user_id, status)
  values (p_farm_id, v_user, 'active') returning id into v_member;
  insert into farm_member_roles (member_id, role_id, assigned_by)
  select v_member, unnest(v_ids), auth.uid();

  select coalesce(nullif(display_name, ''), 'Team member') into v_label from profiles where id = v_user;
  insert into audit_log (farm_id, user_id, action, entity_type, entity_label, new_values)
  values (p_farm_id, auth.uid(), 'Added', 'Team Member', v_label,
          jsonb_build_object('roles', (select jsonb_agg(name order by name) from roles where id = any(v_ids))));
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
revoke execute on function add_farm_member(uuid, text, text[]) from public, anon;
grant execute on function add_farm_member(uuid, text, text[]) to authenticated;

-- Replace a person's whole role set in one atomic step.
create or replace function set_member_roles(p_member_id uuid, p_role_names text[])
returns void as $$
declare
  m record;
  v_ids uuid[];
  v_old text[];
  v_new text[];
  v_label text;
begin
  select fm.farm_id, fm.user_id, fm.status into m from farm_members fm where fm.id = p_member_id;

  -- Same message for "doesn't exist" and "not yours to change": no probing.
  if not found or not has_permission(m.farm_id, 'team.assign_roles') then
    raise exception 'Team member not found, or you are not allowed to change them.';
  end if;
  if m.user_id = auth.uid() then
    raise exception 'You cannot change your own roles. Ask another Farm Owner.';
  end if;

  v_ids := resolve_role_ids(p_role_names);

  select coalesce(array_agg(r.name order by r.name), '{}') into v_old
  from farm_member_roles fmr join roles r on r.id = fmr.role_id where fmr.member_id = p_member_id;
  select coalesce(array_agg(name order by name), '{}') into v_new from roles where id = any(v_ids);

  if v_old = v_new then return; end if;

  if 'Farm Owner' = any(v_old) and not ('Farm Owner' = any(v_new)) and m.status = 'active'
     and not farm_has_other_active_owner(m.farm_id, p_member_id) then
    raise exception 'A farm must always have at least one active Farm Owner.';
  end if;

  delete from farm_member_roles where member_id = p_member_id and role_id <> all(v_ids);
  insert into farm_member_roles (member_id, role_id, assigned_by)
  select p_member_id, unnest(v_ids), auth.uid()
  on conflict (member_id, role_id) do nothing;

  select coalesce(nullif(display_name, ''), 'Team member') into v_label from profiles where id = m.user_id;
  insert into audit_log (farm_id, user_id, action, entity_type, entity_label, old_values, new_values)
  values (m.farm_id, auth.uid(), 'Roles changed', 'Team Member', v_label,
          jsonb_build_object('roles', to_jsonb(v_old)), jsonb_build_object('roles', to_jsonb(v_new)));
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
revoke execute on function set_member_roles(uuid, text[]) from public, anon;
grant execute on function set_member_roles(uuid, text[]) to authenticated;

create or replace function set_member_status(p_member_id uuid, p_status text)
returns void as $$
declare
  m record;
  v_is_owner boolean;
  v_label text;
begin
  if p_status not in ('active', 'suspended') then
    raise exception 'Status must be active or suspended.';
  end if;

  select fm.farm_id, fm.user_id, fm.status into m from farm_members fm where fm.id = p_member_id;
  if not found or not has_permission(m.farm_id, 'team.assign_roles') then
    raise exception 'Team member not found, or you are not allowed to change them.';
  end if;
  if m.user_id = auth.uid() then
    raise exception 'You cannot change your own access. Ask another Farm Owner.';
  end if;
  if m.status = p_status then return; end if;

  select exists (select 1 from farm_member_roles fmr join roles r on r.id = fmr.role_id
                 where fmr.member_id = p_member_id and r.name = 'Farm Owner') into v_is_owner;
  if p_status = 'suspended' and v_is_owner and m.status = 'active'
     and not farm_has_other_active_owner(m.farm_id, p_member_id) then
    raise exception 'A farm must always have at least one active Farm Owner.';
  end if;

  update farm_members set status = p_status where id = p_member_id;

  select coalesce(nullif(display_name, ''), 'Team member') into v_label from profiles where id = m.user_id;
  insert into audit_log (farm_id, user_id, action, entity_type, entity_label, old_values, new_values)
  values (m.farm_id, auth.uid(),
          case when p_status = 'suspended' then 'Suspended' else 'Reactivated' end,
          'Team Member', v_label,
          jsonb_build_object('status', m.status), jsonb_build_object('status', p_status));
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
revoke execute on function set_member_status(uuid, text) from public, anon;
grant execute on function set_member_status(uuid, text) to authenticated;

-- Every member must always hold at least one role (also catches direct SQL).
create or replace function guard_member_keeps_a_role()
returns trigger as $$
begin
  -- fires on role removal; cascade deletes of the member itself are fine
  if exists (select 1 from farm_members where id = old.member_id)
     and not exists (select 1 from farm_member_roles where member_id = old.member_id) then
    raise exception 'A team member must always have at least one role.';
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create constraint trigger guard_member_keeps_a_role_trigger
  after delete on farm_member_roles
  deferrable initially deferred
  for each row execute function guard_member_keeps_a_role();

-- role_id on farm_members is now redundant (and a second source of truth).
alter table farm_members drop column role_id;

-- 6. Guards now ask for permissions, not role names ---------------------------
create or replace function guard_vet_report_review()
returns trigger as $$
begin
  if new.status is distinct from old.status
     and new.status in ('Approved', 'Rejected', 'Changes Requested') then
    if auth.uid() = old.submitted_by then
      raise exception 'A veterinary report cannot be reviewed by the professional who submitted it.';
    end if;
    if not has_permission(old.farm_id, 'veterinary.review') then
      raise exception 'You do not have permission to approve, reject, or request changes on a veterinary report.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create or replace function guard_harvest_approval()
returns trigger as $$
begin
  if new.status is distinct from old.status
     and new.status in ('Approved', 'Added to Inventory') then
    if auth.uid() = old.recorded_by then
      raise exception 'A harvest cannot be approved by the person who recorded it.';
    end if;
    if not has_permission(old.farm_id, 'harvests.approve') then
      raise exception 'You do not have permission to approve a harvest.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- Blog: same body as 0016, with the publish rule on a permission.
do $blog$
declare
  src text;
begin
  select pg_get_functiondef('guard_blog_post()'::regprocedure) into src;
  src := replace(src,
    'not has_farm_role(new.farm_id, array[''Farm Owner'', ''Farm Manager''])',
    'not has_permission(new.farm_id, ''content.publish'')');
  src := replace(src,
    'Only a Farm Owner or Farm Manager can publish, schedule, edit or unpublish a live post. You can save it as a draft.',
    'You do not have permission to publish, schedule, edit or unpublish a live post. You can save it as a draft.');
  if position('content.publish' in src) = 0 then
    raise exception 'guard_blog_post could not be rewritten; its body has changed.';
  end if;
  execute src;
end
$blog$;

-- Stock: manual "Adjustment" entries (the ones that can hide shrinkage) need
-- their own permission; ordinary consumption/purchases only need inventory.create.
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

  if new.transaction_type = 'Adjustment' and not has_permission(new.farm_id, 'inventory.adjust') then
    raise exception 'You do not have permission to make manual stock adjustments.';
  end if;

  select quantity into current_qty
  from inventory_items where id = new.inventory_item_id for update;

  if current_qty + new.quantity_change < 0 then
    raise exception 'Not enough stock: only % available.', current_qty;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- Tasks: someone who can only COMPLETE tasks (tasks.complete without
-- tasks.edit) may move their own assigned task's status forward and nothing
-- else. RLS can't restrict columns, so the trigger does.
create or replace function guard_task_update()
returns trigger as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.farm_id is distinct from old.farm_id then
    raise exception 'A task cannot be moved to a different farm.';
  end if;

  if new.assigned_to is distinct from old.assigned_to and new.assigned_to is not null and not exists (
    select 1 from farm_members fm
    where fm.farm_id = new.farm_id and fm.user_id = new.assigned_to and fm.status = 'active'
  ) then
    raise exception 'Tasks can only be assigned to members of this farm.';
  end if;

  if not has_permission(old.farm_id, 'tasks.edit') then
    if (to_jsonb(new) - 'status' - 'completed_at' - 'updated_at')
       is distinct from (to_jsonb(old) - 'status' - 'completed_at' - 'updated_at') then
      raise exception 'You can only change the status of a task assigned to you.';
    end if;
    if new.status not in ('Pending', 'In Progress', 'Completed') then
      raise exception 'You can mark a task Pending, In Progress or Completed.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- 7. Table policies: from 'any member' to the matching permission -------------
drop policy if exists "Farm members can view animals" on animals;
drop policy if exists "Farm members can manage animals" on animals;
create policy "animals_select" on animals for select using (has_permission(farm_id, 'livestock.view'));
create policy "animals_insert" on animals for insert with check (has_permission(farm_id, 'livestock.create'));
create policy "animals_update" on animals for update using (has_permission(farm_id, 'livestock.edit')) with check (has_permission(farm_id, 'livestock.edit'));
create policy "animals_delete" on animals for delete using (has_permission(farm_id, 'livestock.delete'));

drop policy if exists "Farm members can view animal events" on animal_events;
drop policy if exists "Farm members can manage animal events" on animal_events;
create policy "animal_events_select" on animal_events for select using (has_permission(farm_id, 'livestock.view'));
create policy "animal_events_insert" on animal_events for insert with check (has_permission(farm_id, 'livestock.create'));
create policy "animal_events_update" on animal_events for update using (has_permission(farm_id, 'livestock.edit')) with check (has_permission(farm_id, 'livestock.edit'));
create policy "animal_events_delete" on animal_events for delete using (has_permission(farm_id, 'livestock.delete'));

drop policy if exists "Farm members can view crop cycles" on crop_cycles;
drop policy if exists "Farm members can manage crop cycles" on crop_cycles;
create policy "crop_cycles_select" on crop_cycles for select using (has_permission(farm_id, 'crops.view'));
create policy "crop_cycles_insert" on crop_cycles for insert with check (has_permission(farm_id, 'crops.create'));
create policy "crop_cycles_update" on crop_cycles for update using (has_permission(farm_id, 'crops.edit')) with check (has_permission(farm_id, 'crops.edit'));
create policy "crop_cycles_delete" on crop_cycles for delete using (has_permission(farm_id, 'crops.delete'));

drop policy if exists "Farm members can view crop activities" on crop_activities;
drop policy if exists "Farm members can manage crop activities" on crop_activities;
create policy "crop_activities_select" on crop_activities for select using (has_permission(farm_id, 'crops.view'));
create policy "crop_activities_insert" on crop_activities for insert with check (has_permission(farm_id, 'crops.create'));
create policy "crop_activities_update" on crop_activities for update using (has_permission(farm_id, 'crops.edit')) with check (has_permission(farm_id, 'crops.edit'));
create policy "crop_activities_delete" on crop_activities for delete using (has_permission(farm_id, 'crops.delete'));

drop policy if exists "Farm members can view fields" on fields;
drop policy if exists "Farm members can manage fields" on fields;
create policy "fields_select" on fields for select using (has_permission(farm_id, 'fields.view'));
create policy "fields_insert" on fields for insert with check (has_permission(farm_id, 'fields.create'));
create policy "fields_update" on fields for update using (has_permission(farm_id, 'fields.edit')) with check (has_permission(farm_id, 'fields.edit'));
create policy "fields_delete" on fields for delete using (has_permission(farm_id, 'fields.delete'));

drop policy if exists "Farm members can view harvests" on harvests;
drop policy if exists "Farm members can manage harvests" on harvests;
create policy "harvests_select" on harvests for select using (has_permission(farm_id, 'harvests.view'));
create policy "harvests_insert" on harvests for insert with check (has_permission(farm_id, 'harvests.create'));
create policy "harvests_update" on harvests for update using ((has_permission(farm_id, 'harvests.edit') or has_permission(farm_id, 'harvests.approve'))) with check ((has_permission(farm_id, 'harvests.edit') or has_permission(farm_id, 'harvests.approve')));
create policy "harvests_delete" on harvests for delete using (has_permission(farm_id, 'harvests.delete'));

drop policy if exists "Farm members can view vet reports" on veterinary_reports;
drop policy if exists "Farm members can manage vet reports" on veterinary_reports;
create policy "veterinary_reports_select" on veterinary_reports for select using (has_permission(farm_id, 'veterinary.view'));
create policy "veterinary_reports_insert" on veterinary_reports for insert with check (has_permission(farm_id, 'veterinary.create'));
create policy "veterinary_reports_update" on veterinary_reports for update using ((has_permission(farm_id, 'veterinary.review') or (has_permission(farm_id, 'veterinary.edit') and submitted_by = auth.uid() and status in ('Submitted', 'Under Review', 'Changes Requested')))) with check ((has_permission(farm_id, 'veterinary.review') or (has_permission(farm_id, 'veterinary.edit') and submitted_by = auth.uid() and status in ('Submitted', 'Under Review', 'Changes Requested'))));
create policy "veterinary_reports_delete" on veterinary_reports for delete using (has_permission(farm_id, 'veterinary.delete'));

drop policy if exists "Farm members can view inventory" on inventory_items;
drop policy if exists "Farm members can manage inventory" on inventory_items;
create policy "inventory_items_select" on inventory_items for select using (has_permission(farm_id, 'inventory.view'));
create policy "inventory_items_insert" on inventory_items for insert with check (has_permission(farm_id, 'inventory.create'));
create policy "inventory_items_update" on inventory_items for update using (has_permission(farm_id, 'inventory.edit')) with check (has_permission(farm_id, 'inventory.edit'));
create policy "inventory_items_delete" on inventory_items for delete using (has_permission(farm_id, 'inventory.delete'));

drop policy if exists "Farm members can view inventory transactions" on inventory_transactions;
drop policy if exists "Farm members can create inventory transactions" on inventory_transactions;
create policy "inventory_transactions_select" on inventory_transactions for select using (has_permission(farm_id, 'inventory.view'));
create policy "inventory_transactions_insert" on inventory_transactions for insert with check (has_permission(farm_id, 'inventory.create'));

drop policy if exists "Farm members can view equipment" on equipment;
drop policy if exists "Farm members can manage equipment" on equipment;
create policy "equipment_select" on equipment for select using (has_permission(farm_id, 'equipment.view'));
create policy "equipment_insert" on equipment for insert with check (has_permission(farm_id, 'equipment.create'));
create policy "equipment_update" on equipment for update using (has_permission(farm_id, 'equipment.edit')) with check (has_permission(farm_id, 'equipment.edit'));
create policy "equipment_delete" on equipment for delete using (has_permission(farm_id, 'equipment.delete'));

drop policy if exists "Farm members can view maintenance records" on maintenance_records;
drop policy if exists "Farm members can manage maintenance records" on maintenance_records;
create policy "maintenance_records_select" on maintenance_records for select using (has_permission(farm_id, 'equipment.view'));
create policy "maintenance_records_insert" on maintenance_records for insert with check (has_permission(farm_id, 'equipment.create'));
create policy "maintenance_records_update" on maintenance_records for update using (has_permission(farm_id, 'equipment.edit')) with check (has_permission(farm_id, 'equipment.edit'));
create policy "maintenance_records_delete" on maintenance_records for delete using (has_permission(farm_id, 'equipment.delete'));

drop policy if exists "Farm members can view suppliers" on suppliers;
drop policy if exists "Farm members can manage suppliers" on suppliers;
create policy "suppliers_select" on suppliers for select using (has_permission(farm_id, 'suppliers.view'));
create policy "suppliers_insert" on suppliers for insert with check (has_permission(farm_id, 'suppliers.create'));
create policy "suppliers_update" on suppliers for update using (has_permission(farm_id, 'suppliers.edit')) with check (has_permission(farm_id, 'suppliers.edit'));
create policy "suppliers_delete" on suppliers for delete using (has_permission(farm_id, 'suppliers.delete'));

drop policy if exists "Farm members can view supplier purchases" on supplier_purchases;
drop policy if exists "Farm members can manage supplier purchases" on supplier_purchases;
drop policy if exists "Farm members can update supplier purchases" on supplier_purchases;
drop policy if exists "Farm members can delete supplier purchases" on supplier_purchases;
create policy "supplier_purchases_select" on supplier_purchases for select using (has_permission(farm_id, 'suppliers.view'));
create policy "supplier_purchases_insert" on supplier_purchases for insert with check (has_permission(farm_id, 'suppliers.create'));
create policy "supplier_purchases_update" on supplier_purchases for update using (has_permission(farm_id, 'suppliers.edit')) with check (has_permission(farm_id, 'suppliers.edit'));
create policy "supplier_purchases_delete" on supplier_purchases for delete using (has_permission(farm_id, 'suppliers.delete'));

drop policy if exists "Farm members can view customers" on customers;
drop policy if exists "Farm members can manage customers" on customers;
create policy "customers_select" on customers for select using (has_permission(farm_id, 'customers.view'));
create policy "customers_insert" on customers for insert with check (has_permission(farm_id, 'customers.create'));
create policy "customers_update" on customers for update using (has_permission(farm_id, 'customers.edit')) with check (has_permission(farm_id, 'customers.edit'));
create policy "customers_delete" on customers for delete using (has_permission(farm_id, 'customers.delete'));

drop policy if exists "Farm members can view orders" on orders;
drop policy if exists "Farm members can manage orders" on orders;
create policy "orders_select" on orders for select using (has_permission(farm_id, 'orders.view'));
create policy "orders_insert" on orders for insert with check (has_permission(farm_id, 'orders.create'));
create policy "orders_update" on orders for update using (has_permission(farm_id, 'orders.edit')) with check (has_permission(farm_id, 'orders.edit'));
create policy "orders_delete" on orders for delete using (has_permission(farm_id, 'orders.delete'));

drop policy if exists "Farm members can manage their products" on products;
create policy "products_select" on products for select using (has_permission(farm_id, 'products.view'));
create policy "products_insert" on products for insert with check (has_permission(farm_id, 'products.create'));
create policy "products_update" on products for update using (has_permission(farm_id, 'products.edit')) with check (has_permission(farm_id, 'products.edit'));
create policy "products_delete" on products for delete using (has_permission(farm_id, 'products.delete'));

drop policy if exists "Farm members can view expenses" on expenses;
drop policy if exists "Farm members can manage expenses" on expenses;
create policy "expenses_select" on expenses for select using (has_permission(farm_id, 'finance.view'));
create policy "expenses_insert" on expenses for insert with check (has_permission(farm_id, 'finance.create'));
create policy "expenses_update" on expenses for update using (has_permission(farm_id, 'finance.edit')) with check (has_permission(farm_id, 'finance.edit'));
create policy "expenses_delete" on expenses for delete using (has_permission(farm_id, 'finance.delete'));

drop policy if exists "Farm members can view income" on income_records;
drop policy if exists "Farm members can manage income" on income_records;
create policy "income_records_select" on income_records for select using (has_permission(farm_id, 'finance.view'));
create policy "income_records_insert" on income_records for insert with check (has_permission(farm_id, 'finance.create'));
create policy "income_records_update" on income_records for update using (has_permission(farm_id, 'finance.edit')) with check (has_permission(farm_id, 'finance.edit'));
create policy "income_records_delete" on income_records for delete using (has_permission(farm_id, 'finance.delete'));

drop policy if exists "Farm members can view order items" on order_items;
drop policy if exists "Farm members can manage order items" on order_items;
create policy "order_items_select" on order_items for select using (exists (select 1 from orders o where o.id = order_items.order_id and has_permission(o.farm_id, 'orders.view')));
create policy "order_items_insert" on order_items for insert with check (exists (select 1 from orders o where o.id = order_items.order_id and has_permission(o.farm_id, 'orders.create')));
create policy "order_items_update" on order_items for update using (exists (select 1 from orders o where o.id = order_items.order_id and has_permission(o.farm_id, 'orders.edit'))) with check (exists (select 1 from orders o where o.id = order_items.order_id and has_permission(o.farm_id, 'orders.edit')));
create policy "order_items_delete" on order_items for delete using (exists (select 1 from orders o where o.id = order_items.order_id and has_permission(o.farm_id, 'orders.delete')));

drop policy if exists "Farm members can view field history" on field_history;
create policy "field_history_select" on field_history for select using (exists (select 1 from fields f where f.id = field_history.field_id and has_permission(f.farm_id, 'fields.view')));

drop policy if exists "Farm members can view tasks" on tasks;
drop policy if exists "Farm members can create tasks" on tasks;
drop policy if exists "Farm members can update tasks" on tasks;
create policy "tasks_select" on tasks for select using (has_permission(farm_id, 'tasks.view'));
create policy "tasks_insert" on tasks for insert with check (has_permission(farm_id, 'tasks.create'));
create policy "tasks_update" on tasks for update using ((has_permission(farm_id, 'tasks.edit') or (has_permission(farm_id, 'tasks.complete') and assigned_to = auth.uid()))) with check ((has_permission(farm_id, 'tasks.edit') or (has_permission(farm_id, 'tasks.complete') and assigned_to = auth.uid())));
create policy "tasks_delete" on tasks for delete using (has_permission(farm_id, 'tasks.delete'));

drop policy if exists "Farm members can view all their posts" on blog_posts;
drop policy if exists "Farm members can create posts" on blog_posts;
drop policy if exists "Farm members can update posts" on blog_posts;
create policy "blog_posts_member_select" on blog_posts for select using (has_permission(farm_id, 'content.view'));
create policy "blog_posts_insert" on blog_posts for insert with check (has_permission(farm_id, 'content.create'));
create policy "blog_posts_update" on blog_posts for update using (has_permission(farm_id, 'content.edit')) with check (has_permission(farm_id, 'content.edit'));
create policy "blog_posts_delete" on blog_posts for delete using (has_permission(farm_id, 'content.delete'));

drop policy if exists "Members can view their farm's media" on media;
drop policy if exists "Members can add media to their farm" on media;
drop policy if exists "Members can edit alt text of their farm's media" on media;
drop policy if exists "Uploader or Owner/Manager can delete media" on media;
create policy "media_select" on media for select using (has_permission(farm_id, 'media.view'));
create policy "media_insert" on media for insert with check (has_permission(farm_id, 'media.create') and uploaded_by = auth.uid());
create policy "media_update" on media for update using (has_permission(farm_id, 'media.edit') or (uploaded_by = auth.uid() and has_permission(farm_id, 'media.create'))) with check (has_permission(farm_id, 'media.edit') or (uploaded_by = auth.uid() and has_permission(farm_id, 'media.create')));
create policy "media_delete" on media for delete using (has_permission(farm_id, 'media.delete') or (uploaded_by = auth.uid() and has_permission(farm_id, 'media.create')));

drop policy if exists "Farm members can manage their settings" on settings;
drop policy if exists "Anyone can view public farm settings" on settings;
create policy "settings_select" on settings for select using (is_public = true or has_permission(farm_id, 'settings.view'));
create policy "settings_insert" on settings for insert with check (has_permission(farm_id, 'settings.edit'));
create policy "settings_update" on settings for update using (has_permission(farm_id, 'settings.edit')) with check (has_permission(farm_id, 'settings.edit'));
create policy "settings_delete" on settings for delete using (has_permission(farm_id, 'settings.edit'));

drop policy if exists "Owners and managers can view the audit log" on audit_log;
create policy "audit_log_select" on audit_log for select using (has_permission(farm_id, 'audit.view'));

-- Storage: uploads/reads follow the same media permissions.
drop policy if exists "media_read_private" on storage.objects;
drop policy if exists "media_insert" on storage.objects;
drop policy if exists "media_update" on storage.objects;
drop policy if exists "media_delete" on storage.objects;

create policy "media_read_private" on storage.objects for select
  using (bucket_id in ('site-media', 'private-media')
         and storage_path_farm(name) is not null
         and has_permission(storage_path_farm(name), 'media.view'));
create policy "media_insert" on storage.objects for insert
  with check (bucket_id in ('site-media', 'private-media')
              and storage_path_farm(name) is not null
              and has_permission(storage_path_farm(name), 'media.create'));
create policy "media_update" on storage.objects for update
  using (bucket_id in ('site-media', 'private-media')
         and storage_path_farm(name) is not null
         and (owner = auth.uid() or has_permission(storage_path_farm(name), 'media.edit')));
create policy "media_delete" on storage.objects for delete
  using (bucket_id in ('site-media', 'private-media')
         and storage_path_farm(name) is not null
         and (owner = auth.uid() or has_permission(storage_path_farm(name), 'media.delete')));

-- 8. Platform Super Administrator ---------------------------------------------
-- Runs the platform itself (which farms exist, whether one is suspended),
-- independently of any farm's Owner. It deliberately does NOT see farm
-- operational data (animals, finance, orders...) -- only the structure needed
-- to run the platform. Grant it from the SQL editor / service role:
--     insert into platform_admins (user_id, note) values ('<user uuid>', 'why');
-- There is no app screen that can create one, so it can't be self-granted.
create table platform_admins (
  user_id uuid primary key references profiles(id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);
alter table platform_admins enable row level security;
revoke all on platform_admins from anon, authenticated;

create or replace function is_platform_admin()
returns boolean as $$
  select exists (select 1 from platform_admins where user_id = auth.uid());
$$ language sql stable security definer set search_path = public, pg_temp;
revoke execute on function is_platform_admin() from public;
grant execute on function is_platform_admin() to anon, authenticated, service_role;

create policy "Platform admins can view organizations" on organizations for select using (is_platform_admin());
create policy "Platform admins can view farms" on farms for select using (is_platform_admin());
create policy "Platform admins can view memberships" on farm_members for select using (is_platform_admin());
create policy "Platform admins can view role assignments" on farm_member_roles for select using (is_platform_admin());
create policy "Platform admins can view profiles" on profiles for select using (is_platform_admin());

-- The one write a platform admin has: suspend / reactivate / archive a farm.
create or replace function platform_set_farm_status(p_farm_id uuid, p_status text)
returns void as $$
declare
  v_old text;
  v_name text;
begin
  if not is_platform_admin() then
    raise exception 'Only a platform administrator can do that.';
  end if;
  if p_status not in ('active', 'suspended', 'archived') then
    raise exception 'Status must be active, suspended or archived.';
  end if;
  select status, name into v_old, v_name from farms where id = p_farm_id;
  if not found then raise exception 'Farm not found.'; end if;
  if v_old = p_status then return; end if;
  update farms set status = p_status, updated_at = now() where id = p_farm_id;
  insert into audit_log (farm_id, user_id, action, entity_type, entity_label, old_values, new_values)
  values (p_farm_id, auth.uid(), 'Status changed (platform)', 'Farm', v_name,
          jsonb_build_object('status', v_old), jsonb_build_object('status', p_status));
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
revoke execute on function platform_set_farm_status(uuid, text) from public, anon;
grant execute on function platform_set_farm_status(uuid, text) to authenticated;

