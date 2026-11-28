\set QUIET on
\set OWN  '10000000-0000-0000-0000-000000000001'
\set MGR  '10000000-0000-0000-0000-000000000002'
\set VET  '10000000-0000-0000-0000-000000000003'
\set WRK  '10000000-0000-0000-0000-000000000004'
\set INV  '10000000-0000-0000-0000-000000000006'
\set OUT  '10000000-0000-0000-0000-000000000007'
\set WRK2 '10000000-0000-0000-0000-000000000014'
\set CUST '10000000-0000-0000-0000-000000000013'
\set FA 'f0000000-0000-0000-0000-000000000001'
\set T1 'e1000000-0000-0000-0000-000000000001'
\set T2 'e1000000-0000-0000-0000-000000000002'
\set T3 'e1000000-0000-0000-0000-000000000003'
\set T4 'e1000000-0000-0000-0000-000000000004'
\set T5 'e1000000-0000-0000-0000-000000000005'

\echo '== 1 who sees which tasks (assignees, not a single field)'
select t_as(:'WRK');  select t_rows('worker sees T1, T2, T5 (their tasks)', $q$ select 1 from tasks $q$, 3);
select t_as(:'WRK2'); select t_rows('second assignee sees only T1', $q$ select 1 from tasks $q$, 1);
select t_as(:'VET');  select t_rows('vet sees only T3', $q$ select 1 from tasks $q$, 1);
select t_as(:'INV');  select t_rows('inventory officer sees none', $q$ select 1 from tasks $q$, 0);
select t_as(:'MGR');  select t_rows('manager sees all 5', $q$ select 1 from tasks $q$, 5);
select t_as(:'OUT');  select t_rows('non-member sees none', $q$ select 1 from tasks $q$, 0);
select t_as(:'CUST'); select t_rows('customer sees none', $q$ select 1 from tasks union all select 1 from task_assignees union all select 1 from task_events $q$, 0);
select t_anon();      select t_rows('anon sees none', $q$ select 1 from tasks $q$, 0);
select t_as(:'WRK');  select t_rows('worker sees assignees of their own task only', $q$ select 1 from task_assignees $q$, 4);

\echo '== 2 assigning people'
select t_as(:'WRK');
select t_fail('worker cannot add an assignee', format($q$ insert into task_assignees(task_id,user_id,assigned_by) values (%L,%L,auth.uid()) $q$, :'T1', :'INV'), 'row-level security');
select t_affects('worker cannot remove an assignee', format($q$ delete from task_assignees where task_id=%L $q$, :'T1'), 0);
select t_as(:'MGR');
select t_ok('manager adds a second assignee to T3', format($q$ insert into task_assignees(task_id,user_id,assigned_by) values (%L,%L,auth.uid()) $q$, :'T3', :'INV'));
select t_rows('inventory officer now sees T3', format($q$ select 1 from tasks where id=%L $q$, :'T3'), 1);
select t_fail('cannot assign a non-member', format($q$ insert into task_assignees(task_id,user_id,assigned_by) values (%L,%L,auth.uid()) $q$, :'T3', :'OUT'), 'members of this farm');
select t_fail('cannot assign another farm''s owner', format($q$ insert into task_assignees(task_id,user_id,assigned_by) values (%L,'10000000-0000-0000-0000-000000000010',auth.uid()) $q$, :'T3'), 'members of this farm');
select t_fail('cannot spoof assigned_by', format($q$ insert into task_assignees(task_id,user_id,assigned_by) values (%L,%L,%L) $q$, :'T3', :'WRK', :'OWN'), 'row-level security');
select t_ok('manager removes the extra assignee', format($q$ delete from task_assignees where task_id=%L and user_id=%L $q$, :'T3', :'INV'));

