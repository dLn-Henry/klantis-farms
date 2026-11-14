-- ============================================================================
-- verify_schema.sql
--
-- Paste into the Supabase SQL Editor and run. It is READ-ONLY: it changes
-- nothing. It returns one row per PROBLEM it finds, so an EMPTY result
-- (plus the final 'OK' row) means your database matches the repo.
--
-- Generated from a database built by running migrations 0001-0016 in order.
-- When you add a migration that creates a table / function / trigger, add it
-- to the lists below (BUILD_LOG.md says so too).
-- ============================================================================
with
expected_tables(name) as (values
    ('media'),
    ('animal_events'),
    ('animals'),
    ('audit_log'),
    ('blog_posts'),
    ('breeds'),
    ('crop_activities'),
    ('crop_cycles'),
    ('crop_types'),
    ('customers'),
    ('equipment'),
    ('expenses'),
    ('farm_code_counters'),
    ('farm_members'),
    ('farms'),
    ('field_history'),
    ('fields'),
    ('harvests'),
    ('income_records'),
    ('inventory_items'),
    ('inventory_transactions'),
    ('maintenance_records'),
    ('order_items'),
    ('orders'),
    ('organizations'),
    ('product_categories'),
    ('products'),
    ('profiles'),
    ('roles'),
    ('settings'),
    ('species'),
    ('supplier_purchases'),
    ('suppliers'),
    ('tasks'),
    ('veterinary_reports')
),
expected_functions(sig) as (values
    ('guard_media_update()'),
    ('storage_path_farm(p_name text)'),
    ('add_farm_member(p_farm_id uuid, p_email text, p_role_name text)'),
    ('apply_inventory_transaction()'),
    ('farm_has_other_active_owner(p_farm_id uuid, p_excluding_member uuid)'),
    ('guard_blog_post()'),
    ('guard_harvest_approval()'),
    ('guard_harvest_insert()'),
    ('guard_inventory_transaction()'),
    ('guard_same_farm_reference()'),
    ('guard_task_insert()'),
    ('guard_task_update()'),
    ('guard_vet_report_insert()'),
    ('guard_vet_report_review()'),
    ('handle_new_user()'),
    ('has_farm_role(target_farm_id uuid, allowed_role_names text[])'),
    ('is_farm_member(target_farm_id uuid)'),
    ('list_farm_team(p_farm_id uuid)'),
    ('log_audit_event()'),
    ('log_vet_report_review()'),
    ('next_farm_code(p_farm_id uuid, p_prefix text)'),
    ('safe_author_name(p_user uuid)'),
    ('set_member_role(p_member_id uuid, p_role_name text)'),
    ('set_member_status(p_member_id uuid, p_status text)'),
    ('set_task_completed_at()')
),
expected_triggers(name) as (values
    ('media.audit_media'),
    ('media.guard_media_update_trigger'),
    ('animal_events.guard_ref_animal_events'),
    ('animals.audit_animals'),
    ('blog_posts.audit_blog_posts'),
    ('blog_posts.guard_blog_post'),
    ('crop_activities.guard_ref_crop_activities'),
    ('crop_cycles.audit_crop_cycles'),
    ('crop_cycles.guard_ref_crop_cycles'),
    ('equipment.audit_equipment'),
    ('expenses.audit_expenses'),
    ('expenses.guard_ref_expenses'),
    ('harvests.audit_harvests'),
    ('harvests.guard_harvest_approval_trigger'),
    ('harvests.guard_harvest_insert_trigger'),
    ('harvests.guard_ref_harvests'),
    ('income_records.audit_income'),
    ('inventory_transactions.audit_inventory_tx'),
    ('inventory_transactions.guard_inventory_transaction_trigger'),
    ('inventory_transactions.guard_ref_inv_transactions'),
    ('inventory_transactions.on_inventory_transaction_insert'),
    ('maintenance_records.audit_maintenance'),
    ('maintenance_records.guard_ref_maintenance'),
    ('orders.audit_orders'),
    ('orders.guard_ref_orders'),
    ('products.guard_ref_products'),
    ('supplier_purchases.guard_ref_supplier_purch'),
    ('suppliers.audit_suppliers'),
    ('tasks.audit_tasks'),
    ('tasks.guard_task_insert_trigger'),
    ('tasks.guard_task_update_trigger'),
    ('tasks.set_task_completed_at_trigger'),
    ('veterinary_reports.guard_ref_vet_reports'),
    ('veterinary_reports.guard_vet_report_insert_trigger'),
    ('veterinary_reports.guard_vet_report_review_trigger'),
    ('veterinary_reports.on_vet_report_status_change')
),
expected_columns(tbl, col) as (values
    ('settings','is_public'),
    ('blog_posts','author_name')
),
have_tables as (select tablename as name, rowsecurity from pg_tables where schemaname = 'public'),
have_functions as (
  select p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as sig
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'
),
have_triggers as (
  select c.relname || '.' || t.tgname as name
  from pg_trigger t join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and not t.tgisinternal
),
problems as (
  select 'MISSING TABLE' as kind, e.name as detail
    from expected_tables e where e.name not in (select name from have_tables)
  union all
  select 'MISSING STORAGE BUCKET', b.id
    from (values ('site-media'), ('private-media')) b(id)
    where not exists (select 1 from storage.buckets sb where sb.id = b.id)
  union all
  select 'RLS DISABLED', h.name
    from have_tables h where not h.rowsecurity
  union all
  select 'MISSING FUNCTION', e.sig
    from expected_functions e where e.sig not in (select sig from have_functions)
  union all
  select 'MISSING TRIGGER', e.name
    from expected_triggers e where e.name not in (select name from have_triggers)
  union all
  select 'MISSING COLUMN', e.tbl || '.' || e.col
    from expected_columns e
    where not exists (select 1 from information_schema.columns c
                      where c.table_schema = 'public' and c.table_name = e.tbl and c.column_name = e.col)
  union all
  -- SECURITY DEFINER functions callable by anonymous visitors. Only the two
  -- membership helpers are allowed to be (see BUILD_LOG.md).
  select 'ANON CAN EXECUTE', p.proname
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef and p.prorettype <> 'trigger'::regtype
      and has_function_privilege('anon', p.oid, 'execute')
      and p.proname not in ('is_farm_member', 'has_farm_role')
)
select kind, detail from problems
union all
select 'OK', 'No problems found -- database matches the repo.'
  where not exists (select 1 from problems)
order by 1, 2;

-- If the app still says a function is "not found in the schema cache" AFTER
-- this reports OK, the API layer is holding a stale copy. Run this once:
--
--   notify pgrst, 'reload schema';
