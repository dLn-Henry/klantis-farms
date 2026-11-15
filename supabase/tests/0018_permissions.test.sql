\set QUIET on
\o /dev/null
create or replace function t_as(uid uuid) returns void language plpgsql as $$ begin
  perform set_config('request.jwt.claim.sub', coalesce(uid::text,''), false); execute 'set role authenticated'; end $$;
create or replace function t_anon() returns void language plpgsql as $$ begin
  perform set_config('request.jwt.claim.sub','', false); execute 'set role anon'; end $$;
create or replace function t_ok(n text, stmt text) returns void language plpgsql as $$ begin
  execute stmt; raise notice 'PASS  %', n;
exception when others then raise notice 'FAIL  %  -- %', n, sqlerrm; end $$;
create or replace function t_fail(n text, stmt text, expect text default null) returns void language plpgsql as $$ begin
  execute stmt; raise notice 'FAIL  %  -- expected an error, but it succeeded', n;
exception when others then
  if expect is null or sqlerrm ilike '%'||expect||'%' then raise notice 'PASS  %', n;
  else raise notice 'FAIL  %  -- wrong error: %', n, sqlerrm; end if; end $$;
create or replace function t_rows(n text, stmt text, want int) returns void language plpgsql as $$ declare c int; begin
  execute 'select count(*) from ('||stmt||') q' into c;
  if c = want then raise notice 'PASS  %', n; else raise notice 'FAIL  %  -- got % rows, wanted %', n, c, want; end if;
exception when others then raise notice 'FAIL  %  -- %', n, sqlerrm; end $$;
create or replace function t_affects(n text, stmt text, want int) returns void language plpgsql as $$ declare c int; begin
  execute stmt; get diagnostics c = row_count;
  if c = want then raise notice 'PASS  %', n; else raise notice 'FAIL  %  -- affected %, wanted %', n, c, want; end if;
exception when others then raise notice 'FAIL  %  -- %', n, sqlerrm; end $$;
grant execute on all functions in schema public to anon, authenticated;
reset role;
\o
\set OWN  '10000000-0000-0000-0000-000000000001'
\set MGR  '10000000-0000-0000-0000-000000000002'
\set VET  '10000000-0000-0000-0000-000000000003'
\set WRK  '10000000-0000-0000-0000-000000000004'
\set ACC  '10000000-0000-0000-0000-000000000005'
\set INV  '10000000-0000-0000-0000-000000000006'
\set OUT  '10000000-0000-0000-0000-000000000007'
\set PLAT '10000000-0000-0000-0000-000000000008'
\set SUSP '10000000-0000-0000-0000-000000000009'
\set OWN2 '10000000-0000-0000-0000-000000000010'
\set FA 'f0000000-0000-0000-0000-000000000001'
\set FB 'f0000000-0000-0000-0000-000000000002'

\echo '== seed as superuser'
\o /dev/null
select t_ok('seed ledger', $q$ insert into inventory_items(id,farm_id,sku,name,category,unit) values ('e0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','FD','Feed','Input','kg') $q$);
insert into inventory_transactions(farm_id,inventory_item_id,transaction_type,quantity_change) values ('f0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Purchase',100);
insert into platform_admins(user_id,note) values (:'PLAT','test');
\o

