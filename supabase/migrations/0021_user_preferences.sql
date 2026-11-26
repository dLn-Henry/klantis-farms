-- ============================================================================
-- 0021: Per-user dashboard preferences (Phase 1D)
--
-- Favourite pages, which sidebar groups are collapsed, and whether "coming
-- soon" items are shown. One row per person (not per farm: it's how THEY like
-- their workspace), readable and writable only by that person.
--
-- Values are shape-checked in the database: a favourite must look like an
-- in-app dashboard path, so nothing like "javascript:..." or an external link
-- can ever be stored and later rendered as a link.
-- Run after 0020.
-- ============================================================================
create table user_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  favourites text[] not null default '{}',
  collapsed_groups text[] not null default '{}',
  show_planned boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table user_preferences enable row level security;

create policy "prefs_select_own" on user_preferences for select using (user_id = auth.uid());
create policy "prefs_insert_own" on user_preferences for insert with check (user_id = auth.uid());
create policy "prefs_update_own" on user_preferences for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke delete on user_preferences from anon, authenticated;

create or replace function guard_user_preferences()
returns trigger as $$
declare
  f text;
  g text;
begin
  if coalesce(array_length(new.favourites, 1), 0) > 12 then
    raise exception 'You can pin up to 12 favourites.';
  end if;
  foreach f in array new.favourites loop
    if f !~ '^/dashboard(/[a-z0-9-]+){0,3}$' then
      raise exception 'A favourite must be a page inside the dashboard.';
    end if;
  end loop;
  if coalesce(array_length(new.collapsed_groups, 1), 0) > 12 then
    raise exception 'Too many collapsed groups.';
  end if;
  foreach g in array new.collapsed_groups loop
    if g !~ '^[A-Za-z &]{1,40}$' then
      raise exception 'Invalid group name.';
    end if;
  end loop;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql set search_path = public, pg_temp;

create trigger guard_user_preferences_trigger
  before insert or update on user_preferences
  for each row execute function guard_user_preferences();
