-- ============================================================================
-- 0016_blog_hardening.sql
-- Before this: any farm member could publish to the public website, edit or
-- delete live posts; "Scheduled" never went live (no job); no size limits.
--
-- Now:
--  * Public read = Published, or Scheduled whose time has passed (computed at
--    query time, no cron needed).
--  * No DELETE for anyone (archive-not-delete principle).
--  * Anyone on the farm may write Drafts. Anything that is, was, or is becoming
--    Published/Scheduled needs Farm Owner or Farm Manager.
--  * author_name is a trigger-made snapshot so anonymous visitors never need
--    to read profiles. It NEVER falls back to an email address (handle_new_user
--    in 0001 defaults display_name to the email).
-- ============================================================================

alter table blog_posts add column if not exists author_name text;

-- ---------------------------------------------------------------------------
-- Public-safe author name. Never returns anything containing '@'.
-- ---------------------------------------------------------------------------
create or replace function safe_author_name(p_user uuid)
returns text as $$
  select coalesce(
    nullif(trim(concat_ws(' ', pr.first_name, pr.last_name)), ''),
    case when pr.display_name is not null and position('@' in pr.display_name) = 0
         then nullif(trim(pr.display_name), '') end,
    'Farm team'
  )
  from (select 1) d
  left join profiles pr on pr.id = p_user;
$$ language sql stable security definer set search_path = public, pg_temp;

revoke execute on function safe_author_name(uuid) from public, anon;
grant execute on function safe_author_name(uuid) to authenticated, service_role;

-- Repair rows that might already hold an email-shaped name.
update blog_posts set author_name = safe_author_name(author_id)
 where author_name is null or position('@' in author_name) > 0;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------
drop policy if exists "Anyone can view published posts" on blog_posts;
drop policy if exists "Anyone can view live posts" on blog_posts;
create policy "Anyone can view live posts" on blog_posts for select using (
  status = 'Published' or (status = 'Scheduled' and published_at <= now())
);

drop policy if exists "Farm members can manage their posts" on blog_posts;
drop policy if exists "Farm members can create posts" on blog_posts;
drop policy if exists "Farm members can update posts" on blog_posts;
create policy "Farm members can create posts" on blog_posts for insert
  with check (is_farm_member(farm_id));
create policy "Farm members can update posts" on blog_posts for update
  using (is_farm_member(farm_id)) with check (is_farm_member(farm_id));
-- No DELETE policy, and the privilege is revoked as defense in depth.
revoke delete on blog_posts from authenticated, anon;

-- ---------------------------------------------------------------------------
-- Guard trigger
-- ---------------------------------------------------------------------------
create or replace function guard_blog_post()
returns trigger as $$
declare
  v_live_involved boolean;
begin
  if TG_OP = 'UPDATE' then
    new.updated_at := now();
  end if;

  -- service_role / migrations: no auth.uid(), skip user-level rules.
  if auth.uid() is null then
    if new.author_name is null then new.author_name := safe_author_name(new.author_id); end if;
    return new;
  end if;

  if TG_OP = 'INSERT' then
    if new.farm_id is null then
      raise exception 'A post must belong to a farm.';
    end if;
    if new.author_id is null then new.author_id := auth.uid(); end if;
    if new.author_id <> auth.uid() then
      raise exception 'You cannot create a post in someone else''s name.';
    end if;
    new.author_name := safe_author_name(new.author_id);
    v_live_involved := new.status in ('Published', 'Scheduled');
  else
    if new.farm_id is distinct from old.farm_id then
      raise exception 'A post cannot be moved to another farm.';
    end if;
    if new.author_id is distinct from old.author_id then
      raise exception 'The author of a post cannot be changed.';
    end if;
    new.author_name := old.author_name;
    v_live_involved := old.status in ('Published', 'Scheduled')
                    or new.status in ('Published', 'Scheduled');
  end if;

  if v_live_involved and not has_farm_role(new.farm_id, array['Farm Owner', 'Farm Manager']) then
    raise exception 'Only a Farm Owner or Farm Manager can publish, schedule, edit or unpublish a live post. You can save it as a draft.';
  end if;

  if new.status = 'Scheduled' and new.published_at is null then
    raise exception 'A scheduled post needs a publish date and time.';
  end if;
  if new.status = 'Published' and
     (TG_OP = 'INSERT' or old.status <> 'Published' or new.published_at is null) then
    -- A Scheduled post whose time already passed was already live to the public;
    -- promoting it to Published keeps its original date instead of resetting it.
    if TG_OP = 'UPDATE' and old.status = 'Scheduled' and old.published_at <= now() then
      new.published_at := old.published_at;
    else
      new.published_at := now();
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists guard_blog_post on blog_posts;
create trigger guard_blog_post before insert or update on blog_posts
  for each row execute function guard_blog_post();

-- ---------------------------------------------------------------------------
-- Size / shape limits (NOT VALID: apply to new writes without failing on
-- pre-existing rows).
-- ---------------------------------------------------------------------------
alter table blog_posts drop constraint if exists blog_slug_format;
alter table blog_posts add constraint blog_slug_format
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80 and slug <> 'new') not valid;
alter table blog_posts drop constraint if exists blog_text_limits;
alter table blog_posts add constraint blog_text_limits check (
  char_length(title) between 1 and 200
  and (excerpt is null or char_length(excerpt) <= 500)
  and (body is null or char_length(body) <= 50000)
  and (category is null or char_length(category) <= 60)
) not valid;

-- ---------------------------------------------------------------------------
-- Audit
-- ---------------------------------------------------------------------------
drop trigger if exists audit_blog_posts on blog_posts;
create trigger audit_blog_posts after insert or update on blog_posts
  for each row execute function log_audit_event('Blog Post', 'title');
