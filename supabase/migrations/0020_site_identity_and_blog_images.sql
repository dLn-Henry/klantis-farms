-- ============================================================================
-- 0020: Site identity settings + blog featured images (Phase 1C)
--
--  * `settings` already holds key/value rows (public ones feed the public site).
--    Add a guard so ONLY a fixed list of site/contact/social keys can ever be
--    public (nothing sensitive can be published by mistake), social links must
--    be https, the email must look like one, and the logo/favicon/share-image
--    must be a picture from THIS farm's media library.
--  * blog_posts gets a featured image (path in the public site-media bucket) +
--    required alt text, validated against the media library the same way.
--  * An image that is in use (logo, favicon, share image, a post's featured
--    image) can't be deleted from the media library.
--
-- Who may edit: settings.edit (Owner, Manager); blog: content.edit (0018).
-- Run after 0019.
-- ============================================================================

-- 1. Settings guard ----------------------------------------------------------
create or replace function guard_settings()
returns trigger as $$
declare
  public_keys constant text[] := array[
    'site.name', 'site.tagline', 'site.announcement', 'site.delivery_note', 'site.footer_blurb',
    'site.seo_description', 'site.logo', 'site.favicon', 'site.og_image',
    'contact.phone', 'contact.email', 'contact.address', 'contact.hours',
    'social.facebook', 'social.instagram', 'social.twitter'
  ];
  image_keys constant text[] := array['site.logo', 'site.favicon', 'site.og_image'];
  v text := coalesce(new.value, '');
begin
  if new.is_public and not (new.key = any (public_keys)) then
    raise exception 'That setting can''t be made public.';
  end if;
  if char_length(v) > 600 then
    raise exception 'That value is too long (600 characters at most).';
  end if;
  if new.key like 'social.%' and v <> '' and v !~* '^https://[^\s<>"'']+$' then
    raise exception 'Social links must start with https://';
  end if;
  if new.key = 'contact.email' and v <> '' and v !~* '^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$' then
    raise exception 'That email address doesn''t look right.';
  end if;
  if new.key = any (image_keys) and v <> '' then
    if not exists (select 1 from media m
                   where m.farm_id = new.farm_id and m.bucket = 'site-media' and m.path = v
                     and m.mime_type like 'image/%') then
      raise exception 'Choose an image from your media library.';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists guard_settings_trigger on settings;
create trigger guard_settings_trigger
  before insert or update on settings
  for each row execute function guard_settings();

-- 2. Blog featured image -------------------------------------------------------
alter table blog_posts
  add column featured_image_path text,
  add column featured_image_alt text,
  add constraint blog_featured_alt_len check (char_length(featured_image_alt) <= 300),
  add constraint blog_featured_needs_alt
    check (featured_image_path is null or char_length(trim(coalesce(featured_image_alt, ''))) > 0);

create or replace function guard_blog_featured_image()
returns trigger as $$
begin
  if new.featured_image_path is not null
     and (tg_op = 'INSERT' or new.featured_image_path is distinct from old.featured_image_path) then
    if not exists (select 1 from media m
                   where m.farm_id = new.farm_id and m.bucket = 'site-media'
                     and m.path = new.featured_image_path and m.mime_type like 'image/%') then
      raise exception 'Choose a featured image from your media library.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger guard_blog_featured_image_trigger
  before insert or update on blog_posts
  for each row execute function guard_blog_featured_image();

-- 3. Don't delete an image that is in use ------------------------------------
create or replace function guard_media_in_use()
returns trigger as $$
begin
  -- When a whole farm is being deleted its media goes with it; let that through.
  if not exists (select 1 from farms where id = old.farm_id) then
    return old;
  end if;
  if exists (select 1 from settings s
             where s.farm_id = old.farm_id and s.value = old.path
               and s.key in ('site.logo', 'site.favicon', 'site.og_image')) then
    raise exception 'This image is used by your site settings (logo, favicon or share image). Choose another one first.';
  end if;
  if exists (select 1 from blog_posts b where b.farm_id = old.farm_id and b.featured_image_path = old.path) then
    raise exception 'This image is the featured image of a blog post. Change that post first.';
  end if;
  return old;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger guard_media_in_use_trigger
  before delete on media
  for each row execute function guard_media_in_use();