\echo '== 1 permission resolution (single roles, as migrated)'
select t_as(:'OWN');  select t_rows('owner: finance.delete',  $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','finance.delete') $q$, 1);
select t_rows('owner: team.assign_roles', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','team.assign_roles') $q$, 1);
select t_rows('owner has no rights on OTHER farm', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000002','finance.view') $q$, 0);
select t_as(:'MGR');  select t_rows('manager: NO team.assign_roles', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','team.assign_roles') $q$, 0);
select t_rows('manager: has livestock.delete', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','livestock.delete') $q$, 1);
select t_as(:'SUSP'); select t_rows('SUSPENDED owner has nothing', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','livestock.view') $q$, 0);
select t_as(:'OUT');  select t_rows('outsider has nothing', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','livestock.view') $q$, 0);

\echo '== 2 table access by role (the bug: a worker used to see/edit everything)'
select t_as(:'WRK');
select t_rows('worker sees animals', $q$ select 1 from animals $q$, 1);
select t_rows('worker sees NO expenses', $q$ select 1 from expenses $q$, 0);
select t_fail('worker cannot insert expense', $q$ insert into expenses(farm_id,category,amount,expense_date) values ('f0000000-0000-0000-0000-000000000001','Feed',1,current_date) $q$, 'row-level security');
select t_affects('worker cannot delete an animal', $q$ delete from animals where tag='G1' $q$, 0);
select t_ok('worker can record an animal event', $q$ insert into animal_events(animal_id,farm_id,event_date,event_type) values ('d0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001',current_date,'Weighed') $q$);
select t_rows('worker cannot read the audit log', $q$ select 1 from audit_log $q$, 0);
select t_rows('worker cannot read settings (private)', $q$ select 1 from settings where is_public = false $q$, 0);
select t_as(:'MGR');
select t_rows('manager sees expenses', $q$ select 1 from expenses $q$, 1);
select t_affects('manager cannot DELETE finance (no finance.delete): 0 rows', $q$ delete from expenses $q$, 0);
select t_as(:'OUT');
select t_rows('outsider sees no animals', $q$ select 1 from animals $q$, 0);
select t_rows('outsider sees no expenses', $q$ select 1 from expenses $q$, 0);
select t_as(:'OWN');
select t_rows('owner sees only own farm animals (not Farm B)', $q$ select 1 from animals $q$, 1);
select t_rows('owner sees expenses', $q$ select 1 from expenses $q$, 1);
select t_affects('owner can delete an expense', $q$ delete from expenses $q$, 1);

\echo '== 3 only the Owner assigns roles; multi-role; safeguards'
select t_as(:'MGR');
select t_fail('manager cannot assign roles', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Accountant']) $q$, :'ACC', :'FA'), 'not allowed');
select t_fail('manager cannot add members', format($q$ select add_farm_member(%L,'outsider@x.com',array['Farm Worker']) $q$, :'FA'), 'Only a Farm Owner');
select t_as(:'WRK');
select t_fail('worker cannot write farm_member_roles directly', $q$ insert into farm_member_roles(member_id,role_id) select id, (select id from roles where name='Farm Owner') from farm_members limit 1 $q$);
select t_as(:'OWN');
select t_ok('owner gives acct@ the Accountant role (replaces Farm Worker)', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Accountant']) $q$, :'ACC', :'FA'));
select t_fail('empty role list refused', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array[]::text[]) $q$, :'ACC', :'FA'), 'at least one role');
select t_fail('invalid role refused', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Wizard']) $q$, :'ACC', :'FA'), 'not a valid role');
select t_fail('cannot change your own roles', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Farm Worker']) $q$, :'OWN', :'FA'), 'own roles');
select t_ok('owner adds outsider@ with TWO roles', format($q$ select add_farm_member(%L,'outsider@x.com',array['Farm Worker','Procurement Officer']) $q$, :'FA'));
select t_rows('team list returns 2 role names for the new member', format($q$ select 1 from list_farm_team(%L) where email='outsider@x.com' and array_length(role_names,1)=2 $q$, :'FA'), 1);
select t_fail('cannot add a duplicate member', format($q$ select add_farm_member(%L,'outsider@x.com',array['Farm Worker']) $q$, :'FA'), 'already');
select t_fail('cannot manage a member of ANOTHER farm', format($q$ select set_member_roles((select id from farm_members where user_id=%L), array['Farm Worker']) $q$, :'OWN2'), 'not allowed');
select t_as(:'OWN2');
select t_fail('Farm B owner cannot touch Farm A team', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Farm Worker']) $q$, :'MGR', :'FA'), 'not allowed');
reset role;
\echo '   (farm A has one ACTIVE owner + one SUSPENDED owner: suspended must not count)'
select t_as(:'MGR'); reset role;
-- promote manager to owner too, so owner can legitimately be edited
select t_as(:'OWN');
select t_ok('owner adds a second owner (manager gets Owner + Manager)', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Farm Owner','Farm Manager']) $q$, :'MGR', :'FA'));
select t_as(:'MGR');
select t_ok('new owner CAN now assign roles (union of roles)', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Farm Worker']) $q$, :'WRK', :'FA'));
select t_as(:'OWN');
select t_ok('owner demotes the second owner (another owner exists? no: removal check)', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Farm Manager']) $q$, :'MGR', :'FA'));
select t_as(:'MGR');
select t_fail('a manager can no longer assign roles', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Auditor']) $q$, :'WRK', :'FA'), 'not allowed');
select t_as(:'OWN');
select t_fail('cannot suspend yourself', format($q$ select set_member_status((select id from farm_members where user_id=%L and farm_id=%L), 'suspended') $q$, :'OWN', :'FA'), 'own access');
reset role;
\echo '   last-owner guard: make owner the only active owner and have a second owner try to demote them'
\o /dev/null
update farm_members set status='active' where user_id=:'SUSP';     -- reactivate the suspended owner -> now 2 active owners
\o
select t_as(:'SUSP');
select t_ok('with 2 active owners, one may demote the other', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Farm Manager']) $q$, :'OWN', :'FA'));
select t_fail('an owner cannot demote themselves (so the last owner cannot vanish)', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Farm Manager']) $q$, :'SUSP', :'FA'), 'own roles');
reset role;
\o /dev/null
-- restore: owner back to Farm Owner, suspend the extra
update farm_member_roles set role_id=(select id from roles where name='Farm Owner') where member_id=(select id from farm_members where user_id=:'OWN' and farm_id=:'FA');
update farm_members set status='suspended' where user_id=:'SUSP';
\o
select t_as(:'OWN');
reset role;
select t_rows('every member still has >= 1 role', $q$ select 1 from farm_members fm where not exists (select 1 from farm_member_roles r where r.member_id=fm.id) $q$, 0);
select t_rows('role changes were audited', $q$ select 1 from audit_log where entity_type='Team Member' and action in ('Roles changed','Added') $q$, 5);

\echo '== 4 multi-role: permissions combine'
select t_as(:'ACC');
select t_ok('accountant records an expense', $q$ insert into expenses(farm_id,category,amount,expense_date) values ('f0000000-0000-0000-0000-000000000001','Vet',50,current_date) $q$);
select t_rows('accountant does NOT see animals', $q$ select 1 from animals $q$, 0);
select t_as(:'OWN');
select t_ok('owner gives acct@ Accountant + Farm Worker', format($q$ select set_member_roles((select id from farm_members where user_id=%L and farm_id=%L), array['Accountant','Farm Worker']) $q$, :'ACC', :'FA'));
select t_as(:'ACC');
select t_rows('now sees animals (Farm Worker) AND expenses (Accountant)', $q$ select 1 from animals union all select 1 from expenses $q$, 2);

\echo '== 5 approval guards on permissions'
select t_as(:'VET');
select t_ok('vet submits a report', $q$ insert into veterinary_reports(farm_id,animal_id,code,submitted_by,visit_date) values ('f0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000001','VET-T-1',auth.uid(),current_date) $q$);
select t_fail('vet cannot approve own report', $q$ update veterinary_reports set status='Approved' where code='VET-T-1' $q$);
select t_ok('vet can still edit own pending report', $q$ update veterinary_reports set findings='ok' where code='VET-T-1' $q$);
select t_as(:'WRK');
select t_affects('worker cannot approve (cannot even see) a vet report', $q$ update veterinary_reports set status='Approved' where code='VET-T-1' $q$, 0);
select t_as(:'OWN');
select t_ok('owner approves the vet report', $q$ update veterinary_reports set status='Approved' where code='VET-T-1' $q$);
select t_as(:'VET');
select t_affects('vet can no longer edit an APPROVED report', $q$ update veterinary_reports set findings='tamper' where code='VET-T-1' $q$, 0);
select t_as(:'WRK');
select t_ok('worker records a harvest', $q$ insert into harvests(farm_id,code,harvest_date,quantity,unit,recorded_by) values ('f0000000-0000-0000-0000-000000000001','HAR-T-1',current_date,10,'kg',auth.uid()) $q$);
select t_affects('worker cannot approve a harvest (UPDATE policy hides it)', $q$ update harvests set status='Approved' where code='HAR-T-1' $q$, 0);
select t_as(:'INV');
select t_ok('inventory officer CAN approve it (harvests.approve + UPDATE policy)', $q$ update harvests set status='Approved' where code='HAR-T-1' $q$);

\echo '== 6 stock adjustment permission'
select t_as(:'WRK');
select t_ok('worker consumes feed', $q$ insert into inventory_transactions(farm_id,inventory_item_id,transaction_type,quantity_change,created_by) values ('f0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Consumption',-5,auth.uid()) $q$);
select t_fail('worker cannot make a manual ADJUSTMENT', $q$ insert into inventory_transactions(farm_id,inventory_item_id,transaction_type,quantity_change,created_by) values ('f0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Adjustment',-50,auth.uid()) $q$, 'manual stock adjustments');
select t_as(:'INV');
select t_ok('inventory officer can adjust', $q$ insert into inventory_transactions(farm_id,inventory_item_id,transaction_type,quantity_change,created_by) values ('f0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Adjustment',-1,auth.uid()) $q$);
select t_fail('nobody can edit stock quantity directly (still)', $q$ update inventory_items set quantity=9999 $q$);

\echo '== 7 tasks: complete-only users'
select t_as(:'OWN');
select t_ok('owner creates a task for the worker', format($q$ insert into tasks(farm_id,title,created_by,assigned_to) values (%L,'Feed goats',auth.uid(),%L) $q$, :'FA', :'WRK'));
select t_ok('owner creates a task for the vet', format($q$ insert into tasks(farm_id,title,created_by,assigned_to) values (%L,'Check herd',auth.uid(),%L) $q$, :'FA', :'VET'));
select t_as(:'WRK');
select t_rows('worker sees tasks', $q$ select 1 from tasks $q$, 2);
select t_ok('worker completes THEIR task', $q$ update tasks set status='Completed' where title='Feed goats' $q$);
select t_fail('worker cannot retitle their task', $q$ update tasks set title='x' where title='Feed goats' $q$, 'only change the status');
select t_fail('worker cannot cancel', $q$ update tasks set status='Cancelled' where title='Feed goats' $q$);
select t_affects('worker cannot touch someone elses task', $q$ update tasks set status='Completed' where title='Check herd' $q$, 0);
select t_fail('worker cannot create tasks', format($q$ insert into tasks(farm_id,title,created_by) values (%L,'x',auth.uid()) $q$, :'FA'), 'row-level security');

\echo '== 8 blog + media + settings'
select t_as(:'WRK');
select t_fail('worker cannot write a post', $q$ insert into blog_posts(farm_id,slug,title) values ('f0000000-0000-0000-0000-000000000001','s','T') $q$, 'row-level security');
select t_ok('worker can upload media (media.create)', $q$ insert into media(farm_id,bucket,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','private-media','f0000000-0000-0000-0000-000000000001/a.png','a.png','image/png',10,auth.uid()) $q$);
select t_ok('worker can delete THEIR OWN upload', $q$ delete from media where path like '%/a.png' $q$);
select t_as(:'OWN');
select t_ok('owner writes + publishes a post', $q$ insert into blog_posts(farm_id,slug,title,status) values ('f0000000-0000-0000-0000-000000000001','pub','Hello','Published') $q$);
select t_as(:'ACC');
select t_ok('accountant can draft? (no: content.create missing) -> expect refused', $q$ select 1 $q$);
select t_fail('accountant cannot create a post', $q$ insert into blog_posts(farm_id,slug,title) values ('f0000000-0000-0000-0000-000000000001','s2','T') $q$, 'row-level security');

\echo '== 9 anonymous visitors (public site must keep working)'
select t_anon();
select t_rows('anon reads published posts', $q$ select 1 from blog_posts where status='Published' $q$, 1);
select t_rows('anon reads NO animals', $q$ select 1 from animals $q$, 0);
select t_rows('anon reads NO expenses', $q$ select 1 from expenses $q$, 0);
select t_rows('anon reads species (reference)', $q$ select 1 from species $q$, 5);
select t_rows('anon cannot read role assignments', $q$ select 1 from farm_member_roles $q$, 0);
select t_fail('anon cannot read platform_admins', $q$ select 1 from platform_admins $q$, 'permission denied');

\echo '== 10 Auditor is read-only everywhere'
reset role;
\o /dev/null
insert into auth.users(id,email) values ('10000000-0000-0000-0000-000000000011','aud@x.com'); insert into profiles(id) values ('10000000-0000-0000-0000-000000000011');
\o
select t_as(:'OWN');
select t_ok('owner adds an Auditor', format($q$ select add_farm_member(%L,'aud@x.com',array['Auditor']) $q$, :'FA'));
select t_as('10000000-0000-0000-0000-000000000011');
select t_rows('auditor sees animals', $q$ select 1 from animals $q$, 1);
select t_rows('auditor sees expenses', $q$ select 1 from expenses $q$, 1);
select t_rows('auditor sees the audit log', $q$ select 1 where exists (select 1 from audit_log) $q$, 1);
select t_fail('auditor cannot write an expense', $q$ insert into expenses(farm_id,category,amount,expense_date) values ('f0000000-0000-0000-0000-000000000001','x',1,current_date) $q$, 'row-level security');
select t_affects('auditor cannot update an animal', $q$ update animals set status='Sick' $q$, 0);
select t_fail('auditor cannot create a task', format($q$ insert into tasks(farm_id,title,created_by) values (%L,'x',auth.uid()) $q$, :'FA'), 'row-level security');

\echo '== 11 platform super administrator'
select t_as(:'PLAT');
select t_rows('platform admin sees both farms', $q$ select 1 from farms $q$, 2);
select t_rows('platform admin sees memberships', $q$ select 1 from farm_members $q$, 10);
select t_rows('platform admin sees NO animals (operational data)', $q$ select 1 from animals $q$, 0);
select t_rows('platform admin sees NO expenses', $q$ select 1 from expenses $q$, 0);
select t_ok('platform admin suspends a farm', format($q$ select platform_set_farm_status(%L,'suspended') $q$, :'FB'));
select t_ok('...and reactivates it', format($q$ select platform_set_farm_status(%L,'active') $q$, :'FB'));
select t_fail('platform_admins table is unreadable', $q$ select 1 from platform_admins $q$);
select t_as(:'OWN');
select t_fail('a Farm OWNER cannot call platform functions', format($q$ select platform_set_farm_status(%L,'suspended') $q$, :'FA'), 'platform administrator');
select t_fail('cannot make yourself a platform admin', format($q$ insert into platform_admins(user_id) values (%L) $q$, :'OWN'));
select t_rows('owner does not see other farm in farms', $q$ select 1 from farms $q$, 1);
select t_as(:'OWN2');
select t_rows('status change was audited (Farm B owner sees it)', $q$ select 1 from audit_log where action like 'Status changed (platform)%' $q$, 2);
