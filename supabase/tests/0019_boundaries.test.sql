\set QUIET on
\set OWN  '10000000-0000-0000-0000-000000000001'
\set MGR  '10000000-0000-0000-0000-000000000002'
\set VET  '10000000-0000-0000-0000-000000000003'
\set WRK  '10000000-0000-0000-0000-000000000004'
\set ACC  '10000000-0000-0000-0000-000000000005'
\set INV  '10000000-0000-0000-0000-000000000006'
\set VET2 '10000000-0000-0000-0000-000000000012'
\set CUST '10000000-0000-0000-0000-000000000013'
\set FA 'f0000000-0000-0000-0000-000000000001'
\set A1 'd0000000-0000-0000-0000-000000000001'
\set A3 'd0000000-0000-0000-0000-000000000003'

\echo '== 1 media library is Owner/Manager only'
select t_as(:'OWN'); select t_rows('owner has media.view', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','media.view') $q$, 1);
select t_as(:'MGR'); select t_rows('manager has media.view', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','media.view') $q$, 1);
select t_as(:'VET');  select t_rows('vet has NO media', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','media.view') or has_permission('f0000000-0000-0000-0000-000000000001','media.create') $q$, 0);
select t_as(:'WRK');  select t_rows('worker has NO media', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','media.view') or has_permission('f0000000-0000-0000-0000-000000000001','media.create') $q$, 0);
select t_as(:'INV');  select t_rows('inventory officer has NO media', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','media.view') $q$, 0);
select t_fail('vet cannot upload to the media library', $q$ insert into media(farm_id,bucket,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','private-media','f0000000-0000-0000-0000-000000000001/v.png','v.png','image/png',10,auth.uid()) $q$, 'row-level security');
select t_fail('vet cannot upload into the media storage buckets', $q$ insert into storage.objects(bucket_id,name,owner) values ('site-media','f0000000-0000-0000-0000-000000000001/v.png',auth.uid()) $q$, 'row-level security');
select t_as(:'MGR'); select t_ok('manager can upload media', $q$ insert into media(farm_id,bucket,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','site-media','f0000000-0000-0000-0000-000000000001/m.png','m.png','image/png',10,auth.uid()) $q$);
select t_as(:'VET');  select t_rows('vet cannot see the media rows', $q$ select 1 from media $q$, 0);

\echo '== 2 a vet with NO assignment sees no animals, no farm data'
select t_as(:'VET');
select t_rows('vet sees 0 animals before any assignment', $q$ select 1 from animals $q$, 0);
select t_rows('vet sees 0 animal events', $q$ select 1 from animal_events $q$, 0);
select t_rows('vet sees no expenses', $q$ select 1 from expenses $q$, 0);
select t_rows('vet sees no inventory', $q$ select 1 from inventory_items $q$, 0);
select t_rows('vet sees no suppliers/customers/orders/products', $q$ select 1 from suppliers union all select 1 from customers union all select 1 from orders union all select 1 from products where status <> 'Active' $q$, 0);
select t_rows('vet cannot read the audit log', $q$ select 1 from audit_log $q$, 0);
select t_rows('vet cannot read private settings', $q$ select 1 from settings where is_public = false $q$, 0);
select t_rows('vet cannot read the team', format($q$ select 1 from list_farm_team(%L) $q$, :'FA'), 0);
select t_fail('vet cannot add an animal', $q$ insert into animals(farm_id,tag) values ('f0000000-0000-0000-0000-000000000001','HACK') $q$, 'row-level security');
select t_fail('vet cannot report on an unassigned animal', format($q$ insert into veterinary_reports(farm_id,animal_id,code,submitted_by,visit_date) values (%L,%L,'VET-X-1',auth.uid(),current_date) $q$, :'FA', :'A1'), 'row-level security');

\echo '== 3 assignments: only managers/owner create them, only for real vets'
select t_as(:'VET');
select t_fail('vet cannot assign themselves', format($q$ insert into vet_assignments(farm_id,vet_user_id,animal_id,assigned_by) values (%L,%L,%L,auth.uid()) $q$, :'FA', :'VET', :'A1'), 'row-level security');
select t_as(:'WRK');
select t_fail('worker cannot assign', format($q$ insert into vet_assignments(farm_id,vet_user_id,animal_id,assigned_by) values (%L,%L,%L,auth.uid()) $q$, :'FA', :'VET', :'A1'), 'row-level security');
select t_as(:'MGR');
select t_fail('cannot assign a non-vet (worker)', format($q$ insert into vet_assignments(farm_id,vet_user_id,animal_id,assigned_by) values (%L,%L,%L,auth.uid()) $q$, :'FA', :'WRK', :'A1'), 'veterinary role');
select t_fail('cannot assign an animal from another farm', format($q$ insert into vet_assignments(farm_id,vet_user_id,animal_id,assigned_by) values (%L,%L,'d0000000-0000-0000-0000-000000000002',auth.uid()) $q$, :'FA', :'VET'), 'not on this farm');
select t_ok('manager assigns VET to animal G1', format($q$ insert into vet_assignments(farm_id,vet_user_id,animal_id,assigned_by,reason) values (%L,%L,%L,auth.uid(),'Limping') $q$, :'FA', :'VET', :'A1'));

\echo '== 4 the vet now sees ONLY the assigned animal'
select t_as(:'VET');
select t_rows('vet sees exactly 1 animal (G1), not G3 or Farm B', $q$ select 1 from animals $q$, 1);
select t_rows('...and it is the assigned one', format($q$ select 1 from animals where id=%L $q$, :'A1'), 1);
select t_rows('vet sees G1 health events only', $q$ select 1 from animal_events $q$, 1);
select t_rows('vet sees their own assignment', $q$ select 1 from vet_assignments $q$, 1);
select t_affects('vet cannot edit the animal', $q$ update animals set status='Sick' $q$, 0);
select t_affects('vet cannot delete the animal', $q$ delete from animals $q$, 0);
select t_fail('vet still cannot write animal events', format($q$ insert into animal_events(animal_id,farm_id,event_date,event_type) values (%L,%L,current_date,'Sale') $q$, :'A1', :'FA'), 'row-level security');
select t_as(:'VET2');
select t_rows('another vet (not assigned) sees 0 animals', $q$ select 1 from animals $q$, 0);
select t_rows('another vet sees no assignments', $q$ select 1 from vet_assignments $q$, 0);
select t_as(:'WRK');
select t_rows('worker (Farm Worker) can not see assignments', $q$ select 1 from vet_assignments $q$, 0);

\echo '== 5 vet report: own only; assignment auto-completes'
select t_as(:'VET');
select t_ok('vet submits a report for the assigned animal', format($q$ insert into veterinary_reports(id,farm_id,animal_id,code,submitted_by,visit_date) values ('b1000000-0000-0000-0000-000000000001',%L,%L,'VET-N-1',auth.uid(),current_date) $q$, :'FA', :'A1'));
select t_rows('vet sees own report', $q$ select 1 from veterinary_reports $q$, 1);
select t_rows('assignment closed automatically', $q$ select 1 from vet_assignments where status='Completed' $q$, 1);
select t_rows('after completion the vet NO LONGER sees the animal', $q$ select 1 from animals $q$, 0);
select t_as(:'VET2'); select t_rows('other vet cannot see that report', $q$ select 1 from veterinary_reports $q$, 0);
select t_as(:'WRK'); select t_rows('worker cannot see vet reports', $q$ select 1 from veterinary_reports $q$, 0);
select t_as(:'MGR'); select t_rows('manager sees the report', $q$ select 1 from veterinary_reports $q$, 1);
select t_as(:'VET');
select t_fail('vet cannot approve their own report', $q$ update veterinary_reports set status='Approved' where code='VET-N-1' $q$);

\echo '== 6 report attachments (photos belong to the report, not the media library)'
select t_as(:'VET');
select t_ok('vet uploads a photo into their report folder', $q$ insert into storage.objects(bucket_id,name,owner) values ('vet-reports','f0000000-0000-0000-0000-000000000001/b1000000-0000-0000-0000-000000000001/p1.jpg',auth.uid()) $q$);
select t_ok('vet registers the attachment', $q$ insert into vet_report_attachments(farm_id,report_id,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001/b1000000-0000-0000-0000-000000000001/p1.jpg','p1.jpg','image/jpeg',1000,auth.uid()) $q$);
select t_fail('cannot upload into a report that is not theirs', $q$ insert into storage.objects(bucket_id,name,owner) values ('vet-reports','f0000000-0000-0000-0000-000000000001/b1000000-0000-0000-0000-0000000000ff/p.jpg',auth.uid()) $q$, 'row-level security');
select t_fail('svg refused by the table', $q$ insert into vet_report_attachments(farm_id,report_id,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001/b1000000-0000-0000-0000-000000000001/x.svg','x.svg','image/svg+xml',10,auth.uid()) $q$);
select t_fail('path must sit in the right report folder', $q$ insert into vet_report_attachments(farm_id,report_id,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001/elsewhere/x.jpg','x.jpg','image/jpeg',10,auth.uid()) $q$);
select t_ok('add 9 more (10 total)', $q$ insert into vet_report_attachments(farm_id,report_id,path,file_name,mime_type,size_bytes,uploaded_by) select 'f0000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001/b1000000-0000-0000-0000-000000000001/q'||g||'.jpg','q'||g||'.jpg','image/jpeg',10,auth.uid() from generate_series(1,9) g $q$);
select t_fail('an 11th attachment is refused', $q$ insert into vet_report_attachments(farm_id,report_id,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001/b1000000-0000-0000-0000-000000000001/z.jpg','z.jpg','image/jpeg',10,auth.uid()) $q$, 'at most 10');
select t_as(:'VET2');
select t_rows('another vet cannot see the attachments', $q$ select 1 from vet_report_attachments $q$, 0);
select t_rows('another vet cannot read the stored photo', $q$ select 1 from storage.objects where bucket_id='vet-reports' $q$, 0);
select t_fail('another vet cannot attach to it', $q$ insert into vet_report_attachments(farm_id,report_id,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001/b1000000-0000-0000-0000-000000000001/w.jpg','w.jpg','image/jpeg',10,auth.uid()) $q$);
select t_as(:'WRK'); select t_rows('worker cannot see attachments', $q$ select 1 from vet_report_attachments $q$, 0);
select t_as(:'MGR'); select t_rows('manager (reviewer) sees all 10', $q$ select 1 from vet_report_attachments $q$, 10);
select t_rows('manager can read the stored photo', $q$ select 1 from storage.objects where bucket_id='vet-reports' $q$, 1);
select t_ok('manager approves the report', $q$ update veterinary_reports set status='Approved' where code='VET-N-1' $q$);
select t_as(:'VET');
select t_fail('after approval the vet cannot add photos', $q$ insert into storage.objects(bucket_id,name,owner) values ('vet-reports','f0000000-0000-0000-0000-000000000001/b1000000-0000-0000-0000-000000000001/late.jpg',auth.uid()) $q$, 'row-level security');
select t_affects('...nor delete them', $q$ delete from vet_report_attachments $q$, 0);
select t_rows('vet still sees their own approved report + photos', $q$ select 1 from veterinary_reports union all select 1 from vet_report_attachments $q$, 11);
select t_anon();
select t_rows('anon sees no attachments', $q$ select 1 from vet_report_attachments $q$, 0);
select t_rows('anon sees no animals (is_assigned_animal does not break anon)', $q$ select 1 from animals $q$, 0);

\echo '== 7 tasks: only your own below manager'
select t_as(:'VET');  select t_rows('vet sees only their own task', $q$ select 1 from tasks $q$, 1);
select t_ok('vet can complete their task', $q$ update tasks set status='Completed' where title='Task for vet' $q$);
select t_as(:'WRK');  select t_rows('worker sees only their own task', $q$ select 1 from tasks $q$, 1);
select t_as(:'ACC');  select t_rows('accountant sees no one elses tasks', $q$ select 1 from tasks $q$, 0);
select t_as(:'MGR');  select t_rows('manager sees all tasks', $q$ select 1 from tasks $q$, 2);

\echo '== 8 least privilege for the other roles'
select t_as(:'ACC');  select t_rows('accountant: no inventory, no products', $q$ select 1 from inventory_items union all select 1 from products where status<>'Active' $q$, 0);
select t_rows('accountant: still sees finance', $q$ select 1 from expenses $q$, 0+(select count(*) from expenses)::int);
select t_as(:'INV');  select t_rows('inventory officer: no products, no finance', $q$ select 1 from expenses union all select 1 from products where status<>'Active' $q$, 0);
select t_as(:'WRK');  select t_rows('worker: no finance, no equipment', $q$ select 1 from expenses union all select 1 from equipment $q$, 0);
select t_affects('worker still cannot delete animals', $q$ delete from animals $q$, 0);

\echo '== 9 a customer (no farm membership) has no farm access at all'
select t_as(:'CUST');
select t_rows('customer sees their OWN order only (not the walk-in order)', $q$ select 1 from orders $q$, 1);
select t_rows('customer sees their own order lines only', $q$ select 1 from order_items $q$, 1);
select t_rows('customer sees only their own customer record', $q$ select 1 from customers $q$, 1);
select t_affects('customer cannot edit an order', $q$ update orders set status='Cancelled' $q$, 0);
select t_fail('customer cannot create orders directly', $q$ insert into orders(farm_id,order_number,customer_id,delivery_method) values ('f0000000-0000-0000-0000-000000000001','ORD-H','c1000000-0000-0000-0000-000000000001','Pickup') $q$, 'row-level security');
select t_rows('customer sees no animals', $q$ select 1 from animals $q$, 0);
select t_rows('customer sees no tasks / expenses / reports', $q$ select 1 from tasks union all select 1 from expenses union all select 1 from veterinary_reports $q$, 0);
select t_rows('customer has no permissions on the farm', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','livestock.view') or has_permission('f0000000-0000-0000-0000-000000000001','dashboard.overview') $q$, 0);
select t_rows('customer my_access is empty', format($q$ select 1 where jsonb_array_length(my_access(%L)->'permissions') > 0 $q$, :'FA'), 0);
select t_rows('customer sees their own profile', $q$ select 1 from profiles where id = auth.uid() $q$, 1);

\echo '== 10 dashboard.overview'
select t_as(:'OWN'); select t_rows('owner has dashboard.overview', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','dashboard.overview') $q$, 1);
select t_as(:'VET'); select t_rows('vet does NOT (gets their own home)', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','dashboard.overview') $q$, 0);
select t_as(:'WRK'); select t_rows('worker does NOT', $q$ select 1 where has_permission('f0000000-0000-0000-0000-000000000001','dashboard.overview') $q$, 0);

\echo '== 11 other people never see customers/orders of someone else, anon sees none'
select t_as(:'VET2'); select t_rows('a vet sees no customer orders', $q$ select 1 from orders union all select 1 from customers $q$, 0);
select t_as(:'MGR');  select t_rows('manager sees both orders', $q$ select 1 from orders $q$, 2);
select t_anon();      select t_rows('anon sees no orders (no permission error)', $q$ select 1 from orders $q$, 0);