\echo '== 3 a plain task: assignees work it, only managers reopen/cancel'
select t_as(:'WRK');
select t_ok('assignee starts T1', format($q$ update tasks set status='In Progress' where id=%L $q$, :'T1'));
select t_fail('assignee cannot retitle it', format($q$ update tasks set title='x' where id=%L $q$, :'T1'), 'only change the status');
select t_fail('assignee cannot cancel it', format($q$ update tasks set status='Cancelled' where id=%L $q$, :'T1'), 'cancel');
select t_fail('assignee cannot turn verification off', format($q$ update tasks set requires_verification=false where id=%L $q$, :'T2'), 'only change the status');
select t_fail('assignee cannot submit a task that needs no verification', format($q$ update tasks set status='Awaiting Verification' where id=%L $q$, :'T1'), 'doesn''t need verification');
select t_ok('assignee completes T1', format($q$ update tasks set status='Completed' where id=%L $q$, :'T1'));
select t_rows('completed_at was set by the database', format($q$ select 1 from tasks where id=%L and completed_at is not null $q$, :'T1'), 1);
select t_as(:'WRK2');
select t_fail('the other assignee cannot reopen', format($q$ update tasks set status='Pending' where id=%L $q$, :'T1'), 'reopen');
select t_as(:'MGR');
select t_ok('manager reopens it', format($q$ update tasks set status='Pending' where id=%L $q$, :'T1'));
select t_as(:'VET');
select t_affects('vet cannot touch a task that is not theirs', format($q$ update tasks set status='Completed' where id=%L $q$, :'T1'), 0);

