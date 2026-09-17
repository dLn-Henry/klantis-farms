import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllTeamMembers } from "@/lib/data/repositories/users";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const members = await getAllTeamMembers();

  return (
    <>
      <DashboardTopbar title="Users" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Team Members</h2>
            <p className="text-sm text-ink-soft mt-0.5">Who has access to Klantis Farms, and what they can do.</p>
          </div>
          <button className="btn-solid"><UserPlus size={15} /> Invite User</button>
        </div>

        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Role</th>
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
                  <td className="px-5 py-3.5 text-ink-soft">{m.role}</td>
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
