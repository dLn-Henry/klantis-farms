import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllTeamMembers } from "@/lib/data/repositories/users";
import { getAccess, can } from "@/lib/auth/access";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const [members, access] = await Promise.all([getAllTeamMembers(), getAccess()]);
  const canAssign = can(access, "team.assign_roles");

  return (
    <>
      <DashboardTopbar title="Users" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Team Members</h2>
            <p className="text-sm text-ink-soft mt-0.5">Who has access to this farm, and which roles they hold.</p>
          </div>
          {canAssign && (
            <Link href="/dashboard/users/new" className="btn-solid"><UserPlus size={15} /> Add Team Member</Link>
          )}
        </div>

        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Roles</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                  <td className="px-5 py-3.5">
                    <b className="font-bold block">{m.name}</b>
                    <span className="text-xs text-ink-soft">{m.email}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {m.roles.map((r) => (
                        <span key={r} className="text-[11px] font-bold bg-mist text-green px-2 py-0.5 rounded">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft">{m.joinedDate}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={m.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/dashboard/users/${m.id}`} className="text-green font-bold text-xs">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
