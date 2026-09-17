-- ============================================================================
-- 0004_commerce.sql
-- Products, customers, orders. order_items snapshots product_name and
-- unit_price at time of purchase — per Doc 3's "historical snapshots"
-- principle, a later price change must never alter a past order's total.
-- ============================================================================

create table product_categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text
);

create table products (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  slug text not null,
  sku text not null,
  name text not null,
  category_id uuid references product_categories(id),
  price numeric not null default 0,
  unit text not null,
  status text not null default 'Draft' check (status in ('Active', 'Draft', 'Out of Stock')),
  inventory_item_id uuid references inventory_items(id),
  rating numeric default 0,
  review_count integer default 0,
  badge text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, slug)
);

create table customers (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  user_id uuid references profiles(id),
  name text not null,
  email text not null,
  phone text,
  location text,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms(id) on delete cascade,
  order_number text not null,
  customer_id uuid not null references customers(id),
  order_date date not null default current_date,
  delivery_method text not null check (delivery_method in ('Delivery', 'Pickup')),
  delivery_fee numeric not null default 0,
  address text,
  payment_status text not null default 'Pending Payment'
    check (payment_status in ('Paid', 'Pending Payment', 'Refunded')),
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'Processing', 'Ready', 'Delivered', 'Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, order_number)
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name_snapshot text not null, -- preserved even if the product is later renamed
  quantity numeric not null,
  unit_price numeric not null, -- price AT TIME OF ORDER, not current product.price
  created_at timestamptz not null default now()
);

alter table product_categories enable row level security;
create policy "Anyone can view product categories" on product_categories for select using (true);
-- Reference data, same reasoning as roles/species/breeds/crop_types.

alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Anyone can view active products" on products for select using (status = 'Active');
create policy "Farm members can manage their products" on products for all using (is_farm_member(farm_id));

create policy "Farm members can view customers" on customers for select using (is_farm_member(farm_id));
create policy "Farm members can manage customers" on customers for all using (is_farm_member(farm_id));

create policy "Farm members can view orders" on orders for select using (is_farm_member(farm_id));
create policy "Farm members can manage orders" on orders for all using (is_farm_member(farm_id));

create policy "Farm members can view order items" on order_items for select using (
  exists (select 1 from orders o where o.id = order_items.order_id and is_farm_member(o.farm_id))
);
create policy "Farm members can manage order items" on order_items for all using (
  exists (select 1 from orders o where o.id = order_items.order_id and is_farm_member(o.farm_id))
);
