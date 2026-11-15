import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getTeamMemberById } from "@/lib/data/repositories/users";
import { getAccess, can } from "@/lib/auth/access";
import { getRoleCatalog } from "@/lib/data/repositories/roles";
import { summarizePermissions } from "@/lib/data/permission-labels";
import { TeamMemberControls } from "@/components/dashboard/TeamMemberControls";
import { createClient } from "@/lib/supabase/server";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const member = await getTeamMemberById(params.id);
  return { title: member?.name ?? "Team Member" };
}

export default async function UserDetailPage({ params }: Props) {
  const member = await getTeamMemberById(params.id);
  if (!member) return notFound();

  const catalog = await getRoleCatalog();
  // What this person can do = the union of everything their roles grant,
  // read from the same table the database enforces.
  const granted = Array.from(new Set(catalog.filter((r) => member.roles.includes(r.name)).flatMap((r) => r.permissions)));
  const summary = summarizePermissions(granted);

  // Controls are only *shown* to owners, and not for your own row. That is a
  // convenience; the database functions enforce the same rules regardless.
  const supabase = createClient();
  const [access, { data: { user } }] = await Promise.all([getAccess(), supabase.auth.getUser()]);
  const canManage = can(access, "team.assign_roles") && user?.id !== member.userId;

  return (
    <>
      <DashboardTopbar title="Users" />

      <div className="p-6 lg:p-8 max-w-[700px]">
        <Link href="/dashboard/users" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Users
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-extrabold">{member.name}</h2>
          <StatusBadge status={member.status} />
        </div>
        <p className="text-sm text-ink-soft mb-7">{member.email}{member.email ? " · " : ""}{member.roles.join(", ")}</p>

        {canManage && <TeamMemberControls memberId={member.id} roles={member.roles} allRoles={catalog} status={member.status} />}

        <h3 className="text-sm font-extrabold uppercase tracking-wide mb-1">What they can do</h3>
        <p className="text-xs text-ink-soft mb-4">The combined access of {member.roles.length > 1 ? "all their roles" : "their role"}.</p>
        <div className="bg-white border border-border rounded-md overflow-hidden">
          {summary.length === 0 && <p className="px-5 py-4 text-sm text-ink-soft">No permissions.</p>}
          {summary.map((s) => (
            <div key={s.module} className="flex items-start gap-3 px-5 py-3.5 border-b border-border last:border-b-0">
              <CheckCircle2 size={16} className="stroke-green flex-shrink-0 mt-0.5" />
              <span className="text-sm"><b className="font-bold">{s.module}</b> <span className="text-ink-soft">— {s.actions.join(", ")}</span></span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
