"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import { friendlyDbError } from "@/lib/actions/errors";

export type LogMovementResult = { success: false; error: string };

const OUTFLOW = new Set(["Sale", "Consumption"]);

// Records a stock movement. The signed change, stock-can't-go-negative
// check, and attribution are all enforced by the database (migrations
// 0003, 0012) -- this only turns "type + a positive amount the person
// typed" into the signed quantity_change the ledger actually stores, and
// relays whatever the database decides.
export async function logInventoryTransaction(formData: FormData): Promise<LogMovementResult> {
  const itemId = String(formData.get("itemId") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const amountRaw = Number(String(formData.get("amount") ?? "").trim());
  const reference = String(formData.get("reference") ?? "").trim();

  if (!itemId) return { success: false, error: "Choose which item this movement is for." };
  if (!type) return { success: false, error: "Choose a movement type." };
  if (!Number.isFinite(amountRaw) || amountRaw <= 0) return { success: false, error: "Enter an amount greater than zero." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in to log a movement." };

  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const quantityChange = OUTFLOW.has(type) ? -Math.abs(amountRaw) : Math.abs(amountRaw);

  const { error } = await supabase.from("inventory_transactions").insert({
    farm_id: farmId,
    inventory_item_id: itemId,
    transaction_type: type,
    quantity_change: quantityChange,
    reference: reference || null,
    created_by: user.id,
  });

  if (error) return { success: false, error: friendlyDbError(error) };

  revalidatePath(`/dashboard/inventory/${itemId}`);
  revalidatePath("/dashboard/inventory");
  redirect(`/dashboard/inventory/${itemId}`);
}
