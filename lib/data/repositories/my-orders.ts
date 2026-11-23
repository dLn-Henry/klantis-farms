import { createClient } from "@/lib/supabase/server";

export type MyOrder = {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  paymentStatus: string;
  deliveryMethod: string;
  itemCount: number;
  total: number;
  items: { name: string; quantity: number; unitPrice: number }[];
};

// The signed-in customer's own orders. No filter by user needed: the database
// (orders_self_select) only ever returns rows that belong to them.
export async function getMyOrders(limit = 50): Promise<MyOrder[]> {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, order_date, status, payment_status, delivery_method, delivery_fee")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!orders || orders.length === 0) return [];

  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, product_name_snapshot, quantity, unit_price")
    .in("order_id", orders.map((o) => o.id));

  return orders.map((o) => {
    const lines = (items ?? []).filter((i) => i.order_id === o.id)
      .map((i) => ({ name: i.product_name_snapshot, quantity: Number(i.quantity), unitPrice: Number(i.unit_price) }));
    const subtotal = lines.reduce((n, l) => n + l.quantity * l.unitPrice, 0);
    return {
      id: o.id, orderNumber: o.order_number, date: o.order_date, status: o.status,
      paymentStatus: o.payment_status, deliveryMethod: o.delivery_method,
      itemCount: lines.reduce((n, l) => n + l.quantity, 0),
      total: subtotal + Number(o.delivery_fee ?? 0), items: lines,
    };
  });
}
