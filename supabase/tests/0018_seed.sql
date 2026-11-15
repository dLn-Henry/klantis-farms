-- two farms, users with SINGLE roles (pre-0018 shape)
insert into auth.users(id,email) values
 ('10000000-0000-0000-0000-000000000001','owner@x.com'),('10000000-0000-0000-0000-000000000002','mgr@x.com'),
 ('10000000-0000-0000-0000-000000000003','vet@x.com'),('10000000-0000-0000-0000-000000000004','worker@x.com'),
 ('10000000-0000-0000-0000-000000000005','acct@x.com'),('10000000-0000-0000-0000-000000000006','inv@x.com'),
 ('10000000-0000-0000-0000-000000000007','outsider@x.com'),('10000000-0000-0000-0000-000000000008','platform@x.com'),
 ('10000000-0000-0000-0000-000000000009','suspended@x.com'),('10000000-0000-0000-0000-000000000010','owner2@x.com');
insert into profiles(id) select id from auth.users on conflict do nothing;
insert into organizations(id,name,slug) values ('a0000000-0000-0000-0000-000000000001','Org','org');
insert into farms(id,organization_id,name,slug,farm_code) values
 ('f0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Farm A','a','AAA'),
 ('f0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','Farm B','b','BBB');
insert into farm_members(farm_id,user_id,role_id,status)
select 'f0000000-0000-0000-0000-000000000001', u.id, r.id, case when u.email='suspended@x.com' then 'suspended' else 'active' end
from (values ('owner@x.com','Farm Owner'),('mgr@x.com','Farm Manager'),('vet@x.com','Veterinarian'),('worker@x.com','Farm Worker'),
             ('acct@x.com','Farm Worker'),('inv@x.com','Inventory Officer'),('suspended@x.com','Farm Owner')) v(email,role)
join auth.users u on u.email=v.email join roles r on r.name=v.role;
insert into farm_members(farm_id,user_id,role_id) select 'f0000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000010',id from roles where name='Farm Owner';
insert into species(id,name) values ('50000000-0000-0000-0000-000000000001','Goat') on conflict do nothing;
insert into animals(id,farm_id,tag) values ('d0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','G1');
insert into animals(id,farm_id,tag) values ('d0000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000002','G2');
insert into expenses(farm_id,category,amount,expense_date) values ('f0000000-0000-0000-0000-000000000001','Feed',100,current_date);
