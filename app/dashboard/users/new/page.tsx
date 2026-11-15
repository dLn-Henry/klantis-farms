import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { NewTeamMemberForm } from "@/components/dashboard/NewTeamMemberForm";
import { getAccess, can } from "@/lib/auth/access";
import { getRoleCatalog } from "@/lib/data/repositories/roles";

export const metadata: Metadata = { title: "Add Team Member" };

export default async function NewTeamMemberPage() {
  const [access, roles] = await Promise.all([getAccess(), getRoleCatalog()]);

  return (
    <>
      <DashboardTopbar title="Users" />
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/users" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Users
        </Link>
        <h2 className="text-lg font-extrabold mb-1">Add Team Member</h2>
        {can(access, "team.assign_roles") ? (
          <>
            <p className="text-sm text-ink-soft mb-7">Give someone with an existing account access to this farm.</p>
            <NewTeamMemberForm roles={roles} />
          </>
        ) : (
          <p className="text-sm text-ink-soft">Only a Farm Owner can add team members.</p>
        )}
      </div>
    </>
  );
}