\echo '== 4 verification workflow (T2: needs verification AND a photo)'
select t_as(:'WRK');
select t_fail('cannot complete a verified task directly', format($q$ update tasks set status='Completed' where id=%L $q$, :'T2'), 'submitted for verification first');
select t_fail('cannot submit without evidence', format($q$ update tasks set status='Awaiting Verification' where id=%L $q$, :'T2'), 'photo as evidence');
select t_ok('assignee uploads the evidence file', $q$ insert into storage.objects(bucket_id,name,owner) values ('task-files','f0000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000002/p1.jpg',auth.uid()) $q$);
select t_ok('assignee records it as Evidence', $q$ insert into task_attachments(farm_id,task_id,kind,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000002','Evidence','f0000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000002/p1.jpg','p1.jpg','image/jpeg',100,auth.uid()) $q$);
select t_ok('assignee submits for verification', format($q$ update tasks set status='Awaiting Verification' where id=%L $q$, :'T2'));
select t_rows('submitted_by is recorded', format($q$ select 1 from tasks where id=%L and submitted_by=%L $q$, :'T2', :'WRK'), 1);
select t_fail('submitter (no verify permission) cannot approve their own work', format($q$ update tasks set status='Completed' where id=%L $q$, :'T2'), 'permission to verify');
select t_ok('trying to forge verified_by is accepted but has NO effect', format($q$ update tasks set verified_by=%L where id=%L $q$, :'WRK', :'T2'));
select t_rows('verified_by is still empty', format($q$ select 1 from tasks where id=%L and verified_by is null $q$, :'T2'), 1);
select t_fail('cannot add evidence after submitting', $q$ insert into task_attachments(farm_id,task_id,kind,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000002','Evidence','f0000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000002/late.jpg','late.jpg','image/jpeg',100,auth.uid()) $q$, 'row-level security');
select t_as(:'MGR');
select t_fail('rejecting needs a reason', format($q$ update tasks set status='In Progress' where id=%L $q$, :'T2'), 'what needs to be corrected');
select t_ok('manager rejects with a note', format($q$ update tasks set status='In Progress', rejection_note='Photo is blurry, retake it' where id=%L $q$, :'T2'));
select t_rows('the worker will see the note', format($q$ select 1 from tasks where id=%L and rejection_note like 'Photo%%' and status='In Progress' $q$, :'T2'), 1);
select t_as(:'WRK');
select t_ok('worker resubmits after correcting', format($q$ update tasks set status='Awaiting Verification' where id=%L $q$, :'T2'));
select t_rows('the rejection note is cleared on resubmission', format($q$ select 1 from tasks where id=%L and rejection_note is null $q$, :'T2'), 1);
select t_as(:'MGR');
select t_ok('a DIFFERENT person approves it', format($q$ update tasks set status='Completed' where id=%L $q$, :'T2'));
select t_rows('verified_by is the approver', format($q$ select 1 from tasks where id=%L and verified_by=%L and verified_at is not null $q$, :'T2', :'MGR'), 1);
select t_rows('history recorded: created, assigned, evidence, submitted x2, rejected, verified', format($q$ select 1 from task_events where task_id=%L and event in ('Created','Assigned','Evidence added','Submitted for verification','Rejected','Verified') $q$, :'T2'), 0+(select count(*) from task_events where task_id='e1000000-0000-0000-0000-000000000002' and event in ('Created','Assigned','Evidence added','Submitted for verification','Rejected','Verified'))::int);
select t_rows('...with at least 5 distinct kinds of event', format($q$ select 1 from (select distinct event from task_events where task_id=%L) d $q$, :'T2'), 0+(select count(distinct event) from task_events where task_id='e1000000-0000-0000-0000-000000000002')::int);
select t_rows('Rejected and Verified are both in the history', format($q$ select 1 where (select count(distinct event) from task_events where task_id=%L and event in ('Rejected','Verified','Submitted for verification','Evidence added')) = 4 $q$, :'T2'), 1);

\echo '   no self-verification, even for the Owner'
select t_as(:'OWN');
select t_ok('owner works their own task T4', format($q$ update tasks set status='In Progress' where id=%L $q$, :'T4'));
select t_ok('owner submits it', format($q$ update tasks set status='Awaiting Verification' where id=%L $q$, :'T4'));
select t_fail('owner cannot approve their own submission', format($q$ update tasks set status='Completed' where id=%L $q$, :'T4'), 'you submitted yourself');
select t_as(:'MGR');
select t_ok('the manager approves the owner''s task', format($q$ update tasks set status='Completed' where id=%L $q$, :'T4'));
select t_as(:'WRK');
select t_affects('a worker cannot approve (cannot even see the task)', format($q$ update tasks set status='Completed' where id=%L $q$, :'T4'), 0);

\echo '== 5 checklist'
select t_as(:'MGR');
select t_ok('manager adds checklist items', format($q$ insert into task_checklist_items(task_id,label,sort_order) select %L, 'Step '||g, g from generate_series(1,3) g $q$, :'T5'));
select t_as(:'WRK');
select t_rows('assignee sees the checklist', format($q$ select 1 from task_checklist_items where task_id=%L $q$, :'T5'), 3);
select t_ok('assignee ticks an item', format($q$ update task_checklist_items set done=true where task_id=%L and label='Step 1' $q$, :'T5'));
select t_rows('done_by / done_at are set by the database', format($q$ select 1 from task_checklist_items where task_id=%L and label='Step 1' and done_by=%L and done_at is not null $q$, :'T5', :'WRK'), 1);
select t_fail('assignee cannot rename an item', format($q$ update task_checklist_items set label='Hacked' where task_id=%L and label='Step 2' $q$, :'T5'), 'tick items off');
select t_fail('assignee cannot add items', format($q$ insert into task_checklist_items(task_id,label) values (%L,'extra') $q$, :'T5'), 'row-level security');
select t_affects('assignee cannot delete items', format($q$ delete from task_checklist_items where task_id=%L $q$, :'T5'), 0);
select t_ok('trying to forge who ticked an item is accepted but has NO effect', format($q$ update task_checklist_items set done_by=%L where task_id=%L and label='Step 1' $q$, :'OWN', :'T5'));
select t_rows('done_by is still the real person', format($q$ select 1 from task_checklist_items where task_id=%L and label='Step 1' and done_by=%L $q$, :'T5', :'WRK'), 1);
select t_as(:'WRK2');
select t_rows('a non-assignee cannot see T5''s checklist', format($q$ select 1 from task_checklist_items where task_id=%L $q$, :'T5'), 0);
select t_affects('...nor tick it', format($q$ update task_checklist_items set done=true where task_id=%L $q$, :'T5'), 0);
select t_as(:'MGR');
select t_fail('a checklist is capped at 30 items', format($q$ insert into task_checklist_items(task_id,label) select %L, 'i'||g from generate_series(1,28) g $q$, :'T5'), 'at most 30');

\echo '== 6 attachments'
select t_as(:'MGR');
select t_ok('manager attaches an instruction sheet', $q$ insert into task_attachments(farm_id,task_id,kind,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000005','Instruction','f0000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000005/how.pdf','how.pdf','application/pdf',100,auth.uid()) $q$);
select t_ok('...and uploads the stored file', $q$ insert into storage.objects(bucket_id,name,owner) values ('task-files','f0000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000005/how.pdf',auth.uid()) $q$);
select t_as(:'WRK');
select t_rows('assignee sees the attachment', $q$ select 1 from task_attachments where task_id='e1000000-0000-0000-0000-000000000005' $q$, 1);
select t_rows('assignee can read the stored file', $q$ select 1 from storage.objects where bucket_id='task-files' and name like '%how.pdf' $q$, 1);
select t_fail('assignee cannot add an INSTRUCTION', $q$ insert into task_attachments(farm_id,task_id,kind,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000005','Instruction','f0000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000005/x.pdf','x.pdf','application/pdf',100,auth.uid()) $q$, 'row-level security');
select t_ok('assignee adds EVIDENCE to an open task', $q$ insert into task_attachments(farm_id,task_id,kind,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000005','Evidence','f0000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000005/e.jpg','e.jpg','image/jpeg',100,auth.uid()) $q$);
select t_fail('svg refused', $q$ insert into task_attachments(farm_id,task_id,kind,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000005','Evidence','f0000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000005/s.svg','s.svg','image/svg+xml',100,auth.uid()) $q$);
select t_fail('wrong folder refused', $q$ insert into task_attachments(farm_id,task_id,kind,path,file_name,mime_type,size_bytes,uploaded_by) values ('f0000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000005','Evidence','f0000000-0000-0000-0000-000000000001/other/s.jpg','s.jpg','image/jpeg',100,auth.uid()) $q$);
select t_fail('cannot upload into a task that is not theirs', $q$ insert into storage.objects(bucket_id,name,owner) values ('task-files','f0000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000003/p.jpg',auth.uid()) $q$, 'row-level security');
select t_as(:'WRK2');
select t_rows('a non-assignee cannot see attachments or files', $q$ select 1 from task_attachments where task_id='e1000000-0000-0000-0000-000000000005' union all select 1 from storage.objects where bucket_id='task-files' $q$, 0);
select t_as(:'MGR');
select t_fail('a task holds at most 15 files', $q$ insert into task_attachments(farm_id,task_id,kind,path,file_name,mime_type,size_bytes,uploaded_by) select 'f0000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000005','Instruction','f0000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000005/f'||g||'.jpg','f.jpg','image/jpeg',100,auth.uid() from generate_series(1,14) g $q$, 'at most 15');
select t_anon(); select t_rows('anon sees no task files', $q$ select 1 from task_attachments union all select 1 from storage.objects where bucket_id='task-files' $q$, 0);

\echo '== 7 recurring tasks'
select t_as(:'WRK');
select t_fail('a worker cannot create a recurrence', format($q$ insert into task_recurrences(farm_id,title,frequency,start_date,created_by) values (%L,'x','daily',current_date,auth.uid()) $q$, :'FA'), 'row-level security');
select t_as(:'MGR');
select t_ok('manager creates a DAILY recurrence with assignees + checklist', format($q$ insert into task_recurrences(id,farm_id,title,frequency,start_date,end_date,assignee_ids,checklist,requires_verification,created_by) values ('ee000000-0000-0000-0000-000000000001',%L,'Feed the goats','daily',current_date,current_date+2,array[%L::uuid,%L::uuid],array['Fill trough','Check water'],true,auth.uid()) $q$, :'FA', :'WRK', :'WRK2'));
select t_ok('...and a WEEKLY one', format($q$ insert into task_recurrences(id,farm_id,title,frequency,weekday,start_date,end_date,created_by) values ('ee000000-0000-0000-0000-000000000002',%L,'Weekly clean','weekly',extract(dow from current_date)::int,current_date,current_date+13,auth.uid()) $q$, :'FA'));
select t_ok('...and a MONTHLY one', format($q$ insert into task_recurrences(id,farm_id,title,frequency,day_of_month,start_date,created_by) values ('ee000000-0000-0000-0000-000000000003',%L,'Monthly inspection','monthly',extract(day from current_date)::int % 28 + 1,current_date,auth.uid()) $q$, :'FA'));
select t_fail('weekly needs a weekday', format($q$ insert into task_recurrences(farm_id,title,frequency,start_date,created_by) values (%L,'x','weekly',current_date,auth.uid()) $q$, :'FA'));
select t_fail('daily must not carry a weekday', format($q$ insert into task_recurrences(farm_id,title,frequency,weekday,start_date,created_by) values (%L,'x','daily',3,current_date,auth.uid()) $q$, :'FA'));
select t_fail('recurrence assignees must be members', format($q$ insert into task_recurrences(farm_id,title,frequency,start_date,assignee_ids,created_by) values (%L,'x','daily',current_date,array[%L::uuid],auth.uid()) $q$, :'FA', :'OUT'), 'members of this farm');
select t_fail('end before start refused', format($q$ insert into task_recurrences(farm_id,title,frequency,start_date,end_date,created_by) values (%L,'x','daily',current_date,current_date-1,auth.uid()) $q$, :'FA'));
select t_as(:'MGR');
create temp table gen1(n int);
insert into gen1 select generate_recurring_tasks(:'FA');
select t_rows('first run creates the daily x3 + weekly x2 (days 0 and 7) + monthly occurrences', $q$ select 1 from tasks where recurrence_id is not null $q$, (select n from gen1));
select t_rows('daily recurrence made exactly 3 tasks (today..+2)', $q$ select 1 from tasks where recurrence_id='ee000000-0000-0000-0000-000000000001' $q$, 3);
select t_rows('each carries both assignees', $q$ select 1 from task_assignees ta join tasks t on t.id=ta.task_id where t.recurrence_id='ee000000-0000-0000-0000-000000000001' $q$, 6);
select t_rows('each carries the 2-item checklist', $q$ select 1 from task_checklist_items c join tasks t on t.id=c.task_id where t.recurrence_id='ee000000-0000-0000-0000-000000000001' $q$, 6);
select t_rows('verification flag copied from the template', $q$ select 1 from tasks where recurrence_id='ee000000-0000-0000-0000-000000000001' and requires_verification $q$, 3);
select t_rows('created_by is the template owner, not whoever opened the page', format($q$ select 1 from tasks where recurrence_id is not null and created_by=%L $q$, :'MGR'), (select count(*) from tasks where recurrence_id is not null)::int);
create temp table gen2(n int);
insert into gen2 select generate_recurring_tasks(:'FA');
select t_rows('a second run creates NOTHING (idempotent)', $q$ select 1 from gen2 where n > 0 $q$, 0);
select t_as(:'WRK');
create temp table gen3(n int);
insert into gen3 select generate_recurring_tasks(:'FA');
select t_rows('a worker opening the page cannot create duplicates either', $q$ select 1 from gen3 where n > 0 $q$, 0);
select t_rows('the worker sees their generated tasks', $q$ select 1 from tasks where recurrence_id='ee000000-0000-0000-0000-000000000001' $q$, 3);
select t_as(:'OUT');
select t_fail('a non-member cannot run the generator', format($q$ select generate_recurring_tasks(%L) $q$, :'FA'), 'not a member');
select t_as(:'OWN');
select t_fail('nobody can forge a recurring task by hand', format($q$ insert into tasks(farm_id,title,created_by,recurrence_id,due_date) values (%L,'forged',auth.uid(),'ee000000-0000-0000-0000-000000000001',current_date+30) $q$, :'FA'), 'created automatically');
select t_fail('delete of a recurrence is not allowed', $q$ delete from task_recurrences $q$);
select t_ok('stopping a recurrence = active false', $q$ update task_recurrences set active=false where id='ee000000-0000-0000-0000-000000000001' $q$);
select t_rows('history shows generated tasks as automatic', $q$ select 1 from task_events where detail like 'Created automatically%' $q$, (select count(*) from task_events where detail like 'Created automatically%')::int);
select t_rows('generated tasks have an automatic "Created" event with no actor', $q$ select 1 from task_events where detail like 'Created automatically%' and actor is null $q$, (select count(*) from task_events where detail like 'Created automatically%')::int);

\echo '== 8 calendar'
select t_as(:'MGR');
select t_ok('manager adds an event', format($q$ insert into calendar_events(farm_id,title,kind,starts_on,created_by) values (%L,'Vet visit','Appointment',current_date+3,auth.uid()) $q$, :'FA'));
select t_ok('...and a multi-day event with times', format($q$ insert into calendar_events(farm_id,title,starts_on,ends_on,start_time,end_time,created_by) values (%L,'Field day',current_date+5,current_date+6,'09:00','17:00',auth.uid()) $q$, :'FA'));
select t_fail('end date before start refused', format($q$ insert into calendar_events(farm_id,title,starts_on,ends_on,created_by) values (%L,'x',current_date+5,current_date+4,auth.uid()) $q$, :'FA'));
select t_fail('bad kind refused', format($q$ insert into calendar_events(farm_id,title,kind,starts_on,created_by) values (%L,'x','Party',current_date,auth.uid()) $q$, :'FA'));
select t_fail('cannot spoof created_by', format($q$ insert into calendar_events(farm_id,title,starts_on,created_by) values (%L,'x',current_date,%L) $q$, :'FA', :'OWN'), 'row-level security');
select t_as(:'WRK');  select t_rows('worker sees farm events', $q$ select 1 from calendar_events $q$, 2);
select t_fail('worker cannot add an event', format($q$ insert into calendar_events(farm_id,title,starts_on,created_by) values (%L,'x',current_date,auth.uid()) $q$, :'FA'), 'row-level security');
select t_affects('worker cannot edit an event', $q$ update calendar_events set title='x' $q$, 0);
select t_affects('worker cannot delete an event', $q$ delete from calendar_events $q$, 0);
select t_as(:'VET');  select t_rows('vet sees farm events', $q$ select 1 from calendar_events $q$, 2);
select t_as(:'CUST'); select t_rows('customer sees none', $q$ select 1 from calendar_events $q$, 0);
select t_anon();      select t_rows('anon sees none', $q$ select 1 from calendar_events $q$, 0);
select t_as(:'MGR');  select t_ok('manager edits an event', $q$ update calendar_events set location='Barn A' where title='Vet visit' $q$);
select t_ok('manager deletes an event', $q$ delete from calendar_events where title='Field day' $q$);

\echo '== 9 history cannot be written by users'
select t_as(:'MGR');
select t_fail('users cannot write task history', format($q$ insert into task_events(task_id,farm_id,event) values (%L,%L,'fake') $q$, :'T1', :'FA'));
select t_fail('users cannot edit task history', $q$ update task_events set event='x' $q$);
select t_as(:'WRK'); select t_rows('worker reads history of their own task', format($q$ select 1 from task_events where task_id=%L $q$, :'T5'), (select count(*) from task_events where task_id='e1000000-0000-0000-0000-000000000005')::int);
select t_as(:'WRK2'); select t_rows('...but not of someone else''s', format($q$ select 1 from task_events where task_id=%L $q$, :'T5'), 0);
