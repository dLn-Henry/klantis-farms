import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/data/mock/orders";

// ============================================================================
// Real queries replacing the mock array in lib/data/mock/orders.ts (kept
// for its types and as a seed-data reference). Same approach as
// repositories/animals.ts: separate queries + JS-side joining, rather than
// Supabase's embedded-relation select syntax, since that couldn't be
// verified against the real library without network access here.
// ============================================================================

type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string;
  order_date: string;
  delivery_method: string;
  delivery_fee: number;
  address: string | null;
  payment_status: string;
  status: string;
};

type OrderItemRow = {
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  quantity: number;
  unit_price: number;
};

async function attachItemsAndCustomers(
  rows: OrderRow[]
): Promise<Order[]> {
  if (rows.length === 0) return [];
  const supabase = createClient();
  const orderIds = rows.map((r) => r.id);
  const customerIds = Array.from(new Set(rows.map((r) => r.customer_id)));

  const [{ data: itemRows }, { data: customerRows }, { data: productRows }] = await Promise.all([
    supabase
      .from("order_items")
      .select("order_id, product_id, product_name_snapshot, quantity, unit_price")
      .in("order_id", orderIds),
    supabase.from("customers").select("id, name").in("id", customerIds),
    supabase.from("products").select("id, slug"),
  ]);

  const customerMap = new Map((customerRows ?? []).map((c) => [c.id, c.name]));
  const productSlugMap = new Map((productRows ?? []).map((p) => [p.id, p.slug]));

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const item of (itemRows ?? []) as OrderItemRow[]) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push({
      productSlug: (item.product_id && productSlugMap.get(item.product_id)) || "",
      name: item.product_name_snapshot,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    });
    itemsByOrder.set(item.order_id, list);
  }

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: customerMap.get(row.customer_id) ?? "—",
    date: row.order_date,
    items: itemsByOrder.get(row.id) ?? [],
    deliveryFee: row.delivery_fee,
    deliveryMethod: row.delivery_method as Order["deliveryMethod"],
    address: row.address ?? "",
    paymentStatus: row.payment_status as Order["paymentStatus"],
    status: row.status as Order["status"],
  }));
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_id, order_date, delivery_method, delivery_fee, address, payment_status, status")
    .order("order_date", { ascending: false });

  if (error) throw error;
  return attachItemsAndCustomers(data ?? []);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_id, order_date, delivery_method, delivery_fee, address, payment_status, status")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  const [order] = await attachItemsAndCustomers([data]);
  return order;
}
