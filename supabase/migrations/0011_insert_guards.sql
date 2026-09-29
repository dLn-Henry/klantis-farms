-- ============================================================================
-- 0011_insert_guards.sql
--
-- Migration 0008 added approval guards as BEFORE UPDATE triggers only, so
-- the whole approval workflow could be skipped by inserting a record that
-- was already Approved. Verified against a live database before writing
-- this: any farm member could also forge the submitter/recorder on a new
-- record (attributing it to someone else, which also defeats the
-- no-self-review check), and could point a record at another farm's
-- animal or crop cycle (the foreign key only checks the row exists, not
-- that it belongs to the same farm).
--
-- These guards apply to real end-user requests only. auth.uid() is null
-- for service_role, migrations, and seed scripts, which are trusted paths
-- and are left alone.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Veterinary reports
-- ---------------------------------------------------------------------------
create or replace function guard_vet_report_insert()
returns trigger as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.status not in ('Draft', 'Submitted') then
    raise exception 'A new veterinary report must start as Draft or Submitted; it becomes Approved only through review.';
  end if;

  if new.submitted_by is distinct from auth.uid() then
    raise exception 'A veterinary report can only be submitted as yourself.';
  end if;

  if new.reviewed_by is not null or new.reviewed_at is not null then
    raise exception 'A new veterinary report cannot already have a reviewer.';
  end if;

  if new.animal_id is not null and not exists (
    select 1 from animals a where a.id = new.animal_id and a.farm_id = new.farm_id
  ) then
    raise exception 'That animal does not belong to this farm.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger guard_vet_report_insert_trigger
  before insert on veterinary_reports
  for each row execute function guard_vet_report_insert();

-- ---------------------------------------------------------------------------
-- Harvests
-- ---------------------------------------------------------------------------
create or replace function guard_harvest_insert()
returns trigger as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.status <> 'Recorded' then
    raise exception 'A new harvest must start as Recorded; it becomes Approved only through review.';
  end if;

  if new.recorded_by is distinct from auth.uid() then
    raise exception 'A harvest can only be recorded as yourself.';
  end if;

  if new.crop_cycle_id is not null and not exists (
    select 1 from crop_cycles c where c.id = new.crop_cycle_id and c.farm_id = new.farm_id
  ) then
    raise exception 'That crop cycle does not belong to this farm.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger guard_harvest_insert_trigger
  before insert on harvests
  for each row execute function guard_harvest_insert();

-- ---------------------------------------------------------------------------
-- Tasks: no forged creator, and only members of the same farm can be
-- assigned work.
-- ---------------------------------------------------------------------------
create or replace function guard_task_insert()
returns trigger as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.created_by is distinct from auth.uid() then
    raise exception 'A task can only be created as yourself.';
  end if;

  if new.status <> 'Pending' then
    raise exception 'A new task must start as Pending.';
  end if;

  if new.assigned_to is not null and not exists (
    select 1 from farm_members fm
    where fm.farm_id = new.farm_id and fm.user_id = new.assigned_to and fm.status = 'active'
  ) then
    raise exception 'Tasks can only be assigned to members of this farm.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger guard_task_insert_trigger
  before insert on tasks
  for each row execute function guard_task_insert();

-- Same-farm check on reassignment too, or the insert rule is trivially
-- sidestepped by inserting unassigned and then updating.
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

  return new;
end;
$$ language plpgsql security definer;

create trigger guard_task_update_trigger
  before update on tasks
  for each row execute function guard_task_update();
