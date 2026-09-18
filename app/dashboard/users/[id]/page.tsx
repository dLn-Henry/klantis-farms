import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getTeamMemberById } from "@/lib/data/repositories/users";
import { ROLE_PERMISSIONS } from "@/lib/data/mock/users";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const member = await getTeamMemberById(params.id);
  return { title: member?.name ?? "Team Member" };
}

export default async function UserDetailPage({ params }: Props) {
  const member = await getTeamMemberById(params.id);
  if (!member) return notFound();

  const permissions = ROLE_PERMISSIONS[member.role];

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
        <p className="text-sm text-ink-soft mb-7">{member.email} · {member.role}</p>

        <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Permissions — {member.role}</h3>
        <div className="bg-white border border-border rounded-md overflow-hidden">
          {permissions.map((p, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-border last:border-b-0">
              <CheckCircle2 size={16} className="stroke-green flex-shrink-0" />
              <span className="text-sm font-semibold">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
