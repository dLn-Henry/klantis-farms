"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { createAnimal } from "@/lib/actions/animals";

type Species = { id: string; name: string; breeds: { id: string; name: string }[] };

const inputClass = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";

export function NewAnimalForm({ species }: { species: Species[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [speciesId, setSpeciesId] = useState("");
  const breeds = species.find((s) => s.id === speciesId)?.breeds ?? [];
  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createAnimal(formData);
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
        <label htmlFor="tag" className={labelClass}>Tag</label>
        <input id="tag" name="tag" required placeholder="e.g. KLF-0042" className={inputClass} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="speciesId" className={labelClass}>Species</label>
          <select id="speciesId" name="speciesId" required value={speciesId} onChange={(e) => setSpeciesId(e.target.value)} className={inputClass}>
            <option value="" disabled>Select species</option>
            {species.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="breedId" className={labelClass}>Breed</label>
          <select id="breedId" name="breedId" defaultValue="" disabled={breeds.length === 0} className={inputClass}>
            <option value="">{breeds.length === 0 ? "Choose a species first" : "Not specified"}</option>
            {breeds.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sex" className={labelClass}>Sex</label>
          <select id="sex" name="sex" required defaultValue="" className={inputClass}>
            <option value="" disabled>Select</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>
        <div>
          <label htmlFor="dateOfBirth" className={labelClass}>Date of Birth</label>
          <input id="dateOfBirth" name="dateOfBirth" type="date" max={today} className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="weight" className={labelClass}>Weight (kg)</label>
          <input id="weight" name="weight" type="number" min="0" step="0.1" className={inputClass} />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>Location</label>
          <input id="location" name="location" placeholder="e.g. Pen 3" className={inputClass} />
        </div>
      </div>

      <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Add Animal"}
      </button>
    </form>
  );
}
