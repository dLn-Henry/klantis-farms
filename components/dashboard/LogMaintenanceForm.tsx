"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { logMaintenance } from "@/lib/actions/equipment";

const inputClass = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";

export function LogMaintenanceForm({ equipmentId }: { equipmentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await logMaintenance(formData);
      if (result && !result.success) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="max-w-[480px] space-y-5">
      <input type="hidden" name="equipmentId" value={equipmentId} />
      {error && (
        <div className="flex items-center gap-3 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-4 py-3.5">
          <AlertCircle size={18} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="maintenanceType" className={labelClass}>Type</label>
        <input id="maintenanceType" name="maintenanceType" required placeholder="e.g. Oil change" className={inputClass} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="maintenanceDate" className={labelClass}>Date</label>
          <input id="maintenanceDate" name="maintenanceDate" type="date" required defaultValue={today} max={today} className={inputClass} />
        </div>
        <div>
          <label htmlFor="cost" className={labelClass}>Cost (GHS)</label>
          <input id="cost" name="cost" type="number" min="0" step="any" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>Notes</label>
        <textarea id="notes" name="notes" rows={3} className={inputClass} />
      </div>

      <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Log Maintenance"}
      </button>
    </form>
  );
}
