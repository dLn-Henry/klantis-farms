-- ============================================================================
-- 0014_audit_coverage.sql
--
-- audit_log was only ever written by one trigger (veterinary report review,
-- 0006), whose own comment says it "should be replicated for other
-- approval/status-change actions". Since then a dozen write paths have
-- been added and none of them logged anything, so a "real" audit log page
-- would have shown almost nothing despite plenty of activity -- misleading
-- about how much is actually traceable.
--
-- One generic trigger, parameterized per table (same approach as
-- guard_same_farm_reference in 0012), instead of a bespoke one per table:
--   TG_ARGV[0] = entity type shown in the log   (e.g. 'Harvest')
--   TG_ARGV[1] = column holding a readable label (e.g. 'code')
--
-- Deliberately logs minimal facts only: what happened, to what, by whom,
-- and the status transition. NOT a snapshot of the whole row -- expenses,
-- orders and customers carry money and personal details, and copying them
-- into a log would make the log a side door around any per-table
-- restriction.
-- ============================================================================

create or replace function log_audit_event()
returns trigger as $$
declare
  v_new jsonb := to_jsonb(new);
  v_old jsonb := case when TG_OP = 'UPDATE' then to_jsonb(old) else null end;
  v_action text;
begin
  if TG_OP = 'INSERT' then
    v_action := 'Created';
  elsif (v_new ->> 'status') is distinct from (v_old ->> 'status') then
    v_action := v_new ->> 'status';
  else
    -- An update that doesn't change status isn't an event worth a row;
    -- logging every edit would bury the ones that matter.
    return new;
  end if;

  insert into audit_log (farm_id, user_id, action, entity_type, entity_label, old_values, new_values)
  values (
    (v_new ->> 'farm_id')::uuid,
    auth.uid(),
    v_action,
    TG_ARGV[0],
    coalesce(v_new ->> TG_ARGV[1], ''),
    case when v_old is null then null else jsonb_build_object('status', v_old ->> 'status') end,
    case when (v_new ->> 'status') is null then null else jsonb_build_object('status', v_new ->> 'status') end
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger audit_harvests         after insert or update on harvests
  for each row execute function log_audit_event('Harvest', 'code');
create trigger audit_orders           after insert or update on orders
  for each row execute function log_audit_event('Order', 'order_number');
create trigger audit_tasks            after insert or update on tasks
  for each row execute function log_audit_event('Task', 'title');
create trigger audit_crop_cycles      after insert or update on crop_cycles
  for each row execute function log_audit_event('Crop Cycle', 'code');
create trigger audit_animals          after insert or update on animals
  for each row execute function log_audit_event('Animal', 'tag');
create trigger audit_suppliers        after insert or update on suppliers
  for each row execute function log_audit_event('Supplier', 'name');
create trigger audit_equipment        after insert or update on equipment
  for each row execute function log_audit_event('Equipment', 'name');
create trigger audit_expenses         after insert on expenses
  for each row execute function log_audit_event('Expense', 'category');
create trigger audit_income           after insert on income_records
  for each row execute function log_audit_event('Income', 'category');
create trigger audit_inventory_tx     after insert on inventory_transactions
  for each row execute function log_audit_event('Stock Movement', 'transaction_type');
create trigger audit_maintenance      after insert on maintenance_records
  for each row execute function log_audit_event('Maintenance', 'maintenance_type');

-- ----------------------------------------------------------------------------
-- Who can read the log. It was any farm member; the spec says audit history
-- is for administrators, and a Farm Worker has no business reading it.
-- ----------------------------------------------------------------------------
drop policy if exists "Farm members can view their audit log" on audit_log;
create policy "Owners and managers can view the audit log" on audit_log
  for select using (has_farm_role(farm_id, array['Farm Owner', 'Farm Manager']));
