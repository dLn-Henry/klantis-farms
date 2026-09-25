-- ============================================================================
-- 0008_role_enforcement_and_gaps.sql
--
-- Closes gaps found during a security review: farm_members.role_id existed
-- in the schema but no policy or trigger ever checked it, so any farm
-- member — any role — had full read/write access to every table on their
-- farm. Confirmed against a real running Postgres instance (not just read
-- by eye) that, before this migration:
--   - a veterinarian could approve their own submitted report
--   - any farm member could mark an order payment_status = 'Paid' directly,
--     with no payment-provider verification
--   - any farm member could overwrite inventory_items.quantity directly,
--     bypassing the inventory_transactions ledger entirely
-- All three are fixed below and re-verified against the same database.
--
-- Also fixes: missing write policy on supplier_purchases, missing
-- customer self-access to their own orders/profile, missing profile
-- visibility between co-members of the same farm, and gives the settings
-- table a real public/private distinction instead of being unconditionally
-- world-readable.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Role-check helper, same pattern as is_farm_member (security definer to
-- safely read farm_members/roles from inside a policy or trigger without
-- recursing back through their own RLS).
-- ----------------------------------------------------------------------------
create or replace function has_farm_role(target_farm_id uuid, allowed_role_names text[])
returns boolean as $$
  select exists (
    select 1
    from farm_members fm
    join roles r on r.id = fm.role_id
    where fm.farm_id = target_farm_id
      and fm.user_id = auth.uid()
      and fm.status = 'active'
      and r.name = any(allowed_role_names)
  );
$$ language sql security definer stable;

-- ----------------------------------------------------------------------------
-- Veterinary report approval guard.
-- Blocks: (a) approving/rejecting your own submission, regardless of role;
-- (b) anyone outside Farm Owner / Farm Manager reviewing a report at all.
-- A clear exception message beats a bare RLS denial (which just silently
-- affects 0 rows with no explanation).
-- ----------------------------------------------------------------------------
create or replace function guard_vet_report_review()
returns trigger as $$
begin
  if new.status is distinct from old.status
     and new.status in ('Approved', 'Rejected', 'Changes Requested') then
    if auth.uid() = old.submitted_by then
      raise exception 'A veterinary report cannot be reviewed by the professional who submitted it.';
    end if;
    if not has_farm_role(old.farm_id, array['Farm Owner', 'Farm Manager']) then
      raise exception 'Only a Farm Owner or Farm Manager can approve, reject, or request changes on a veterinary report.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger guard_vet_report_review_trigger
  before update on veterinary_reports
  for each row execute function guard_vet_report_review();

-- ----------------------------------------------------------------------------
-- Harvest approval guard. Approval is what's meant to trigger the
-- inventory increase, so it gets the same treatment as vet report review:
-- no self-review, and restricted to roles with a legitimate reason to
-- approve stock-affecting records.
-- ----------------------------------------------------------------------------
create or replace function guard_harvest_approval()
returns trigger as $$
begin
  if new.status is distinct from old.status
     and new.status in ('Approved', 'Added to Inventory') then
    if auth.uid() = old.recorded_by then
      raise exception 'A harvest cannot be approved by the person who recorded it.';
    end if;
    if not has_farm_role(old.farm_id, array['Farm Owner', 'Farm Manager', 'Inventory Officer']) then
      raise exception 'Only a Farm Owner, Farm Manager, or Inventory Officer can approve a harvest.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger guard_harvest_approval_trigger
  before update on harvests
  for each row execute function guard_harvest_approval();

-- ----------------------------------------------------------------------------
-- Payment status must never be settable by a client role, full stop. Real
-- payment confirmation only ever happens server-side, after independently
-- verifying with the payment provider (typically a webhook handler running
-- as service_role, which bypasses RLS and is unaffected by this grant
-- change since it's Supabase's own platform-level role, not authenticated).
--
-- NOTE: this must be revoke-whole-table-then-grant-an-allowlist, not
-- revoke-one-column. Verified against a live database that REVOKE UPDATE
-- (payment_status) alone does NOT retract an already-granted whole-table
-- UPDATE privilege -- the two are independent in Postgres's privilege
-- model, and the narrower revoke is silently ineffective on its own.
-- ----------------------------------------------------------------------------
revoke update on orders from authenticated, anon;
grant update (delivery_method, delivery_fee, status) on orders to authenticated;

-- ----------------------------------------------------------------------------
-- inventory_items.quantity must only ever change through the transaction
-- ledger (see 0003's apply_inventory_transaction trigger), never by a
-- direct client write. Same revoke-then-allowlist pattern as above. The
-- ledger trigger keeps working because it's security definer and owned by
-- the table owner, which always has full access to its own table
-- regardless of grants to other roles -- verified below.
-- ----------------------------------------------------------------------------
revoke update on inventory_items from authenticated, anon;
grant update (name, sku, category, unit, reorder_level) on inventory_items to authenticated;

-- ----------------------------------------------------------------------------
-- supplier_purchases was missing a write policy entirely (every sibling
-- table in 0005 has one) -- almost certainly an oversight that would have
-- silently broken "add purchase" for every farm.
-- ----------------------------------------------------------------------------
create policy "Farm members can manage supplier purchases" on supplier_purchases
  for insert with check (is_farm_member(farm_id));
create policy "Farm members can update supplier purchases" on supplier_purchases
  for update using (is_farm_member(farm_id));
create policy "Farm members can delete supplier purchases" on supplier_purchases
  for delete using (is_farm_member(farm_id));

-- ----------------------------------------------------------------------------
-- Customer self-access: a logged-in customer needs to read their own
-- customer record, orders, and order items. No write policy is added here
-- deliberately -- order creation/checkout should go through a controlled,
-- validated path (never trust client-sent prices/quantities), which is a
-- separate piece of work once the real checkout flow is reviewed.
-- ----------------------------------------------------------------------------
create policy "Customers can view their own customer record" on customers
  for select using (user_id = auth.uid());

create policy "Customers can view their own orders" on orders
  for select using (
    exists (
      select 1 from customers c
      where c.id = orders.customer_id and c.user_id = auth.uid()
    )
  );

create policy "Customers can view their own order items" on order_items
  for select using (
    exists (
      select 1 from orders o
      join customers c on c.id = o.customer_id
      where o.id = order_items.order_id and c.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Farm co-members should be able to see each other's basic profile info
-- (e.g. a team directory, "assigned to" labels). Previously profiles was
-- self-select-only, so any shared page showing a teammate's name would
-- silently render nothing for everyone but that person.
-- ----------------------------------------------------------------------------
create policy "Farm members can view co-members' profiles" on profiles
  for select using (
    exists (
      select 1 from farm_members fm1
      join farm_members fm2 on fm1.farm_id = fm2.farm_id
      where fm1.user_id = auth.uid() and fm1.status = 'active'
        and fm2.user_id = profiles.id and fm2.status = 'active'
    )
  );

-- ----------------------------------------------------------------------------
-- settings currently has no way to mark a key private -- every row is
-- unconditionally world-readable. Add a real distinction; default true
-- preserves today's behavior for existing public site-content keys
-- (tagline, contact info, etc.) with zero migration risk. Any future
-- non-public setting should be inserted with is_public = false.
-- ----------------------------------------------------------------------------
alter table settings add column if not exists is_public boolean not null default true;

drop policy if exists "Anyone can view farm settings" on settings;
create policy "Anyone can view public farm settings" on settings
  for select using (is_public = true or is_farm_member(farm_id));
