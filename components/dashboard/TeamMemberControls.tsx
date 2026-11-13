"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { changeMemberRole, setMemberStatus } from "@/lib/actions/team";
import { ASSIGNABLE_ROLES } from "@/lib/data/role-descriptions";
import type { Role, UserStatus } from "@/lib/data/mock/users";

const inputClass = "border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";

export function TeamMemberControls({ memberId, role, status }: { memberId: string; role: Role; status: UserStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Role>(role);

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="bg-white border border-border rounded-md p-5 mb-6">
      <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Manage access</h3>

      {error && (
        <div className="flex items-center gap-2.5 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-3.5 py-3 mb-4">
          <AlertCircle size={16} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={selected} onChange={(e) => setSelected(e.target.value as Role)} disabled={isPending} className={inputClass}>
          {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          disabled={isPending || selected === role}
          onClick={() => run(() => changeMemberRole(memberId, selected))}
          className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : "Change Role"}
        </button>
      </div>

      <button
        disabled={isPending}
        onClick={() => run(() => setMemberStatus(memberId, status === "Suspended" ? "active" : "suspended"))}
        className="inline-flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-sm border border-border text-ink hover:border-[#C62828] hover:text-[#C62828] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "Suspended" ? "Reactivate access" : "Suspend access"}
      </button>
      <p className="text-xs text-ink-soft mt-2">Suspending removes their access to this farm immediately. Their records and history stay.</p>
    </div>
  );
}
