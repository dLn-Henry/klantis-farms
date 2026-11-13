import { createClient } from "@/lib/supabase/server";
import type { Expense, IncomeRecord } from "@/lib/data/mock/finance";

export async function getAllExpenses(): Promise<Expense[]> {
  const supabase = createClient();
  const [{ data: rows, error }, { data: suppliers }] = await Promise.all([
    supabase
      .from("expenses")
      .select("id, category, amount, expense_date, supplier_id, description, payment_method")
      .order("expense_date", { ascending: false }),
    supabase.from("suppliers").select("id, name"),
  ]);
  if (error) throw error;
  const supplierMap = new Map((suppliers ?? []).map((s) => [s.id, s.name]));

  return (rows ?? []).map((r) => ({
    id: r.id,
    category: r.category,
    amount: r.amount,
    date: r.expense_date,
    supplierId: r.supplier_id ?? undefined,
    supplierName: (r.supplier_id && supplierMap.get(r.supplier_id)) || undefined,
    description: r.description ?? "",
    paymentMethod: r.payment_method ?? "—",
  }));
}

export async function getAllIncome(): Promise<IncomeRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("income_records")
    .select("id, category, amount, income_date, source, description")
    .order("income_date", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    category: r.category,
    amount: r.amount,
    date: r.income_date,
    source: r.source ?? "—",
    description: r.description ?? "",
  }));
}
