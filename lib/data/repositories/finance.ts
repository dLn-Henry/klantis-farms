import { expenses, incomeRecords, type Expense, type IncomeRecord } from "@/lib/data/mock/finance";

export async function getAllExpenses(): Promise<Expense[]> {
  return expenses;
}

export async function getAllIncome(): Promise<IncomeRecord[]> {
  return incomeRecords;
}
