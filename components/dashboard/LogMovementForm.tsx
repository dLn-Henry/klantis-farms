"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { logInventoryTransaction } from "@/lib/actions/inventory";

const inputClass = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";
const TYPES = ["Purchase", "Harvest", "Consumption", "Sale", "Adjustment"] as const;
const OUTFLOW = new Set<string>(["Sale", "Consumption"]);

type Item = { id: string; name: string; unit: string; quantity: number };

export function LogMovementForm({ items, preselectedId }: { items: Item[]; preselectedId?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [itemId, setItemId] = useState(preselectedId ?? "");
  const [type, setType] = useState<string>("Purchase");
  const selected = items.find((i) => i.id === itemId);
  const locked = !!preselectedId;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await logInventoryTransaction(formData);
      if (result && !result.success) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="max-w-[480px] space-y-5">
      {error && (
        <div className="flex items-center gap-3 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-4 py-3.5">
          <AlertCircle size={18} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="itemId" className={labelClass}>Item</label>
        <select
          id="itemId" name="itemId" required disabled={locked}
          value={itemId} onChange={(e) => setItemId(e.target.value)}
          className={`${inputClass} ${locked ? "opacity-70" : ""}`}
        >
          <option value="" disabled>Select an item</option>
          {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.quantity.toLocaleString()} {i.unit} on hand)</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="type" className={labelClass}>Movement Type</label>
        <select id="type" name="type" required value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="amount" className={labelClass}>
          Amount {selected && `(${selected.unit})`} — {OUTFLOW.has(type) ? "removed from stock" : "added to stock"}
        </label>
        <input id="amount" name="amount" type="number" required min="0.01" step="any" className={inputClass} />
      </div>

      <div>
        <label htmlFor="reference" className={labelClass}>Reference</label>
        <input id="reference" name="reference" placeholder="e.g. Invoice #, supplier name" className={inputClass} />
      </div>

      <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Log Movement"}
      </button>
    </form>
  );
}
