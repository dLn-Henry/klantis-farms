"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { recordHarvest } from "@/lib/actions/harvests";

const inputClass = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";

export function NewHarvestForm({ cycles }: { cycles: { id: string; label: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await recordHarvest(formData);
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
        <label htmlFor="cropCycleId" className={labelClass}>Crop</label>
        <select id="cropCycleId" name="cropCycleId" required defaultValue="" className={inputClass}>
          <option value="" disabled>Select a crop cycle</option>
          {cycles.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="harvestDate" className={labelClass}>Harvest Date</label>
          <input id="harvestDate" name="harvestDate" type="date" required defaultValue={today} max={today} className={inputClass} />
        </div>
        <div className="grid grid-cols-[1fr_110px] gap-3">
          <div>
            <label htmlFor="quantity" className={labelClass}>Quantity</label>
            <input id="quantity" name="quantity" type="number" required min="0.01" step="any" className={inputClass} />
          </div>
          <div>
            <label htmlFor="unit" className={labelClass}>Unit</label>
            <select id="unit" name="unit" required defaultValue="kg" className={inputClass}>
              <option value="kg">kg</option>
              <option value="tonnes">tonnes</option>
              <option value="bags">bags</option>
              <option value="crates">crates</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="qualityGrade" className={labelClass}>Quality Grade</label>
          <input id="qualityGrade" name="qualityGrade" placeholder="e.g. Grade A" className={inputClass} />
        </div>
        <div>
          <label htmlFor="destination" className={labelClass}>Destination</label>
          <input id="destination" name="destination" placeholder="e.g. Cold Room" className={inputClass} />
        </div>
      </div>

      <p className="text-xs text-ink-soft">
        A recorded harvest is reviewed before it is approved. Someone other than the person who recorded it has to approve it.
      </p>

      <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Record Harvest"}
      </button>
    </form>
  );
}
