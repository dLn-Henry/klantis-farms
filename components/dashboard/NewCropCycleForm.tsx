"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { createCropCycle } from "@/lib/actions/crop-cycles";

const inputClass = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";

type Option = { id: string; name: string };

export function NewCropCycleForm({ fields, cropTypes }: { fields: Option[]; cropTypes: Option[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCropCycle(formData);
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

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fieldId" className={labelClass}>Field</label>
          <select id="fieldId" name="fieldId" required defaultValue="" className={inputClass}>
            <option value="" disabled>Select a field</option>
            {fields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cropTypeId" className={labelClass}>Crop</label>
          <select id="cropTypeId" name="cropTypeId" required defaultValue="" className={inputClass}>
            <option value="" disabled>Select a crop</option>
            {cropTypes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="variety" className={labelClass}>Variety</label>
          <input id="variety" name="variety" placeholder="e.g. Obatanpa" className={inputClass} />
        </div>
        <div>
          <label htmlFor="season" className={labelClass}>Season</label>
          <input id="season" name="season" placeholder="e.g. Major 2026" className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="plantingDate" className={labelClass}>Planting Date</label>
          <input id="plantingDate" name="plantingDate" type="date" className={inputClass} />
        </div>
        <div>
          <label htmlFor="expectedHarvestDate" className={labelClass}>Expected Harvest</label>
          <input id="expectedHarvestDate" name="expectedHarvestDate" type="date" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="area" className={labelClass}>Area</label>
        <input id="area" name="area" placeholder="e.g. 2.5 acres" className={inputClass} />
      </div>

      <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Create Crop Cycle"}
      </button>
    </form>
  );
}
