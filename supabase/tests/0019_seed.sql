-- extra people for the 0019 suite (on top of 0018_seed.sql)
insert into auth.users(id,email) values
 ('10000000-0000-0000-0000-000000000012','vet2@x.com'),
 ('10000000-0000-0000-0000-000000000013','customer@x.com');
insert into profiles(id) select id from auth.users on conflict do nothing;
insert into farm_members(id,farm_id,user_id) values ('c0000000-0000-0000-0000-000000000012','f0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000012');
insert into farm_member_roles(member_id,role_id) select 'c0000000-0000-0000-0000-000000000012', id from roles where name='Veterinarian';
-- a second animal on Farm A, one on Farm B already exists (G2); plus medical + commercial events
insert into animals(id,farm_id,tag) values ('d0000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000001','G3');
insert into animal_events(animal_id,farm_id,event_date,event_type) values
 ('d0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001',current_date,'Vaccination');
insert into tasks(farm_id,title,created_by,assigned_to) values
 ('f0000000-0000-0000-0000-000000000001','Task for vet','10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003'),
 ('f0000000-0000-0000-0000-000000000001','Task for worker','10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004');
insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','secret','x',false);

-- a customer with one order, and an unrelated walk-in customer with another
insert into customers(id,farm_id,user_id,name,email) values
 ('c1000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000013','Cust','customer@x.com'),
 ('c1000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000001',null,'Walk-in','walk@x.com');
insert into orders(id,farm_id,order_number,customer_id,delivery_method) values
 ('0d000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','ORD-1','c1000000-0000-0000-0000-000000000001','Pickup'),
 ('0d000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000001','ORD-2','c1000000-0000-0000-0000-000000000002','Pickup');
insert into order_items(order_id,product_name_snapshot,quantity,unit_price) values
 ('0d000000-0000-0000-0000-000000000001','Eggs',1,10),('0d000000-0000-0000-0000-000000000002','Milk',1,5);
