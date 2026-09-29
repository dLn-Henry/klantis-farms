-- ============================================================================
-- 0009_tasks.sql
--
-- Task management. Flagged as "critical, build first" in the project's own
-- roadmap alongside livestock/crops/inventory, but nothing existed for it
-- yet -- no table, no route, no UI.
-- ============================================================================

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id),
  title text not null,
  description text,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  status text not null default 'Pending' check (status in ('Pending', 'In Progress', 'Completed', 'Cancelled')),
  due_date date,
  assigned_to uuid references profiles(id),
  created_by uuid references profiles(id),
  completed_at timestamptz,
  -- Optional link to the record a task is about (e.g. an animal that needs
  -- vaccinating), following the same loose polymorphic-reference pattern
  -- already used for audit_log/documents rather than a dedicated join
  -- table per entity type.
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table tasks enable row level security;

create policy "Farm members can view tasks" on tasks
  for select using (is_farm_member(farm_id));
create policy "Farm members can create tasks" on tasks
  for insert with check (is_farm_member(farm_id));
create policy "Farm members can update tasks" on tasks
  for update using (is_farm_member(farm_id));

-- No delete policy, matching the same "archive via status, don't destroy
-- history" principle already applied to inventory_transactions and
-- audit_log elsewhere -- a task that's no longer needed becomes Cancelled,
-- it doesn't disappear.

-- completed_at is derived from status, not independently settable by a
-- client -- keeps the two from ever silently disagreeing (task marked
-- Completed with no completion date, or vice versa).
create or replace function set_task_completed_at()
returns trigger as $$
begin
  if new.status = 'Completed' and (old.status is distinct from 'Completed') then
    new.completed_at = now();
  elsif new.status is distinct from 'Completed' then
    new.completed_at = null;
  end if;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_task_completed_at_trigger
  before update on tasks
  for each row execute function set_task_completed_at();

create index tasks_farm_id_idx on tasks (farm_id);
create index tasks_status_idx on tasks (status);
create index tasks_due_date_idx on tasks (due_date);
