\set QUIET on
\set OWN '10000000-0000-0000-0000-000000000001'
\set WRK '10000000-0000-0000-0000-000000000004'
\set VET '10000000-0000-0000-0000-000000000003'

\echo '== preferences: own row only, shape-checked'
select t_as(:'WRK');
select t_ok('worker saves favourites', $q$ insert into user_preferences(user_id,favourites,collapsed_groups,show_planned) values (auth.uid(), array['/dashboard/tasks','/dashboard/livestock/new'], array['Finance'], false) $q$);
select t_rows('worker reads their own row', $q$ select 1 from user_preferences $q$, 1);
select t_ok('worker updates it', $q$ update user_preferences set favourites = array['/dashboard'] $q$);
select t_fail('cannot create a row for someone else', format($q$ insert into user_preferences(user_id) values (%L) $q$, :'OWN'), 'row-level security');
select t_fail('cannot move the row to another user', format($q$ update user_preferences set user_id = %L $q$, :'OWN'));
select t_as(:'OWN');
select t_ok('owner has their own row', $q$ insert into user_preferences(user_id,favourites) values (auth.uid(), array['/dashboard/finance']) $q$);
select t_rows('owner sees ONLY their row (not the worker''s)', $q$ select 1 from user_preferences $q$, 1);
select t_affects('owner cannot edit the worker''s row', format($q$ update user_preferences set favourites='{}' where user_id=%L $q$, :'WRK'), 0);
select t_fail('delete is not allowed', $q$ delete from user_preferences $q$);

\echo '== bad values are refused by the database'
select t_as(:'VET');
select t_fail('javascript: favourite refused', $q$ insert into user_preferences(user_id,favourites) values (auth.uid(), array['javascript:alert(1)']) $q$, 'inside the dashboard');
select t_fail('external link refused', $q$ insert into user_preferences(user_id,favourites) values (auth.uid(), array['https://evil.com']) $q$, 'inside the dashboard');
select t_fail('protocol-relative refused', $q$ insert into user_preferences(user_id,favourites) values (auth.uid(), array['//evil.com']) $q$, 'inside the dashboard');
select t_fail('path outside the dashboard refused', $q$ insert into user_preferences(user_id,favourites) values (auth.uid(), array['/account']) $q$, 'inside the dashboard');
select t_fail('uppercase / odd characters refused', $q$ insert into user_preferences(user_id,favourites) values (auth.uid(), array['/dashboard/Livestock?x=<b>']) $q$, 'inside the dashboard');
select t_fail('too deep a path refused', $q$ insert into user_preferences(user_id,favourites) values (auth.uid(), array['/dashboard/a/b/c/d']) $q$, 'inside the dashboard');
select t_fail('more than 12 favourites refused', $q$ insert into user_preferences(user_id,favourites) select auth.uid(), array_agg('/dashboard/p'||g) from generate_series(1,13) g $q$, 'up to 12');
select t_fail('bad group name refused', $q$ insert into user_preferences(user_id,collapsed_groups) values (auth.uid(), array['<script>']) $q$, 'Invalid group');
select t_ok('12 valid favourites accepted', $q$ insert into user_preferences(user_id,favourites) select auth.uid(), array_agg('/dashboard/p'||g) from generate_series(1,12) g $q$);

\echo '== anonymous'
select t_anon();
select t_rows('anon reads no preferences', $q$ select 1 from user_preferences $q$, 0);
select t_fail('anon cannot write', $q$ insert into user_preferences(user_id) values ('10000000-0000-0000-0000-000000000001') $q$);
