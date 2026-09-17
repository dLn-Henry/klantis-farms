export type Expense = {
  id: string;
  category: string;
  amount: number;
  date: string;
  supplierId?: string;
  supplierName?: string;
  description: string;
  paymentMethod: string;
};

export type IncomeRecord = {
  id: string;
  category: string;
  amount: number;
  date: string;
  source: string;
  description: string;
};

export const expenses: Expense[] = [
  { id: "exp-001", category: "Feed", amount: 2100, date: "2026-08-01", supplierId: "sup-eastern-feed", supplierName: "Eastern Feed Co.", description: "Cattle feed — 500kg", paymentMethod: "Bank Transfer" },
  { id: "exp-002", category: "Packaging", amount: 850, date: "2026-07-01", supplierId: "sup-accra-packaging", supplierName: "Accra Packaging Ltd.", description: "Produce crates — 100 pieces", paymentMethod: "Mobile Money" },
  { id: "exp-003", category: "Fertilizer", amount: 1650, date: "2026-04-15", supplierId: "sup-ghana-agrochem", supplierName: "Ghana AgroChem", description: "NPK fertilizer — 300kg", paymentMethod: "Bank Transfer" },
  { id: "exp-004", category: "Equipment Maintenance", amount: 820, date: "2026-02-20", description: "Tractor hydraulic hose replacement", paymentMethod: "Cash" },
  { id: "exp-005", category: "Labour", amount: 3200, date: "2026-08-05", description: "Farm staff wages — August", paymentMethod: "Bank Transfer" },
  { id: "exp-006", category: "Veterinary", amount: 640, date: "2026-02-20", supplierId: "sup-koforidua-vet", supplierName: "Koforidua Veterinary Supplies", description: "Vaccination supplies", paymentMethod: "Cash" },
];

export const incomeRecords: IncomeRecord[] = [
  { id: "inc-001", category: "Product Sales", amount: 240, date: "2026-08-18", source: "Order KF-1058", description: "Mango & maize order" },
  { id: "inc-002", category: "Product Sales", amount: 120, date: "2026-08-18", source: "Order KF-1057", description: "Mango order" },
  { id: "inc-003", category: "Product Sales", amount: 218, date: "2026-08-17", source: "Order KF-1056", description: "Cashew & yam order" },
  { id: "inc-004", category: "Product Sales", amount: 60, date: "2026-08-16", source: "Order KF-1055", description: "Sliced mango pack order" },
  { id: "inc-005", category: "Livestock Sales", amount: 4200, date: "2026-07-22", source: "Direct sale", description: "2 head of cattle sold" },
];

export function totalExpenses(): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function totalIncome(): number {
  return incomeRecords.reduce((sum, i) => sum + i.amount, 0);
}
