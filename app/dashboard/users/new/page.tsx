import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { NewTeamMemberForm } from "@/components/dashboard/NewTeamMemberForm";
import { getMyRoleName } from "@/lib/data/current-farm";

export const metadata: Metadata = { title: "Add Team Member" };

export default async function NewTeamMemberPage() {
  const myRole = await getMyRoleName();

  return (
    <>
      <DashboardTopbar title="Users" />
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/users" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Users
        </Link>
        <h2 className="text-lg font-extrabold mb-1">Add Team Member</h2>
        {myRole === "Farm Owner" ? (
          <>
            <p className="text-sm text-ink-soft mb-7">Give someone with an existing account access to this farm.</p>
            <NewTeamMemberForm />
          </>
        ) : (
          <p className="text-sm text-ink-soft">Only a Farm Owner can add team members.</p>
        )}
      </div>
    </>
  );
}
