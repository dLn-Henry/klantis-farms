-- ============================================================================
-- 0015_team_management.sql
--
-- Part 1 -- fix a hole in 0010. next_farm_code() is SECURITY DEFINER and had
-- no membership check, and only granted EXECUTE to `authenticated` without
-- revoking the default PUBLIC grant. Verified against a live database that
-- a worker on Farm A, and an anonymous visitor who isn't logged in at all,
-- could both call it for Farm B: burning Farm B's document numbering and
-- inserting unlimited junk prefix rows into farm_code_counters.
--
-- Part 2 -- team management. farm_members is the most privilege-sensitive
-- table in the system and has (correctly) no client write policies. Rather
-- than open it up with table policies, which would let a client craft
-- arbitrary UPDATEs (swapping farm_id, user_id, role_id), every change goes
-- through one of three functions below, so the rules live in one place:
--   * only a Farm Owner can add, re-role, or suspend members
--   * nobody can change their own role or status
--   * a farm must always keep at least one active Farm Owner
--   * every change is written to the audit log
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Part 1: next_farm_code
-- ---------------------------------------------------------------------------
create or replace function next_farm_code(p_farm_id uuid, p_prefix text)
returns text as $$
declare
  v_number integer;
begin
  -- Fixed allow-list of prefixes, so nobody can mint arbitrary counter rows.
  -- Add a new prefix here when a new farm-scoped code column is introduced.
  if p_prefix is null or p_prefix <> all (array['VET','HAR','CC','SUP','EQP','FLD']) then
    raise exception 'Unknown code prefix.';
  end if;

  -- Real callers can only draw numbers for a farm they belong to.
  -- auth.uid() is null for service_role and migrations (trusted paths);
  -- anonymous callers are stopped by the revoke below, not by this check.
  if auth.uid() is not null and not is_farm_member(p_farm_id) then
    raise exception 'You are not a member of that farm.';
  end if;

  insert into farm_code_counters (farm_id, code_prefix, next_number)
  values (p_farm_id, p_prefix, 1)
  on conflict (farm_id, code_prefix)
  do update set next_number = farm_code_counters.next_number + 1
  returning next_number into v_number;

  return p_prefix || '-' || to_char(now(), 'YYYY') || '-' || lpad(v_number::text, 4, '0');
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

revoke execute on function next_farm_code(uuid, text) from public, anon;
grant execute on function next_farm_code(uuid, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Part 2: reading the team
-- profiles has no email (it lives in auth.users, unreadable by clients), and
-- only shows *active* co-members, so a team list that includes suspended
-- people and emails needs a purpose-built function. Emails are only returned
-- to owners and managers.
-- ---------------------------------------------------------------------------
create or replace function list_farm_team(p_farm_id uuid)
returns table (
  member_id uuid, user_id uuid, display_name text, email text,
  role_name text, status text, joined_at timestamptz
) as $$
  select
    fm.id,
    fm.user_id,
    coalesce(nullif(p.display_name, ''), nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''), 'Unnamed'),
    case when has_farm_role(p_farm_id, array['Farm Owner', 'Farm Manager']) then u.email::text else null end,
    r.name,
    fm.status,
    fm.joined_at
  from farm_members fm
  join roles r on r.id = fm.role_id
  join profiles p on p.id = fm.user_id
  join auth.users u on u.id = fm.user_id
  where fm.farm_id = p_farm_id
    and is_farm_member(p_farm_id)
  order by fm.joined_at;
$$ language sql stable security definer set search_path = public, pg_temp;

