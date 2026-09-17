-- ============================================================================
-- seed.sql
-- Representative sample data matching the shape of everything currently in
-- lib/data/mock/*.ts. Run after all migrations. Uses fixed UUIDs so foreign
-- keys are readable and the file is idempotent-ish (re-running will hit the
-- unique constraints rather than silently duplicating).
--
-- NOTE ON FARM MEMBERSHIP: farm_members rows require a real auth.users row
-- to reference (via profiles). This seed cannot create that for you — after
-- you sign up through /register, run the snippet at the bottom of this file
-- (with your own user id) to attach yourself to the seeded farm.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ORGANIZATION & FARM
-- ----------------------------------------------------------------------------
insert into organizations (id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Klantis Farms', 'klantis-farms');

insert into farms (id, organization_id, name, slug, farm_code, farm_type, location_name, status) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Klantis Farms', 'klantis-farms', 'KLF', 'Mixed', 'Eastern Region, Ghana', 'active');

-- ----------------------------------------------------------------------------
-- BREEDS (species already seeded by migration 0002)
-- ----------------------------------------------------------------------------
insert into breeds (species_id, name)
  select id, 'Sanga' from species where name = 'Cattle'
  union all
  select id, 'Zebu Cross' from species where name = 'Cattle';

-- ----------------------------------------------------------------------------
-- ANIMALS
-- ----------------------------------------------------------------------------
insert into animals (id, farm_id, tag, species_id, breed_id, sex, date_of_birth, current_weight, location, status)
select
  v.id::uuid,
  '22222222-2222-2222-2222-222222222222',
  v.tag, s.id, b.id, v.sex, v.dob::date, v.weight, v.location, v.status
from (values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'KLF-COW-0012', 'Female', '2022-03-14', 412, 'East Pasture', 'Pregnant'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'KLF-COW-0013', 'Female', '2021-11-02', 438, 'East Pasture', 'Active'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'KLF-BUL-0004', 'Male',   '2020-05-19', 560, 'West Pasture', 'Active'),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'KLF-COW-0021', 'Female', '2023-01-30', 301, 'East Pasture', 'Sick'),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'KLF-COW-0028', 'Female', '2019-09-08', 445, 'Quarantine Pen', 'Quarantined')
) as v(id, tag, sex, dob, weight, location, status)
join species s on s.name = 'Cattle'
join breeds b on b.species_id = s.id and b.name = 'Sanga';

-- ----------------------------------------------------------------------------
-- ANIMAL EVENTS
-- ----------------------------------------------------------------------------
insert into animal_events (animal_id, farm_id, event_date, event_type, detail) values
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '2026-08-11', 'Health Check', 'Routine examination — no issues'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '2026-07-02', 'Breeding', 'Breeding recorded with KLF-BUL-0004'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '2026-04-20', 'Vaccination', 'Annual vaccination administered'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '2026-08-05', 'Weight', 'Weight recorded: 438 kg'),
  ('bbbbbbbb-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', '2026-08-14', 'Treatment', 'Treatment started — respiratory infection'),
  ('bbbbbbbb-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', '2026-08-13', 'Veterinary Visit', 'Veterinary report submitted, pending review'),
  ('bbbbbbbb-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', '2026-08-10', 'Transfer', 'Moved to quarantine pen for observation');

-- ----------------------------------------------------------------------------
-- VETERINARY REPORTS
-- ----------------------------------------------------------------------------
insert into veterinary_reports (farm_id, animal_id, code, visit_date, reason, findings, diagnosis, treatment_plan, status) values
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000004', 'VT-0042', '2026-08-13',
   'Reported difficulty breathing, reduced appetite',
   'Elevated respiratory rate, mild nasal discharge, temperature slightly above normal',
   'Suspected respiratory infection',
   '5-day course of antibiotics, isolate from herd, recheck in 3 days',
   'Under Review'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000001', 'VT-0041', '2026-08-11',
   'Routine pregnancy check',
   'Pregnancy confirmed, approximately 3 months along, animal in good condition',
   'Healthy pregnancy',
   'Continue routine monitoring, no intervention needed',
   'Approved');


insert into fields (id, farm_id, code, name, area, soil_type, irrigation_type, status) values
  ('33333333-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'FLD-A', 'Field A', 5, 'Sandy loam', 'Drip irrigation', 'In Use'),
  ('33333333-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'FLD-B', 'Field B', 4, 'Clay loam', 'Rain-fed', 'In Use'),
  ('33333333-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'ORC-3', 'Orchard Block 3', 8, 'Loam', 'Drip irrigation', 'In Use'),
  ('33333333-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'CSH-1', 'Cashew Grove', 6, 'Sandy loam', 'Rain-fed', 'In Use');

-- ----------------------------------------------------------------------------
-- CROP CYCLES
-- ----------------------------------------------------------------------------
insert into crop_cycles (id, farm_id, field_id, crop_type_id, code, variety, season, expected_harvest_date, area, status)
select
  '44444444-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
  '33333333-0000-0000-0000-000000000003', ct.id, 'KLF-CRP-2026-001', 'Keitt', '2026 Main Season', '2026-09-15', '8 acres', 'Harvesting'
from crop_types ct where ct.name = 'Mango';

insert into crop_cycles (id, farm_id, field_id, crop_type_id, code, variety, season, expected_harvest_date, area, status)
select
  '44444444-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
  '33333333-0000-0000-0000-000000000004', ct.id, 'KLF-CRP-2026-002', 'Local Improved', '2026 Main Season', '2026-10-01', '6 acres', 'Growing'
from crop_types ct where ct.name = 'Cashew';

insert into crop_cycles (id, farm_id, field_id, crop_type_id, code, variety, season, expected_harvest_date, area, status)
select
  '44444444-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222',
  '33333333-0000-0000-0000-000000000001', ct.id, 'KLF-CRP-2026-004', 'Obatanpa', '2026 Major Season', '2026-09-05', '5 acres', 'Planted'
from crop_types ct where ct.name = 'Maize';

-- ----------------------------------------------------------------------------
-- HARVESTS
-- ----------------------------------------------------------------------------
insert into harvests (id, farm_id, crop_cycle_id, code, harvest_date, quantity, unit, quality_grade, destination, status) values
  ('55555555-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '44444444-0000-0000-0000-000000000001', 'HAR-2026-031', '2026-08-20', 180, 'kg', 'Grade A', 'Product Storage', 'Added to Inventory'),
  ('55555555-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '44444444-0000-0000-0000-000000000001', 'HAR-2026-030', '2026-08-06', 142, 'kg', 'Grade A', 'Product Storage', 'Added to Inventory'),
  ('55555555-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', '44444444-0000-0000-0000-000000000002', 'HAR-2026-029', '2026-07-28', 95,  'kg', 'Grade B', 'Processing Area', 'Approved'),
  ('55555555-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', '44444444-0000-0000-0000-000000000004', 'HAR-2026-028', '2026-07-15', 1200, 'kg', 'Grade A', 'Warehouse A', 'Recorded');

-- ----------------------------------------------------------------------------
-- INVENTORY (quantities populated via transactions, not set directly)
-- ----------------------------------------------------------------------------
insert into inventory_items (id, farm_id, sku, name, category, unit, reorder_level, location) values
  ('66666666-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'KLF-INV-0041', 'Fresh Mangoes', 'Produce', 'kg', 50, 'Product Storage'),
  ('66666666-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'KLF-INV-0038', 'Raw Cashew Nuts', 'Produce', 'kg', 40, 'Processing Area'),
  ('66666666-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'KLF-INV-0009', 'Cattle Feed', 'Input', 'kg', 150, 'Warehouse A'),
  ('66666666-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'KLF-INV-0022', 'Dried Maize', 'Produce', 'kg', 300, 'Warehouse A');

insert into inventory_transactions (farm_id, inventory_item_id, transaction_date, transaction_type, quantity_change, reference, reference_type) values
  ('22222222-2222-2222-2222-222222222222', '66666666-0000-0000-0000-000000000001', '2026-08-20', 'Harvest', 180, 'HAR-2026-031', 'harvest'),
  ('22222222-2222-2222-2222-222222222222', '66666666-0000-0000-0000-000000000001', '2026-08-06', 'Harvest', 142, 'HAR-2026-030', 'harvest'),
  ('22222222-2222-2222-2222-222222222222', '66666666-0000-0000-0000-000000000002', '2026-07-28', 'Harvest', 95,  'HAR-2026-029', 'harvest'),
  ('22222222-2222-2222-2222-222222222222', '66666666-0000-0000-0000-000000000003', '2026-08-01', 'Purchase', 500, 'Eastern Feed Co.', 'purchase'),
  ('22222222-2222-2222-2222-222222222222', '66666666-0000-0000-0000-000000000003', '2026-08-12', 'Consumption', -45, 'Daily feeding', 'manual'),
  ('22222222-2222-2222-2222-222222222222', '66666666-0000-0000-0000-000000000003', '2026-08-19', 'Consumption', -45, 'Daily feeding', 'manual'),
  ('22222222-2222-2222-2222-222222222222', '66666666-0000-0000-0000-000000000004', '2026-07-15', 'Harvest', 1200, 'HAR-2026-028', 'harvest');

-- ----------------------------------------------------------------------------
-- PRODUCTS & CATEGORIES
-- ----------------------------------------------------------------------------
insert into product_categories (id, slug, name, description) values
  ('77777777-0000-0000-0000-000000000001', 'cattle-livestock', 'Cattle & Livestock', 'Grass-reared herd'),
  ('77777777-0000-0000-0000-000000000002', 'mangoes', 'Mangoes', 'Seasonal orchard harvest'),
  ('77777777-0000-0000-0000-000000000003', 'cashew-nuts-seeds', 'Cashew Nuts & Seeds', 'Raw, graded cashew');

insert into products (farm_id, slug, sku, name, category_id, price, unit, status, inventory_item_id, rating, review_count, badge) values
  ('22222222-2222-2222-2222-222222222222', 'fresh-mangoes', 'KLF-PRD-002', 'Fresh Mangoes', '77777777-0000-0000-0000-000000000002', 12, 'kg', 'Active', '66666666-0000-0000-0000-000000000001', 4.8, 128, 'In Season'),
  ('22222222-2222-2222-2222-222222222222', 'raw-cashew-nuts', 'KLF-PRD-005', 'Raw Cashew Nuts', '77777777-0000-0000-0000-000000000003', 28, 'kg', 'Active', '66666666-0000-0000-0000-000000000002', 4.7, 74, null);

-- ----------------------------------------------------------------------------
-- CUSTOMERS & ORDERS
-- ----------------------------------------------------------------------------
insert into customers (id, farm_id, name, email, phone, location) values
  ('88888888-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Akosua Mensah', 'akosua.mensah@example.com', '+233 24 555 0142', 'Koforidua'),
  ('88888888-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Kwame Addo', 'kwame.addo@example.com', '+233 20 555 0198', 'Nkawkaw');

insert into orders (id, farm_id, order_number, customer_id, order_date, delivery_method, delivery_fee, address, payment_status, status) values
  ('99999999-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'KF-1058', '88888888-0000-0000-0000-000000000002', '2026-08-18', 'Delivery', 25, '12 Adum Street, Nkawkaw', 'Paid', 'Processing');

insert into order_items (order_id, product_id, product_name_snapshot, quantity, unit_price)
select '99999999-0000-0000-0000-000000000001', p.id, p.name, 20, p.price from products p where p.slug = 'fresh-mangoes';

-- ----------------------------------------------------------------------------
-- SUPPLIERS
-- ----------------------------------------------------------------------------
insert into suppliers (id, farm_id, code, name, contact_person, phone, email, category, payment_terms, status) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'SUP-001', 'Eastern Feed Co.', 'Emmanuel Osei', '+233 24 555 7712', 'sales@easternfeed.example.com', 'Feed', 'Net 30', 'Active');

insert into supplier_purchases (supplier_id, farm_id, purchase_date, item, amount) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '2026-08-01', 'Cattle Feed — 500kg', 2100);

-- ----------------------------------------------------------------------------
-- FINANCE
-- ----------------------------------------------------------------------------
insert into expenses (farm_id, category, amount, expense_date, supplier_id, description, payment_method) values
  ('22222222-2222-2222-2222-222222222222', 'Feed', 2100, '2026-08-01', 'aaaaaaaa-0000-0000-0000-000000000001', 'Cattle feed — 500kg', 'Bank Transfer');

insert into income_records (farm_id, category, amount, income_date, source, description) values
  ('22222222-2222-2222-2222-222222222222', 'Product Sales', 240, '2026-08-18', 'Order KF-1058', 'Mango & maize order');

-- ----------------------------------------------------------------------------
-- SETTINGS — matches lib/site-config.ts SITE_CONTENT shape
-- ----------------------------------------------------------------------------
insert into settings (farm_id, key, value) values
  ('22222222-2222-2222-2222-222222222222', 'name', 'Klantis Farms'),
  ('22222222-2222-2222-2222-222222222222', 'tagline', 'From Our Farm To Your Table'),
  ('22222222-2222-2222-2222-222222222222', 'phone', '+233 24 123 4567'),
  ('22222222-2222-2222-2222-222222222222', 'email', 'hello@klantisfarms.com'),
  ('22222222-2222-2222-2222-222222222222', 'address', 'Eastern Region, Ghana');

-- ============================================================================
-- AFTER YOU SIGN UP: run this (with your real user id from auth.users) to
-- become a member of the seeded farm. Find your id in the Supabase dashboard
-- under Authentication > Users, or via `select id from auth.users;`.
-- ============================================================================
-- insert into farm_members (farm_id, user_id, role_id)
-- select '22222222-2222-2222-2222-222222222222', 'YOUR-USER-ID-HERE', id
-- from roles where name = 'Farm Owner';
