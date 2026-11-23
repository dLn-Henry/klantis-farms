"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, X } from "lucide-react";
import { assignVetVisit, cancelVetAssignment } from "@/lib/actions/vet-reports";
import type { Assignment } from "@/lib/data/repositories/vet-portal";

const input = "w-full border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const label = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";

export function AssignVetPanel({
  vets, animals, open,
}: { vets: { id: string; name: string }[]; animals: { id: string; tag: string }[]; open: Assignment[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="bg-white border border-border rounded-md p-5 mb-6">
      <h3 className="text-sm font-extrabold uppercase tracking-wide mb-1">Assign a veterinarian</h3>
      <p className="text-xs text-ink-soft mb-4">A vet can only see the animals you assign to them, and only until they submit their report.</p>

      {error && <div className="flex items-center gap-2 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-3 py-2.5 mb-3 text-xs font-semibold text-[#C62828]" role="alert"><AlertCircle size={14} /> {error}</div>}

      {vets.length === 0 ? (
        <p className="text-sm text-ink-soft">No team member has the Veterinarian role yet. Add one from Users.</p>
      ) : (
        <form
          action={(fd) => { setError(null); start(async () => { const r = await assignVetVisit(fd); if (!r.success) setError(r.error); else router.refresh(); }); }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
        >
          <div><label className={label} htmlFor="vetId">Veterinarian</label>
            <select id="vetId" name="vetId" required defaultValue="" className={input}><option value="" disabled>Choose…</option>{vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
          <div><label className={label} htmlFor="animalId">Animal</label>
            <select id="animalId" name="animalId" required defaultValue="" className={input}><option value="" disabled>Choose…</option>{animals.map((a) => <option key={a.id} value={a.id}>{a.tag}</option>)}</select></div>
          <div><label className={label} htmlFor="dueDate">Visit by</label><input id="dueDate" name="dueDate" type="date" className={input} /></div>
          <div><label className={label} htmlFor="reason">Reason</label><input id="reason" name="reason" maxLength={500} placeholder="e.g. Limping" className={input} /></div>
          <button type="submit" disabled={pending} className="btn-solid sm:col-span-2 lg:col-span-4 justify-self-start disabled:opacity-60">{pending ? <Loader2 size={15} className="animate-spin" /> : "Assign"}</button>
        </form>
      )}

      {open.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-ink-soft mb-2">Open assignments</h4>
          <ul className="divide-y divide-border">
            {open.map((a) => (
              <li key={a.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <span><b>{a.animalTag}</b> → {a.vetName}{a.reason ? <span className="text-ink-soft"> · {a.reason}</span> : null}{a.dueDate ? <span className="text-ink-soft"> · by {new Date(a.dueDate).toLocaleDateString("en-GB")}</span> : null}</span>
                <button onClick={() => start(async () => { const r = await cancelVetAssignment(a.id); if (!r.success) setError(r.error); else router.refresh(); })} disabled={pending} className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-[#C62828]"><X size={13} /> Cancel</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
