"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { createExpense } from "@/lib/actions/finance";

const inputClass = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";
const CATEGORIES = ["Feed", "Seeds", "Fertilizer", "Veterinary", "Labour", "Fuel", "Transport", "Utilities", "Equipment", "Maintenance", "Marketing", "Packaging", "Other"];
const PAYMENT_METHODS = ["Cash", "Mobile Money", "Bank Transfer", "Card"];

export function NewExpenseForm({ suppliers }: { suppliers: { id: string; name: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createExpense(formData);
      if (result && !result.success) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="max-w-[520px] space-y-5">
      {error && (
        <div className="flex items-center gap-3 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-4 py-3.5">
          <AlertCircle size={18} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className={labelClass}>Category</label>
          <select id="category" name="category" required defaultValue="" className={inputClass}>
            <option value="" disabled>Select</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="amount" className={labelClass}>Amount (GHS)</label>
          <input id="amount" name="amount" type="number" required min="0.01" step="any" className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="expenseDate" className={labelClass}>Date</label>
          <input id="expenseDate" name="expenseDate" type="date" required defaultValue={today} max={today} className={inputClass} />
        </div>
        <div>
          <label htmlFor="paymentMethod" className={labelClass}>Payment Method</label>
          <select id="paymentMethod" name="paymentMethod" defaultValue="" className={inputClass}>
            <option value="">Not specified</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {suppliers.length > 0 && (
        <div>
          <label htmlFor="supplierId" className={labelClass}>Supplier</label>
          <select id="supplierId" name="supplierId" defaultValue="" className={inputClass}>
            <option value="">Not specified</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <input id="description" name="description" placeholder="e.g. Cattle feed — 500kg" className={inputClass} />
      </div>

      <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Add Expense"}
      </button>
    </form>
  );
}
