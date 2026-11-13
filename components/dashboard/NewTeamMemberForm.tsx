"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { addTeamMember } from "@/lib/actions/team";
import { ASSIGNABLE_ROLES } from "@/lib/data/role-descriptions";

const inputClass = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";

export function NewTeamMemberForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addTeamMember(formData);
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
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" required placeholder="name@example.com" className={inputClass} />
        <p className="text-xs text-ink-soft mt-1.5">They need to have created an account first. This doesn't send an email.</p>
      </div>

      <div>
        <label htmlFor="role" className={labelClass}>Role</label>
        <select id="role" name="role" required defaultValue="Farm Worker" className={inputClass}>
          {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Add Team Member"}
      </button>
    </form>
  );
}
