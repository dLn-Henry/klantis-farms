-- ============================================================================
-- 0019: Strict role boundaries (Phase 1B, revision)
--
-- Feedback on 0018: roles were still too wide. A vet could see the whole
-- animal register and the media library; every role could browse media. Now:
--
--  * MEDIA LIBRARY is sensitive: Farm Owner and Farm Manager only.
--  * VETERINARIAN sees only animals a manager has ASSIGNED to them (while the
--    assignment is open), only their OWN reports, and attaches photos/PDFs to a
--    report itself (private `vet-reports` bucket, visible to the author and
--    reviewers) -- never the media library, other animals, inventory or finance.
--  * Everyone below Owner/Manager/Auditor sees only the tasks assigned to them.
--  * Least-privilege trim of every other role.
--  * The "farm overview" dashboard is a permission (dashboard.overview).
--
-- Run after 0018. Role changes are plain data (role_permissions), so this can
-- be tuned later without code.
-- ============================================================================

-- 1. New permissions ---------------------------------------------------------
insert into permissions (key, module, action, description) values
  ('tasks.view_own',         'tasks',      'view_own',      'View only tasks assigned to you'),
  ('livestock.view_assigned','livestock',  'view_assigned', 'View only animals assigned to you for a vet visit'),
  ('veterinary.assign',      'veterinary', 'assign',        'Assign a veterinarian to animals'),
  ('dashboard.overview',     'dashboard',  'overview',      'See the farm-wide overview dashboard')
on conflict (key) do nothing;

