"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Ready"
  | "Delivered"
  | "Cancelled";

export type UpdateOrderStatusResult =
  | { success: true }
  | { success: false; error: string };

// Updates order.status (fulfillment progression) only -- never
// payment_status. Payment confirmation is deliberately not something this
// action can do: the database grants only allow status/delivery_method/
// delivery_fee to authenticated users (migration 0008), so a client role
// physically cannot set payment_status even if this action tried to. Real
// payment confirmation happens server-side via a payment-provider webhook
// running as service_role, once that integration exists.
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<UpdateOrderStatusResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to update an order." };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard/orders");

  return { success: true };
}
