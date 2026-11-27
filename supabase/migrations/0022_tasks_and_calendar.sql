-- ============================================================================
-- 0022: Tasks (assignees, checklists, evidence, verification, recurrence,
--       history) and the shared farm calendar (Phase 1E)
--
-- Extends the existing `tasks` table rather than replacing it.
--  * task_assignees is now the ONE source of who a task is assigned to
--    (`tasks.assigned_to` is migrated and dropped, so there aren't two truths).
--  * A task may require VERIFICATION: the assignee submits, someone ELSE with
--    tasks.verify approves (Completed) or rejects with a note (back to In
--    Progress). Nobody verifies their own work. May also require EVIDENCE
--    (at least one photo) before it can be finished.
--  * Checklists with progress; attachments (instructions / evidence) in a
--    private bucket; a history of everything that happened.
--  * Recurring tasks: templates + an idempotent generator.
--  * calendar_events: shared farm events/appointments/deadlines/reminders.
-- "Assigned" and "Overdue" are DERIVED (assignees exist / due date passed), not
-- stored statuses, so they can never go stale.
-- Run after 0021.
-- ============================================================================

-- 1. Permissions ---------------------------------------------------------------
insert into permissions (key, module, action, description) values
  ('tasks.verify',    'tasks',    'verify',  'Verify (approve or reject) completed tasks'),
  ('calendar.view',   'calendar', 'view',    'View the shared farm calendar'),
  ('calendar.manage', 'calendar', 'manage',  'Add and edit calendar events')
on conflict (key) do nothing;

insert into role_permissions (role_id, permission_key)
select r.id, g.key from (values
  ('Farm Owner','tasks.verify'),('Farm Manager','tasks.verify'),
  ('Farm Owner','calendar.manage'),('Farm Manager','calendar.manage'),
  ('Farm Owner','calendar.view'),('Farm Manager','calendar.view'),('Veterinarian','calendar.view'),
  ('Inventory Officer','calendar.view'),('Sales Manager','calendar.view'),('Farm Worker','calendar.view'),
  ('Accountant','calendar.view'),('Agronomist','calendar.view'),('Equipment Officer','calendar.view'),
  ('Procurement Officer','calendar.view'),('Auditor','calendar.view')
) as g(role_name, key)
join roles r on r.name = g.role_name
on conflict do nothing;

-- 2. Task columns --------------------------------------------------------------
alter table tasks
  add column start_date date,
  add column requires_verification boolean not null default false,
  add column requires_evidence boolean not null default false,
  add column submitted_by uuid references profiles(id),
  add column submitted_at timestamptz,
  add column verified_by uuid references profiles(id),
  add column verified_at timestamptz,
  add column rejection_note text check (char_length(rejection_note) <= 500),
  add column recurrence_id uuid,
  add constraint tasks_dates_ok check (start_date is null or due_date is null or start_date <= due_date);

alter table tasks drop constraint tasks_status_check;
alter table tasks add constraint tasks_status_check
  check (status in ('Pending', 'In Progress', 'Awaiting Verification', 'Completed', 'Cancelled'));

-- 3. Assignees (replaces tasks.assigned_to) ------------------------------------
create table task_assignees (
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references profiles(id),
  assigned_by uuid references profiles(id),
  assigned_at timestamptz not null default now(),
  primary key (task_id, user_id)
);
create index task_assignees_user_idx on task_assignees (user_id);

insert into task_assignees (task_id, user_id)
select id, assigned_to from tasks where assigned_to is not null;

-- Is the caller one of this task's assignees? (security definer so task policies
-- can ask it without recursing through task_assignees' own policies.)
create or replace function is_task_assignee(p_task uuid)
returns boolean as $$
  select exists (select 1 from task_assignees where task_id = p_task and user_id = auth.uid());
$$ language sql stable security definer set search_path = public, pg_temp;
revoke execute on function is_task_assignee(uuid) from public;
grant execute on function is_task_assignee(uuid) to anon, authenticated, service_role;

drop policy if exists "tasks_select" on tasks;
drop policy if exists "tasks_update" on tasks;
create policy "tasks_select" on tasks for select
  using (has_permission(farm_id, 'tasks.view')
         or (has_permission(farm_id, 'tasks.view_own') and is_task_assignee(id)));
create policy "tasks_update" on tasks for update
  using (has_permission(farm_id, 'tasks.edit') or has_permission(farm_id, 'tasks.verify')
         or (has_permission(farm_id, 'tasks.complete') and is_task_assignee(id)))
  with check (has_permission(farm_id, 'tasks.edit') or has_permission(farm_id, 'tasks.verify')
         or (has_permission(farm_id, 'tasks.complete') and is_task_assignee(id)));

alter table tasks drop column assigned_to;

-- Visibility helpers shared by the task child tables and file storage.
create or replace function can_view_task(p_task uuid)
returns boolean as $$
  select exists (select 1 from tasks t where t.id = p_task
    and (has_permission(t.farm_id, 'tasks.view')
         or (has_permission(t.farm_id, 'tasks.view_own') and is_task_assignee(t.id))));
$$ language sql stable security definer set search_path = public, pg_temp;
create or replace function can_manage_task(p_task uuid)
returns boolean as $$
  select exists (select 1 from tasks t where t.id = p_task and has_permission(t.farm_id, 'tasks.edit'));
$$ language sql stable security definer set search_path = public, pg_temp;
-- An assignee may add evidence while the task is still open.
create or replace function can_add_task_evidence(p_task uuid)
returns boolean as $$
  select exists (select 1 from tasks t where t.id = p_task and t.status in ('Pending', 'In Progress')
    and has_permission(t.farm_id, 'tasks.complete') and is_task_assignee(t.id));
$$ language sql stable security definer set search_path = public, pg_temp;
revoke execute on function can_view_task(uuid), can_manage_task(uuid), can_add_task_evidence(uuid) from public, anon;
grant execute on function can_view_task(uuid), can_manage_task(uuid), can_add_task_evidence(uuid) to authenticated;

alter table task_assignees enable row level security;
create policy "task_assignees_select" on task_assignees for select using (can_view_task(task_id));
create policy "task_assignees_insert" on task_assignees for insert
  with check (can_manage_task(task_id) and assigned_by = auth.uid());
create policy "task_assignees_delete" on task_assignees for delete using (can_manage_task(task_id));
revoke update on task_assignees from anon, authenticated;

create or replace function guard_task_assignee()
returns trigger as $$
declare v_farm uuid;
begin
  select farm_id into v_farm from tasks where id = new.task_id;
  if not exists (select 1 from farm_members fm where fm.farm_id = v_farm and fm.user_id = new.user_id and fm.status = 'active') then
    raise exception 'Tasks can only be assigned to members of this farm.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create trigger guard_task_assignee_trigger before insert on task_assignees
  for each row execute function guard_task_assignee();

-- 4. History -------------------------------------------------------------------
create table task_events (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references tasks(id) on delete cascade,
  farm_id uuid not null references farms(id) on delete cascade,
  actor uuid references profiles(id),
  event text not null,
  detail text,
  created_at timestamptz not null default now()
);
create index task_events_task_idx on task_events (task_id, created_at);
alter table task_events enable row level security;
create policy "task_events_select" on task_events for select using (can_view_task(task_id));
revoke insert, update, delete on task_events from anon, authenticated;

create or replace function log_task_event(p_task uuid, p_farm uuid, p_event text, p_detail text)
returns void as $$
begin
  insert into task_events (task_id, farm_id, actor, event, detail)
  values (p_task, p_farm,
          case when coalesce(current_setting('klantis.generating', true), '') = 'on' then null else auth.uid() end,
          p_event, p_detail);
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
revoke execute on function log_task_event(uuid, uuid, text, text) from public, anon, authenticated;

-- 5. Task guards -----------------------------------------------------------------
create or replace function guard_task_insert()
returns trigger as $$
begin
  if auth.uid() is null then return new; end if;

  if new.recurrence_id is not null then
    -- Recurring occurrences are created only by generate_recurring_tasks().
    if coalesce(current_setting('klantis.generating', true), '') <> 'on' then
      raise exception 'Recurring tasks are created automatically.';
    end if;
  elsif new.created_by is distinct from auth.uid() then
    raise exception 'A task can only be created as yourself.';
  end if;

  if new.status <> 'Pending' then
    raise exception 'A new task must start as Pending.';
  end if;
  new.submitted_by := null; new.submitted_at := null; new.verified_by := null; new.verified_at := null; new.rejection_note := null;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create or replace function guard_task_update()
returns trigger as $$
declare
  can_edit boolean;
  can_verify boolean;
  is_assignee boolean;
  a jsonb; b jsonb; k text;
  workflow constant text[] := array['status','completed_at','updated_at','submitted_by','submitted_at','verified_by','verified_at','rejection_note'];
  needs_evidence boolean;
  has_evidence boolean;
begin
  if auth.uid() is null then return new; end if;

  if new.farm_id is distinct from old.farm_id then
    raise exception 'A task cannot be moved to a different farm.';
  end if;
  if new.recurrence_id is distinct from old.recurrence_id then
    raise exception 'A task''s recurrence cannot be changed.';
  end if;

  can_edit := has_permission(old.farm_id, 'tasks.edit');
  can_verify := has_permission(old.farm_id, 'tasks.verify');
  is_assignee := is_task_assignee(old.id);

  -- Everything except the workflow columns needs tasks.edit.
  if not can_edit then
    a := to_jsonb(new); b := to_jsonb(old);
    foreach k in array workflow loop a := a - k; b := b - k; end loop;
    if a is distinct from b then
      raise exception 'You can only change the status of a task assigned to you.';
    end if;
  end if;

  if new.status is not distinct from old.status then
    -- the verification fields are system-managed: never client-settable
    new.submitted_by := old.submitted_by; new.submitted_at := old.submitted_at;
    new.verified_by := old.verified_by;   new.verified_at := old.verified_at;
    new.rejection_note := old.rejection_note;
    return new;
  end if;

  -- ---- a status change ----
  needs_evidence := old.requires_evidence;
  select exists (select 1 from task_attachments where task_id = old.id and kind = 'Evidence') into has_evidence;

  if new.status = 'Cancelled' then
    if not can_edit then raise exception 'Only a Farm Owner or Manager can cancel a task.'; end if;

  elsif new.status = 'Awaiting Verification' then
    if not old.requires_verification then raise exception 'This task doesn''t need verification: mark it Completed instead.'; end if;
    if old.status not in ('Pending', 'In Progress') then raise exception 'Only an open task can be submitted for verification.'; end if;
    if needs_evidence and not has_evidence then raise exception 'Add at least one photo as evidence before submitting this task.'; end if;
    new.submitted_by := auth.uid(); new.submitted_at := now();
    new.rejection_note := null; new.verified_by := null; new.verified_at := null;

  elsif new.status = 'Completed' then
    if old.requires_verification then
      if old.status <> 'Awaiting Verification' then
        raise exception 'This task must be submitted for verification first.';
      end if;
      if not can_verify then raise exception 'You do not have permission to verify tasks.'; end if;
      if auth.uid() is not distinct from old.submitted_by then
        raise exception 'You cannot verify a task you submitted yourself. Someone else must approve it.';
      end if;
      new.verified_by := auth.uid(); new.verified_at := now(); new.rejection_note := null;
    else
      if old.status = 'Completed' then return new; end if;
      if needs_evidence and not has_evidence then raise exception 'Add at least one photo as evidence before finishing this task.'; end if;
    end if;

  elsif old.status = 'Awaiting Verification' and new.status = 'In Progress' then
    -- rejection
    if not can_verify then raise exception 'You do not have permission to reject a task.'; end if;
    if auth.uid() is not distinct from old.submitted_by then raise exception 'You cannot review a task you submitted yourself.'; end if;
    if char_length(trim(coalesce(new.rejection_note, ''))) = 0 then
      raise exception 'Say what needs to be corrected when rejecting a task.';
    end if;
    new.verified_by := null; new.verified_at := null;

  elsif old.status = 'Awaiting Verification' then
    raise exception 'A task awaiting verification can only be approved, rejected or cancelled.';

  elsif old.status in ('Completed', 'Cancelled') then
    if not can_edit then raise exception 'Only a Farm Owner or Manager can reopen a task.'; end if;
    new.submitted_by := null; new.submitted_at := null; new.verified_by := null; new.verified_at := null;
    new.rejection_note := null;
  end if;

  if new.status not in ('Awaiting Verification', 'Completed') then new.verified_by := null; new.verified_at := null; end if;
  if new.status <> 'In Progress' then new.rejection_note := null; end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create or replace function task_history_trigger()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    perform log_task_event(new.id, new.farm_id, 'Created',
      case when new.recurrence_id is not null then 'Created automatically (recurring task)' else null end);
  elsif new.status is distinct from old.status then
    perform log_task_event(new.id, new.farm_id,
      case when old.status = 'Awaiting Verification' and new.status = 'Completed' then 'Verified'
           when old.status = 'Awaiting Verification' and new.status = 'In Progress' then 'Rejected'
           when new.status = 'Awaiting Verification' then 'Submitted for verification'
           else 'Status changed' end,
      case when old.status = 'Awaiting Verification' and new.status = 'In Progress' then new.rejection_note
           else old.status || ' → ' || new.status end);
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create trigger task_history_trigger after insert or update on tasks
  for each row execute function task_history_trigger();

create or replace function task_assignee_history_trigger()
returns trigger as $$
declare v_task uuid; v_farm uuid; v_user uuid; v_name text;
begin
  v_task := coalesce(new.task_id, old.task_id); v_user := coalesce(new.user_id, old.user_id);
  select farm_id into v_farm from tasks where id = v_task;
  if v_farm is null then return null; end if;   -- task itself is being deleted
  select coalesce(nullif(display_name, ''), 'Team member') into v_name from profiles where id = v_user;
  perform log_task_event(v_task, v_farm, case when tg_op = 'INSERT' then 'Assigned' else 'Unassigned' end, v_name);
  return null;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create trigger task_assignee_history_trigger after insert or delete on task_assignees
  for each row execute function task_assignee_history_trigger();

-- 6. Checklists ----------------------------------------------------------------
create table task_checklist_items (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references tasks(id) on delete cascade,
  label text not null check (char_length(trim(label)) between 1 and 200),
  done boolean not null default false,
  done_by uuid references profiles(id),
  done_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index task_checklist_task_idx on task_checklist_items (task_id, sort_order);
alter table task_checklist_items enable row level security;
create policy "checklist_select" on task_checklist_items for select using (can_view_task(task_id));
create policy "checklist_insert" on task_checklist_items for insert with check (can_manage_task(task_id));
create policy "checklist_update" on task_checklist_items for update
  using (can_manage_task(task_id) or (can_view_task(task_id) and exists (
    select 1 from tasks t where t.id = task_id and has_permission(t.farm_id, 'tasks.complete')
      and is_task_assignee(t.id) and t.status in ('Pending', 'In Progress'))))
  with check (can_view_task(task_id));
create policy "checklist_delete" on task_checklist_items for delete using (can_manage_task(task_id));

create or replace function guard_checklist_item()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    if (select count(*) from task_checklist_items where task_id = new.task_id) >= 30 then
      raise exception 'A checklist can have at most 30 items.';
    end if;
    new.done := false; new.done_by := null; new.done_at := null;
    return new;
  end if;
  if new.task_id <> old.task_id then raise exception 'A checklist item cannot move to another task.'; end if;
  if not can_manage_task(old.task_id) and (new.label is distinct from old.label or new.sort_order is distinct from old.sort_order) then
    raise exception 'You can only tick items off, not change them.';
  end if;
  if new.done is distinct from old.done then
    new.done_by := case when new.done then auth.uid() else null end;
    new.done_at := case when new.done then now() else null end;
  else
    new.done_by := old.done_by; new.done_at := old.done_at;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create trigger guard_checklist_item_trigger before insert or update on task_checklist_items
  for each row execute function guard_checklist_item();

-- 7. Attachments (instructions / evidence) -------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('task-files', 'task-files', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create table task_attachments (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  kind text not null check (kind in ('Instruction', 'Evidence')),
  path text not null unique,
  file_name text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','application/pdf')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  check (split_part(path, '/', 1) = farm_id::text and split_part(path, '/', 2) = task_id::text)
);
create index task_attachments_task_idx on task_attachments (task_id);
alter table task_attachments enable row level security;

create policy "task_attachments_select" on task_attachments for select using (can_view_task(task_id));
create policy "task_attachments_insert" on task_attachments for insert
  with check (uploaded_by = auth.uid()
    and exists (select 1 from tasks t where t.id = task_id and t.farm_id = task_attachments.farm_id)
    and ((kind = 'Instruction' and can_manage_task(task_id))
      or (kind = 'Evidence' and (can_add_task_evidence(task_id) or can_manage_task(task_id)))));
create policy "task_attachments_delete" on task_attachments for delete
  using (can_manage_task(task_id) or (uploaded_by = auth.uid() and can_add_task_evidence(task_id)));
revoke update on task_attachments from anon, authenticated;

create or replace function guard_task_attachment_count()
returns trigger as $$
begin
  if (select count(*) from task_attachments where task_id = new.task_id) >= 15 then
    raise exception 'A task can have at most 15 files.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create trigger guard_task_attachment_count_trigger before insert on task_attachments
  for each row execute function guard_task_attachment_count();

create or replace function task_evidence_history_trigger()
returns trigger as $$
begin
  if new.kind = 'Evidence' then perform log_task_event(new.task_id, new.farm_id, 'Evidence added', new.file_name); end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create trigger task_evidence_history_trigger after insert on task_attachments
  for each row execute function task_evidence_history_trigger();

drop policy if exists "task_files_read" on storage.objects;
drop policy if exists "task_files_insert" on storage.objects;
drop policy if exists "task_files_delete" on storage.objects;
create policy "task_files_read" on storage.objects for select
  using (bucket_id = 'task-files' and storage_path_report(name) is not null
         and can_view_task(storage_path_report(name)));
create policy "task_files_insert" on storage.objects for insert
  with check (bucket_id = 'task-files' and storage_path_farm(name) is not null and storage_path_report(name) is not null
              and exists (select 1 from tasks t where t.id = storage_path_report(name) and t.farm_id = storage_path_farm(name))
              and (can_manage_task(storage_path_report(name)) or can_add_task_evidence(storage_path_report(name))));
create policy "task_files_delete" on storage.objects for delete
  using (bucket_id = 'task-files' and storage_path_report(name) is not null
         and (can_manage_task(storage_path_report(name))
              or (owner = auth.uid() and can_add_task_evidence(storage_path_report(name)))));

-- 8. Recurring tasks -------------------------------------------------------------
create table task_recurrences (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text check (char_length(description) <= 2000),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  weekday int check (weekday between 0 and 6),           -- 0 = Sunday .. 6 = Saturday (weekly)
  day_of_month int check (day_of_month between 1 and 28), -- (monthly; 28 max so every month has it)
  start_date date not null,
  end_date date,
  assignee_ids uuid[] not null default '{}',
  requires_verification boolean not null default false,
  requires_evidence boolean not null default false,
  checklist text[] not null default '{}',
  active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date),
  check ((frequency = 'weekly') = (weekday is not null)),
  check ((frequency = 'monthly') = (day_of_month is not null)),
  check (coalesce(array_length(checklist, 1), 0) <= 30),
  check (coalesce(array_length(assignee_ids, 1), 0) <= 20)
);
alter table task_recurrences enable row level security;
create policy "recurrences_select" on task_recurrences for select using (has_permission(farm_id, 'tasks.view'));
create policy "recurrences_insert" on task_recurrences for insert
  with check (has_permission(farm_id, 'tasks.create') and created_by = auth.uid());
create policy "recurrences_update" on task_recurrences for update
  using (has_permission(farm_id, 'tasks.edit')) with check (has_permission(farm_id, 'tasks.edit'));
revoke delete on task_recurrences from anon, authenticated;   -- stop it (active = false), don't erase history

alter table tasks add constraint tasks_recurrence_fk foreign key (recurrence_id) references task_recurrences(id);
create unique index tasks_recurrence_day_unique on tasks (recurrence_id, due_date) where recurrence_id is not null;

create or replace function guard_task_recurrence()
returns trigger as $$
declare u uuid;
begin
  foreach u in array new.assignee_ids loop
    if not exists (select 1 from farm_members fm where fm.farm_id = new.farm_id and fm.user_id = u and fm.status = 'active') then
      raise exception 'Tasks can only be assigned to members of this farm.';
    end if;
  end loop;
  if tg_op = 'UPDATE' and new.farm_id <> old.farm_id then raise exception 'A recurrence cannot move to another farm.'; end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
create trigger guard_task_recurrence_trigger before insert or update on task_recurrences
  for each row execute function guard_task_recurrence();

-- Creates the occurrences due in the next `p_horizon_days` days (and any missed in
-- the last 3). Safe to call as often as you like: a unique index makes it
-- idempotent. Called when someone opens Tasks/Calendar; a scheduled job (pg_cron /
-- Vercel cron) can call it too.
create or replace function generate_recurring_tasks(p_farm_id uuid, p_horizon_days int default 14)
returns int as $$
declare
  r record;
  d date;
  v_id uuid;
  v_made int := 0;
  v_from date;
  v_to date;
  v_item text;
  v_n int;
  v_user uuid;
begin
  if not is_farm_member(p_farm_id) then
    raise exception 'You are not a member of that farm.';
  end if;
  p_horizon_days := least(greatest(coalesce(p_horizon_days, 14), 1), 31);
  perform set_config('klantis.generating', 'on', true);

  for r in select * from task_recurrences where farm_id = p_farm_id and active loop
    v_from := greatest(r.start_date, current_date - 3);
    v_to := least(coalesce(r.end_date, current_date + p_horizon_days), current_date + p_horizon_days);
    d := v_from;
    while d <= v_to loop
      if r.frequency = 'daily'
         or (r.frequency = 'weekly' and extract(dow from d)::int = r.weekday)
         or (r.frequency = 'monthly' and extract(day from d)::int = r.day_of_month) then
        v_id := null;
        insert into tasks (farm_id, title, description, priority, due_date, created_by,
                           requires_verification, requires_evidence, recurrence_id)
        values (p_farm_id, r.title, r.description, r.priority, d, r.created_by,
                r.requires_verification, r.requires_evidence, r.id)
        on conflict (recurrence_id, due_date) where recurrence_id is not null do nothing
        returning id into v_id;
        if v_id is not null then
          v_made := v_made + 1;
          foreach v_user in array r.assignee_ids loop
            insert into task_assignees (task_id, user_id, assigned_by) values (v_id, v_user, r.created_by)
            on conflict do nothing;
          end loop;
          v_n := 0;
          foreach v_item in array r.checklist loop
            v_n := v_n + 1;
            insert into task_checklist_items (task_id, label, sort_order) values (v_id, v_item, v_n);
          end loop;
        end if;
      end if;
      d := d + 1;
    end loop;
  end loop;

  perform set_config('klantis.generating', 'off', true);
  return v_made;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
revoke execute on function generate_recurring_tasks(uuid, int) from public, anon;
grant execute on function generate_recurring_tasks(uuid, int) to authenticated;

-- 9. Shared calendar events ---------------------------------------------------------
create table calendar_events (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text check (char_length(description) <= 1000),
  kind text not null default 'Event' check (kind in ('Event', 'Appointment', 'Deadline', 'Reminder')),
  starts_on date not null,
  ends_on date,
  start_time time,
  end_time time,
  location text check (char_length(location) <= 120),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  check (ends_on is null or ends_on >= starts_on),
  check (end_time is null or start_time is null or (ends_on is not null and ends_on > starts_on) or end_time >= start_time)
);
create index calendar_events_farm_date_idx on calendar_events (farm_id, starts_on);
alter table calendar_events enable row level security;
create policy "calendar_select" on calendar_events for select using (has_permission(farm_id, 'calendar.view'));
create policy "calendar_insert" on calendar_events for insert
  with check (has_permission(farm_id, 'calendar.manage') and created_by = auth.uid());
create policy "calendar_update" on calendar_events for update
  using (has_permission(farm_id, 'calendar.manage')) with check (has_permission(farm_id, 'calendar.manage'));
create policy "calendar_delete" on calendar_events for delete using (has_permission(farm_id, 'calendar.manage'));
create trigger audit_calendar_events after insert on calendar_events
  for each row execute function log_audit_event('Calendar Event', 'title');
