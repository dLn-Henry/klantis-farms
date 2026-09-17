import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/lib/data/mock/customers";

// ============================================================================
// Real queries replacing the mock array. Note: totalOrders and totalSpent
// are now genuinely computed from the orders/order_items tables (the mock
// version had these as hand-typed numbers that could silently drift out of
// sync with the mock orders data — this can't drift, since it's derived).
// ============================================================================

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  created_at: string;
};

type OrderStats = { totalOrders: number; totalSpent: number };

async function computeOrderStats(customerIds: string[]): Promise<Map<string, OrderStats>> {
  const statsByCustomer = new Map<string, OrderStats>();
  if (customerIds.length === 0) return statsByCustomer;

  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, customer_id, delivery_fee")
    .in("customer_id", customerIds);

  const orderIds = (orders ?? []).map((o) => o.id);
  const { data: items } = orderIds.length
    ? await supabase.from("order_items").select("order_id, quantity, unit_price").in("order_id", orderIds)
    : { data: [] as { order_id: string; quantity: number; unit_price: number }[] };

  const itemTotalByOrder = new Map<string, number>();
  for (const item of items ?? []) {
    itemTotalByOrder.set(
      item.order_id,
      (itemTotalByOrder.get(item.order_id) ?? 0) + item.quantity * item.unit_price
    );
  }

  for (const order of orders ?? []) {
    const stat = statsByCustomer.get(order.customer_id) ?? { totalOrders: 0, totalSpent: 0 };
    stat.totalOrders += 1;
    stat.totalSpent += (itemTotalByOrder.get(order.id) ?? 0) + order.delivery_fee;
    statsByCustomer.set(order.customer_id, stat);
  }

  return statsByCustomer;
}

function mapCustomerRow(row: CustomerRow, stats?: OrderStats): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    location: row.location ?? "",
    joinedDate: row.created_at.slice(0, 10),
    totalOrders: stats?.totalOrders ?? 0,
    totalSpent: stats?.totalSpent ?? 0,
  };
}

export async function getAllCustomers(): Promise<Customer[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, email, phone, location, created_at")
    .order("name");

  if (error) throw error;
  const rows = data ?? [];
  const stats = await computeOrderStats(rows.map((r) => r.id));
  return rows.map((row) => mapCustomerRow(row, stats.get(row.id)));
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, email, phone, location, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  const stats = await computeOrderStats([id]);
  return mapCustomerRow(data, stats.get(id));
}
