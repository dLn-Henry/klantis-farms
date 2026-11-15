"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { changeMemberRoles, setMemberStatus } from "@/lib/actions/team";
import { RolePicker } from "@/components/dashboard/RolePicker";
import type { RoleInfo } from "@/lib/data/repositories/roles";
import type { UserStatus } from "@/lib/data/mock/users";

export function TeamMemberControls({
  memberId, roles, allRoles, status,
}: { memberId: string; roles: string[]; allRoles: RoleInfo[]; status: UserStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(roles);
  const unchanged = selected.length === roles.length && selected.every((r) => roles.includes(r));

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) { setError(result.error ?? "Something went wrong."); return; }
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

      <RolePicker roles={allRoles} value={selected} onChange={setSelected} disabled={isPending} />

      <div className="flex flex-wrap items-center gap-3 mt-4 mb-6">
        <button
          disabled={isPending || unchanged || selected.length === 0}
          onClick={() => run(() => changeMemberRoles(memberId, selected))}
          className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : "Save roles"}
        </button>
        {selected.length === 0 && <span className="text-xs text-[#C62828] font-semibold">Choose at least one role.</span>}
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
