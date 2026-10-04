"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import { friendlyDbError } from "@/lib/actions/errors";

export type FinanceActionResult = { success: false; error: string };

export async function createExpense(formData: FormData): Promise<FinanceActionResult> {
  const category = String(formData.get("category") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "").trim());
  const expenseDate = String(formData.get("expenseDate") ?? "").trim();
  const supplierId = String(formData.get("supplierId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "").trim();

  if (!category) return { success: false, error: "Choose a category." };
  if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: "Amount must be greater than zero." };
  if (!expenseDate) return { success: false, error: "Enter the date." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in to log an expense." };

  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const { error } = await supabase.from("expenses").insert({
    farm_id: farmId,
    category,
    amount,
    expense_date: expenseDate,
    supplier_id: supplierId || null,
    description: description || null,
    payment_method: paymentMethod || null,
    created_by: user.id,
  });

  if (error) return { success: false, error: friendlyDbError(error) };

  revalidatePath("/dashboard/finance");
  redirect("/dashboard/finance");
}

export async function createIncome(formData: FormData): Promise<FinanceActionResult> {
  const category = String(formData.get("category") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "").trim());
  const incomeDate = String(formData.get("incomeDate") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!category) return { success: false, error: "Choose a category." };
  if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: "Amount must be greater than zero." };
  if (!incomeDate) return { success: false, error: "Enter the date." };

  const supabase = createClient();
  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const { error } = await supabase.from("income_records").insert({
    farm_id: farmId,
    category,
    amount,
    income_date: incomeDate,
    source: source || null,
    description: description || null,
  });

  if (error) return { success: false, error: friendlyDbError(error) };

  revalidatePath("/dashboard/finance");
  redirect("/dashboard/finance");
}
