-- ============================================================================
-- 0006_content_and_system.sql
-- Blog, audit log, and site settings. Settings is the real backing store
-- for what components/dashboard/SettingsForm.tsx edits and every public
-- page (via lib/site-config.ts) will eventually read from.
-- ============================================================================

create table blog_posts (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references farms(id) on delete cascade,
  slug text not null,
  title text not null,
  category text,
  excerpt text,
  body text, -- markdown; paragraphs split client-side same as current mock shape
  author_id uuid references profiles(id),
  reading_time text,
  status text not null default 'Draft' check (status in ('Published', 'Draft', 'Scheduled')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, slug)
);

-- ----------------------------------------------------------------------------
-- AUDIT LOG
-- Populated by triggers on key tables (see comment at bottom), not written
-- to directly by application code — this keeps the log trustworthy.
-- ----------------------------------------------------------------------------
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references farms(id) on delete cascade,
  user_id uuid references profiles(id),
  action text not null,       -- e.g. 'Approved', 'Rejected', 'Created', 'Updated'
  entity_type text not null,  -- e.g. 'Veterinary Report', 'Order', 'Inventory'
  entity_label text not null, -- human-readable reference, e.g. 'VT-0041'
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- SETTINGS
-- Key-value per farm, matching the shape of SITE_CONTENT in lib/site-config.ts.
-- ----------------------------------------------------------------------------
create table settings (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  key text not null,
  value text,
  updated_at timestamptz not null default now(),
  unique (farm_id, key)
);

alter table blog_posts enable row level security;
alter table audit_log enable row level security;
alter table settings enable row level security;

create policy "Anyone can view published posts" on blog_posts for select using (status = 'Published');
create policy "Farm members can view all their posts" on blog_posts for select using (is_farm_member(farm_id));
create policy "Farm members can manage their posts" on blog_posts for all using (is_farm_member(farm_id));

create policy "Farm members can view their audit log" on audit_log for select using (is_farm_member(farm_id));
-- No insert/update/delete policy on audit_log for regular users — it should
-- only ever be written by SECURITY DEFINER trigger functions (see below),
-- never directly by application code.

create policy "Anyone can view farm settings" on settings for select using (true);
create policy "Farm members can manage their settings" on settings for all using (is_farm_member(farm_id));

-- ----------------------------------------------------------------------------
-- EXAMPLE AUDIT TRIGGER — veterinary report approvals.
-- The same pattern (a SECURITY DEFINER trigger function that inserts into
-- audit_log) should be replicated for other approval/status-change actions
-- as they're wired up: order status changes, inventory adjustments, etc.
-- ----------------------------------------------------------------------------
create function log_vet_report_review()
returns trigger as $$
begin
  if new.status is distinct from old.status and new.status in ('Approved', 'Rejected', 'Changes Requested') then
    insert into audit_log (farm_id, user_id, action, entity_type, entity_label, old_values, new_values)
    values (
      new.farm_id,
      auth.uid(),
      new.status,
      'Veterinary Report',
      new.code,
      jsonb_build_object('status', old.status),
      jsonb_build_object('status', new.status)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_vet_report_status_change
  after update on veterinary_reports
  for each row execute procedure log_vet_report_review();