revoke execute on function list_farm_team(uuid) from public, anon;
grant execute on function list_farm_team(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Shared helper: at least one active Farm Owner must remain after a change.
-- ---------------------------------------------------------------------------
create or replace function farm_has_other_active_owner(p_farm_id uuid, p_excluding_member uuid)
returns boolean as $$
  select exists (
    select 1 from farm_members fm
    join roles r on r.id = fm.role_id
    where fm.farm_id = p_farm_id
      and fm.id <> p_excluding_member
      and fm.status = 'active'
      and r.name = 'Farm Owner'
  );
$$ language sql stable security definer set search_path = public, pg_temp;

revoke execute on function farm_has_other_active_owner(uuid, uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Adding a person. They must already have an account (sign up first); this
-- deliberately does not send email or create accounts, which would need the
-- service-role key in application code -- a much bigger decision than this.
-- ---------------------------------------------------------------------------
create or replace function add_farm_member(p_farm_id uuid, p_email text, p_role_name text)
returns void as $$
declare
  v_user uuid;
  v_role uuid;
  v_label text;
begin
  if not has_farm_role(p_farm_id, array['Farm Owner']) then
    raise exception 'Only a Farm Owner can add team members.';
  end if;

  select id into v_role from roles where name = p_role_name;
  if v_role is null then
    raise exception 'That is not a valid role.';
  end if;

  select id into v_user from auth.users where lower(email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'No account found for that email. Ask them to create an account first, then add them here.';
  end if;

  if exists (select 1 from farm_members where farm_id = p_farm_id and user_id = v_user) then
    raise exception 'That person is already on this farm''s team.';
  end if;

  insert into farm_members (farm_id, user_id, role_id, status)
  values (p_farm_id, v_user, v_role, 'active');

  select coalesce(nullif(display_name, ''), 'Team member') into v_label from profiles where id = v_user;
  insert into audit_log (farm_id, user_id, action, entity_type, entity_label, new_values)
  values (p_farm_id, auth.uid(), 'Added', 'Team Member', v_label, jsonb_build_object('role', p_role_name));
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

revoke execute on function add_farm_member(uuid, text, text) from public, anon;
grant execute on function add_farm_member(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Changing a role.
-- ---------------------------------------------------------------------------
create or replace function set_member_role(p_member_id uuid, p_role_name text)
returns void as $$
declare
  m record;
  v_role uuid;
  v_old_role text;
  v_label text;
begin
  select fm.farm_id, fm.user_id, fm.status, r.name as role_name
    into m
  from farm_members fm join roles r on r.id = fm.role_id
  where fm.id = p_member_id;

  -- Same message whether the member doesn't exist or belongs to a farm the
  -- caller doesn't own, so this can't be used to probe other farms.
  if not found or not has_farm_role(m.farm_id, array['Farm Owner']) then
    raise exception 'Team member not found, or you are not allowed to change them.';
  end if;

  if m.user_id = auth.uid() then
    raise exception 'You cannot change your own role. Ask another Farm Owner.';
  end if;

  select id into v_role from roles where name = p_role_name;
  if v_role is null then
    raise exception 'That is not a valid role.';
  end if;

  v_old_role := m.role_name;
  if v_old_role = p_role_name then
    return;
  end if;

  if v_old_role = 'Farm Owner' and m.status = 'active'
     and not farm_has_other_active_owner(m.farm_id, p_member_id) then
    raise exception 'A farm must always have at least one active Farm Owner.';
  end if;

  update farm_members set role_id = v_role where id = p_member_id;

  select coalesce(nullif(display_name, ''), 'Team member') into v_label from profiles where id = m.user_id;
  insert into audit_log (farm_id, user_id, action, entity_type, entity_label, old_values, new_values)
  values (m.farm_id, auth.uid(), 'Role changed', 'Team Member', v_label,
          jsonb_build_object('role', v_old_role), jsonb_build_object('role', p_role_name));
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

revoke execute on function set_member_role(uuid, text) from public, anon;
grant execute on function set_member_role(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Suspending / reactivating. Suspension is real: is_farm_member() only
-- counts status = 'active', so a suspended person loses access to the farm.
-- ---------------------------------------------------------------------------
create or replace function set_member_status(p_member_id uuid, p_status text)
returns void as $$
declare
  m record;
  v_label text;
begin
  if p_status not in ('active', 'suspended') then
    raise exception 'Status must be active or suspended.';
  end if;

  select fm.farm_id, fm.user_id, fm.status, r.name as role_name
    into m
  from farm_members fm join roles r on r.id = fm.role_id
  where fm.id = p_member_id;

  if not found or not has_farm_role(m.farm_id, array['Farm Owner']) then
    raise exception 'Team member not found, or you are not allowed to change them.';
  end if;

  if m.user_id = auth.uid() then
    raise exception 'You cannot change your own access. Ask another Farm Owner.';
  end if;

  if m.status = p_status then
    return;
  end if;

  if p_status = 'suspended' and m.role_name = 'Farm Owner' and m.status = 'active'
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
