"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { submitVetReport } from "@/lib/actions/vet-reports";

const inputClass =
  "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";

export function NewVetReportForm({ animals }: { animals: { id: string; tag: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitVetReport(formData);
      // On success the action redirects, so this only runs on failure.
      if (result && !result.success) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="max-w-[640px] space-y-5">
      {error && (
        <div className="flex items-center gap-3 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-4 py-3.5">
          <AlertCircle size={18} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="animalId" className={labelClass}>Animal</label>
          <select id="animalId" name="animalId" required defaultValue="" className={inputClass}>
            <option value="" disabled>Select an animal</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>{a.tag}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="visitDate" className={labelClass}>Visit Date</label>
          <input id="visitDate" name="visitDate" type="date" required defaultValue={today} max={today} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="reason" className={labelClass}>Reason for Visit</label>
        <input id="reason" name="reason" required placeholder="e.g. Routine health check" className={inputClass} />
      </div>

      <div>
        <label htmlFor="findings" className={labelClass}>Findings</label>
        <textarea id="findings" name="findings" required rows={4} className={inputClass} />
      </div>

      <div>
        <label htmlFor="diagnosis" className={labelClass}>Diagnosis</label>
        <textarea id="diagnosis" name="diagnosis" rows={2} className={inputClass} />
      </div>

      <div>
        <label htmlFor="treatmentPlan" className={labelClass}>Treatment Plan</label>
        <textarea id="treatmentPlan" name="treatmentPlan" rows={3} className={inputClass} />
      </div>

      <p className="text-xs text-ink-soft">
        Submitting sends this report for review. It becomes an official record only once a Farm Owner or Farm Manager approves it.
      </p>

      <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Submit Report"}
      </button>
    </form>
  );
}
