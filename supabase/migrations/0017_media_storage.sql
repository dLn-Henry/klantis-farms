-- ============================================================================
-- 0017: Media storage + media library (Phase 1A)
--
-- Two Storage buckets, split by who may see the file:
--   site-media     PUBLIC read. Logo, favicon, blog + product images.
--   private-media  members only (signed URLs). Veterinary photos etc.
-- Every object lives under "<farm_id>/..." and that first path segment is what
-- the access rules key on, so a farm can only ever touch its own folder.
--
-- A `media` table records each upload (alt text, size, who) so the dashboard
-- can show a library and other tables can reference a file by id.
--
-- Safety: raster images + PDF only (NO svg -- it can carry script), 5 MB cap,
-- enforced by the bucket AND re-checked in the table so a crafted request
-- can't skip it. Run after 0016.
-- ============================================================================

-- ---- buckets ---------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('site-media', 'site-media', true, 5242880,
     array['image/jpeg','image/png','image/webp','image/gif','image/x-icon','image/vnd.microsoft.icon']),
  ('private-media', 'private-media', false, 5242880,
     array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---- helper: the farm a storage path belongs to ----------------------------
-- Returns NULL (never raises) for anything that isn't "<uuid>/...", so policy
-- evaluation order can't turn a bad path into a cast error.
create or replace function storage_path_farm(p_name text)
returns uuid as $$
  select case
    when split_part(p_name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then split_part(p_name, '/', 1)::uuid
    else null
  end;
$$ language sql immutable;

-- ---- storage.objects policies ---------------------------------------------
-- (RLS is already enabled on storage.objects by Supabase.)
drop policy if exists "media_read_private" on storage.objects;
drop policy if exists "media_insert" on storage.objects;
drop policy if exists "media_update" on storage.objects;
drop policy if exists "media_delete" on storage.objects;

-- Public bucket: the CDN serves files without any policy; this just lets
-- members list/read through the API. Private bucket: members of that farm.
create policy "media_read_private" on storage.objects for select
  using (
    bucket_id in ('site-media', 'private-media')
    and storage_path_farm(name) is not null
    and is_farm_member(storage_path_farm(name))
  );

create policy "media_insert" on storage.objects for insert
  with check (
    bucket_id in ('site-media', 'private-media')
    and storage_path_farm(name) is not null
    and is_farm_member(storage_path_farm(name))
  );

create policy "media_update" on storage.objects for update
  using (
    bucket_id in ('site-media', 'private-media')
    and storage_path_farm(name) is not null
    and (owner = auth.uid()
         or has_farm_role(storage_path_farm(name), array['Farm Owner', 'Farm Manager']))
  );

-- Delete: whoever uploaded it, or an Owner/Manager.
create policy "media_delete" on storage.objects for delete
  using (
    bucket_id in ('site-media', 'private-media')
    and storage_path_farm(name) is not null
    and (owner = auth.uid()
         or has_farm_role(storage_path_farm(name), array['Farm Owner', 'Farm Manager']))
  );

-- ---- media library table ---------------------------------------------------
create table media (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  bucket text not null check (bucket in ('site-media', 'private-media')),
  path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  alt_text text check (char_length(alt_text) <= 300),
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (bucket, path),
  -- the path must sit inside this row's own farm folder
  check (split_part(path, '/', 1) = farm_id::text),
  check (mime_type = any (array[
    'image/jpeg','image/png','image/webp','image/gif',
    'image/x-icon','image/vnd.microsoft.icon','application/pdf'
  ])),
  -- the public bucket never holds PDFs; the private one never holds icons/gifs
  check (bucket <> 'site-media' or mime_type <> 'application/pdf')
);

create index media_farm_created_idx on media (farm_id, created_at desc);

alter table media enable row level security;

create policy "Members can view their farm's media" on media for select
  using (is_farm_member(farm_id));
create policy "Members can add media to their farm" on media for insert
  with check (is_farm_member(farm_id) and uploaded_by = auth.uid());
create policy "Members can edit alt text of their farm's media" on media for update
  using (is_farm_member(farm_id)) with check (is_farm_member(farm_id));
create policy "Uploader or Owner/Manager can delete media" on media for delete
  using (uploaded_by = auth.uid()
         or has_farm_role(farm_id, array['Farm Owner', 'Farm Manager']));

-- A media row may only change its alt text -- the file facts are immutable, or
-- a row could be repointed at another farm's object.
create or replace function guard_media_update()
returns trigger as $$
begin
  if new.farm_id <> old.farm_id or new.bucket <> old.bucket or new.path <> old.path
     or new.mime_type <> old.mime_type or new.size_bytes <> old.size_bytes
     or new.uploaded_by is distinct from old.uploaded_by then
    raise exception 'Only the alt text of a media item can be changed.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger guard_media_update_trigger
  before update on media for each row execute function guard_media_update();

-- Audit uploads with the existing generic trigger (it logs inserts and
-- status changes; media has no status, so only uploads are recorded).
create trigger audit_media
  after insert on media
  for each row execute function log_audit_event('Media', 'file_name');
