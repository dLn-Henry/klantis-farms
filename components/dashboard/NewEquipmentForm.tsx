"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { createEquipment } from "@/lib/actions/equipment";

const inputClass = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";

export function NewEquipmentForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createEquipment(formData);
      if (result && !result.success) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="max-w-[560px] space-y-5">
      {error && (
        <div className="flex items-center gap-3 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-4 py-3.5">
          <AlertCircle size={18} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>Name</label>
        <input id="name" name="name" required placeholder="e.g. Tractor #2" className={inputClass} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className={labelClass}>Category</label>
          <input id="category" name="category" placeholder="e.g. Tractor" className={inputClass} />
        </div>
        <div>
          <label htmlFor="condition" className={labelClass}>Condition</label>
          <select id="condition" name="condition" defaultValue="Good" className={inputClass}>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Needs Repair">Needs Repair</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="manufacturer" className={labelClass}>Manufacturer</label>
          <input id="manufacturer" name="manufacturer" className={inputClass} />
        </div>
        <div>
          <label htmlFor="model" className={labelClass}>Model</label>
          <input id="model" name="model" className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="purchaseDate" className={labelClass}>Purchase Date</label>
          <input id="purchaseDate" name="purchaseDate" type="date" max={today} className={inputClass} />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>Location</label>
          <input id="location" name="location" placeholder="e.g. Equipment Shed" className={inputClass} />
        </div>
      </div>

      <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Add Equipment"}
      </button>
    </form>
  );
}
