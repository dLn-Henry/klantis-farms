"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { createSupplier } from "@/lib/actions/suppliers";

const inputClass = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";
const CATEGORIES = ["Feed", "Fertilizer", "Equipment", "Packaging", "Veterinary Supplies"];

export function NewSupplierForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createSupplier(formData);
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

      <div>
        <label htmlFor="name" className={labelClass}>Supplier Name</label>
        <input id="name" name="name" required placeholder="e.g. Ghana Feed Co." className={inputClass} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className={labelClass}>Category</label>
          <select id="category" name="category" defaultValue="" className={inputClass}>
            <option value="">Not specified</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="contactPerson" className={labelClass}>Contact Person</label>
          <input id="contactPerson" name="contactPerson" className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input id="phone" name="phone" type="tel" className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" name="email" type="email" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="paymentTerms" className={labelClass}>Payment Terms</label>
        <input id="paymentTerms" name="paymentTerms" placeholder="e.g. Net 30" className={inputClass} />
      </div>

      <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Add Supplier"}
      </button>
    </form>
  );
}