-- 2. Role matrix, tightened (replaces every non-Owner role's grants) ---------
delete from role_permissions where role_id in (select id from roles where name <> 'Farm Owner');
insert into role_permissions (role_id, permission_key)
select r.id, g.key from (values
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
  ('Farm Manager', 'veterinary.assign'),
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
  ('Farm Manager', 'dashboard.overview'),
  ('Veterinarian', 'veterinary.create'),
  ('Veterinarian', 'veterinary.edit'),
  ('Veterinarian', 'livestock.view_assigned'),
  ('Veterinarian', 'tasks.view_own'),
  ('Veterinarian', 'tasks.complete'),
  ('Inventory Officer', 'inventory.view'),
  ('Inventory Officer', 'inventory.create'),
  ('Inventory Officer', 'inventory.edit'),
  ('Inventory Officer', 'inventory.adjust'),
  ('Inventory Officer', 'harvests.view'),
  ('Inventory Officer', 'harvests.approve'),
  ('Inventory Officer', 'suppliers.view'),
  ('Inventory Officer', 'tasks.view_own'),
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
  ('Sales Manager', 'tasks.view_own'),
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
  ('Farm Worker', 'tasks.view_own'),
  ('Farm Worker', 'tasks.complete'),
  ('Accountant', 'finance.view'),
  ('Accountant', 'finance.create'),
  ('Accountant', 'finance.edit'),
  ('Accountant', 'orders.view'),
  ('Accountant', 'customers.view'),
  ('Accountant', 'suppliers.view'),
  ('Accountant', 'tasks.view_own'),
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
  ('Agronomist', 'tasks.view_own'),
  ('Agronomist', 'tasks.complete'),
  ('Agronomist', 'reports.operations'),
  ('Equipment Officer', 'equipment.view'),
  ('Equipment Officer', 'equipment.create'),
  ('Equipment Officer', 'equipment.edit'),
  ('Equipment Officer', 'tasks.view_own'),
  ('Equipment Officer', 'tasks.complete'),
  ('Equipment Officer', 'reports.operations'),
  ('Procurement Officer', 'suppliers.view'),
  ('Procurement Officer', 'suppliers.create'),
  ('Procurement Officer', 'suppliers.edit'),
  ('Procurement Officer', 'inventory.view'),
  ('Procurement Officer', 'tasks.view_own'),
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
  ('Auditor', 'team.view'),
  ('Auditor', 'audit.view'),
  ('Auditor', 'reports.operations'),
  ('Auditor', 'reports.financial'),
  ('Auditor', 'reports.sales'),
  ('Auditor', 'dashboard.overview')
) as g(role_name, key)
join roles r on r.name = g.role_name
join permissions p on p.key = g.key;
-- The Owner holds every permission, including the new ones.
insert into role_permissions (role_id, permission_key)
select r.id, p.key from roles r cross join permissions p where r.name = 'Farm Owner'
on conflict do nothing;

-- 3. Vet assignments: which animals a vet may see ----------------------------
create table vet_assignments (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  vet_user_id uuid not null references profiles(id),
  animal_id uuid not null references animals(id) on delete cascade,
  reason text check (char_length(reason) <= 500),
  due_date date,
  status text not null default 'Open' check (status in ('Open', 'Completed', 'Cancelled')),
  assigned_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index vet_assignments_vet_idx on vet_assignments (vet_user_id, status);
create index vet_assignments_animal_idx on vet_assignments (animal_id);
alter table vet_assignments enable row level security;

-- Is the caller a vet with an OPEN assignment for this animal? (security
-- definer so animal policies can ask it without exposing the assignments.
-- anon may execute it -- policies on animals are evaluated for anon too --
-- and it returns false because auth.uid() is null.)
create or replace function is_assigned_animal(p_animal uuid)
returns boolean as $$
  select exists (
    select 1 from vet_assignments a
    where a.animal_id = p_animal
      and a.vet_user_id = auth.uid()
      and a.status = 'Open'
      and has_permission(a.farm_id, 'livestock.view_assigned')
  );
$$ language sql stable security definer set search_path = public, pg_temp;
revoke execute on function is_assigned_animal(uuid) from public;
grant execute on function is_assigned_animal(uuid) to anon, authenticated, service_role;

create policy "vet_assignments_select" on vet_assignments for select
  using (has_permission(farm_id, 'veterinary.assign') or vet_user_id = auth.uid());
create policy "vet_assignments_insert" on vet_assignments for insert
  with check (has_permission(farm_id, 'veterinary.assign') and assigned_by = auth.uid());
create policy "vet_assignments_update" on vet_assignments for update
  using (has_permission(farm_id, 'veterinary.assign')) with check (has_permission(farm_id, 'veterinary.assign'));
revoke delete on vet_assignments from anon, authenticated;

create or replace function guard_vet_assignment()
returns trigger as $$
declare
  v_animal_farm uuid;
begin
  if tg_op = 'INSERT' then
    select farm_id into v_animal_farm from animals where id = new.animal_id;
    if v_animal_farm is distinct from new.farm_id then
      raise exception 'That animal is not on this farm.';
    end if;
    -- the assignee must be an ACTIVE member who can actually submit vet reports
    if not exists (
      select 1 from farm_members fm
      join farm_member_roles fmr on fmr.member_id = fm.id
      join role_permissions rp on rp.role_id = fmr.role_id
      where fm.farm_id = new.farm_id and fm.user_id = new.vet_user_id
        and fm.status = 'active' and rp.permission_key = 'veterinary.create'
    ) then
      raise exception 'You can only assign a team member who has a veterinary role.';
    end if;
    new.status := 'Open';
    new.completed_at := null;
  else
    if new.farm_id <> old.farm_id or new.animal_id <> old.animal_id
       or new.vet_user_id <> old.vet_user_id or new.assigned_by is distinct from old.assigned_by then
      raise exception 'Only the status of an assignment can change. Cancel it and create a new one instead.';
    end if;
    if old.status <> 'Open' then
      raise exception 'That assignment is already closed.';
    end if;
    if new.status = 'Completed' then new.completed_at := now(); end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create trigger guard_vet_assignment_trigger
  before insert or update on vet_assignments
  for each row execute function guard_vet_assignment();

create or replace function audit_vet_assignment()
returns trigger as $$
declare v_tag text;
begin
  select tag into v_tag from animals where id = new.animal_id;
  insert into audit_log (farm_id, user_id, action, entity_type, entity_label, new_values)
  values (new.farm_id, auth.uid(), case when tg_op = 'INSERT' then 'Assigned vet' else 'Assignment ' || lower(new.status) end,
          'Vet Assignment', coalesce(v_tag, 'animal'),
          jsonb_build_object('vet_user_id', new.vet_user_id, 'status', new.status));
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create trigger audit_vet_assignments
  after insert or update of status on vet_assignments
  for each row execute function audit_vet_assignment();

-- Submitting a report for an assigned animal closes that assignment.
create or replace function complete_vet_assignment_on_report()
returns trigger as $$
begin
  update vet_assignments set status = 'Completed', completed_at = now()
  where animal_id = new.animal_id and vet_user_id = new.submitted_by and status = 'Open';
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create trigger complete_vet_assignment_trigger
  after insert on veterinary_reports
  for each row execute function complete_vet_assignment_on_report();

-- 4. Animals and vet reports: a vet sees only what is theirs ------------------
drop policy if exists "animals_select" on animals;
create policy "animals_select" on animals for select
  using (has_permission(farm_id, 'livestock.view') or is_assigned_animal(id));

drop policy if exists "animal_events_select" on animal_events;
create policy "animal_events_select" on animal_events for select
  using (has_permission(farm_id, 'livestock.view') or is_assigned_animal(animal_id));

drop policy if exists "veterinary_reports_select" on veterinary_reports;
create policy "veterinary_reports_select" on veterinary_reports for select
  using (has_permission(farm_id, 'veterinary.view')
         or (has_permission(farm_id, 'veterinary.create') and submitted_by = auth.uid()));

-- A report can only be written about an animal you may see: managers (whole
-- register) or a vet with an open assignment for it.
drop policy if exists "veterinary_reports_insert" on veterinary_reports;
create policy "veterinary_reports_insert" on veterinary_reports for insert
  with check (has_permission(farm_id, 'veterinary.create')
              and (has_permission(farm_id, 'livestock.view') or is_assigned_animal(animal_id)));

-- 5. Tasks: below manager, only the ones assigned to you ----------------------
drop policy if exists "tasks_select" on tasks;
create policy "tasks_select" on tasks for select
  using (has_permission(farm_id, 'tasks.view')
         or (has_permission(farm_id, 'tasks.view_own') and assigned_to = auth.uid()));

-- 6. Vet report attachments: belong to the report, not the media library ------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vet-reports', 'vet-reports', false, 5242880,
        array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- "<farm>/<report>/<file>": the report id is the second path segment.
create or replace function storage_path_report(p_name text)
returns uuid as $$
  select case
    when split_part(p_name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then split_part(p_name, '/', 2)::uuid
    else null
  end;
$$ language sql immutable;

-- May the caller still add to / see this report's attachments?
create or replace function can_edit_vet_report_files(p_report uuid)
returns boolean as $$
  select exists (select 1 from veterinary_reports r
    where r.id = p_report and r.submitted_by = auth.uid()
      and r.status in ('Submitted', 'Changes Requested'));
$$ language sql stable security definer set search_path = public, pg_temp;
create or replace function can_view_vet_report_files(p_report uuid)
returns boolean as $$
  select exists (select 1 from veterinary_reports r
    where r.id = p_report
      and (has_permission(r.farm_id, 'veterinary.view') or r.submitted_by = auth.uid()));
$$ language sql stable security definer set search_path = public, pg_temp;
revoke execute on function can_edit_vet_report_files(uuid), can_view_vet_report_files(uuid) from public, anon;
grant execute on function can_edit_vet_report_files(uuid), can_view_vet_report_files(uuid) to authenticated;

create table vet_report_attachments (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  report_id uuid not null references veterinary_reports(id) on delete cascade,
  path text not null unique,
  file_name text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','application/pdf')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  caption text check (char_length(caption) <= 300),
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  check (split_part(path, '/', 1) = farm_id::text and split_part(path, '/', 2) = report_id::text)
);
create index vet_report_attachments_report_idx on vet_report_attachments (report_id);
alter table vet_report_attachments enable row level security;

create policy "vet_attachments_select" on vet_report_attachments for select
  using (can_view_vet_report_files(report_id));
create policy "vet_attachments_insert" on vet_report_attachments for insert
  with check (uploaded_by = auth.uid() and can_edit_vet_report_files(report_id)
              and exists (select 1 from veterinary_reports r where r.id = report_id and r.farm_id = vet_report_attachments.farm_id));
create policy "vet_attachments_delete" on vet_report_attachments for delete
  using (can_edit_vet_report_files(report_id) or has_permission(farm_id, 'veterinary.review'));
revoke update on vet_report_attachments from anon, authenticated;

create or replace function guard_vet_attachment_count()
returns trigger as $$
begin
  if (select count(*) from vet_report_attachments where report_id = new.report_id) >= 10 then
    raise exception 'A report can have at most 10 attachments.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create trigger guard_vet_attachment_count_trigger
  before insert on vet_report_attachments
  for each row execute function guard_vet_attachment_count();

drop policy if exists "vet_reports_read" on storage.objects;
drop policy if exists "vet_reports_insert" on storage.objects;
drop policy if exists "vet_reports_delete" on storage.objects;
create policy "vet_reports_read" on storage.objects for select
  using (bucket_id = 'vet-reports' and storage_path_farm(name) is not null
         and storage_path_report(name) is not null
         and can_view_vet_report_files(storage_path_report(name)));
create policy "vet_reports_insert" on storage.objects for insert
  with check (bucket_id = 'vet-reports' and storage_path_farm(name) is not null
              and storage_path_report(name) is not null
              and can_edit_vet_report_files(storage_path_report(name))
              and exists (select 1 from veterinary_reports r
                          where r.id = storage_path_report(name) and r.farm_id = storage_path_farm(name)));
create policy "vet_reports_delete" on storage.objects for delete
  using (bucket_id = 'vet-reports' and storage_path_report(name) is not null
         and (can_edit_vet_report_files(storage_path_report(name))
              or has_permission(storage_path_farm(name), 'veterinary.review')));


-- 7. Customers: their own account area, never the farm dashboard ---------------
-- A signed-in person who is not a farm member is a customer. They may read
-- ONLY their own customer record and their own orders (and the lines in them).
-- No write policies: orders are created by the checkout flow (Phase 3).
-- Anonymous visitors evaluate these too: auth.uid() is null, so they match nothing.
create policy "customers_self_select" on customers for select using (user_id = auth.uid());
create policy "orders_self_select" on orders for select
  using (customer_id in (select c.id from customers c where c.user_id = auth.uid()));
create policy "order_items_self_select" on order_items for select
  using (exists (select 1 from orders o
                 where o.id = order_items.order_id
                   and o.customer_id in (select c.id from customers c where c.user_id = auth.uid())));
