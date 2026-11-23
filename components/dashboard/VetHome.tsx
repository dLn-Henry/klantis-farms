import Link from "next/link";
import { Stethoscope, ClipboardCheck, MessageSquareWarning, PawPrint } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getMyOpenAssignments } from "@/lib/data/repositories/vet-portal";
import { getAllVetReports } from "@/lib/data/repositories/vet-reports";

// The veterinarian's home: the health of the animals assigned to them and the
// state of their own reports -- never the farm-wide register.
export async function VetHome({ name }: { name: string }) {
  const [assigned, reports] = await Promise.all([getMyOpenAssignments(), getAllVetReports()]);
  const waiting = reports.filter((r) => r.status === "Submitted" || r.status === "Under Review").length;
  const changes = reports.filter((r) => r.status === "Changes Requested");
  const attention = assigned.filter((a) => ["Sick", "Quarantined"].includes(a.animalStatus));

  const stats = [
    { label: "Animals assigned to you", value: assigned.length, icon: PawPrint },
    { label: "Need attention (sick / quarantined)", value: attention.length, icon: Stethoscope },
    { label: "Reports awaiting review", value: waiting, icon: ClipboardCheck },
    { label: "Reports needing your changes", value: changes.length, icon: MessageSquareWarning },
  ];

  return (
    <>
      <DashboardTopbar title="My Veterinary Work" />
      <div className="p-6 lg:p-8 max-w-[1000px]">
        <h2 className="text-xl font-extrabold tracking-tight">Hello, {name}.</h2>
        <p className="text-sm text-ink-soft mt-1 mb-7">Here&apos;s what needs your attention today.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-border rounded-md p-4">
              <s.icon size={18} className="stroke-green mb-2" />
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs text-ink-soft mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <section className="mb-8">
          <h3 className="text-sm font-extrabold uppercase tracking-wide mb-3">Animals assigned to you</h3>
          {assigned.length === 0 ? (
            <p className="text-sm text-ink-soft bg-white border border-border rounded-md p-5">Nothing assigned right now. A farm manager will assign animals for your next visit.</p>
          ) : (
            <ul className="bg-white border border-border rounded-md divide-y divide-border">
              {assigned.map((a) => (
                <li key={a.id} className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{a.animalTag} <span className="font-normal text-ink-soft">· {[a.species, a.breed].filter(Boolean).join(" · ")}</span> {a.animalStatus && <StatusBadge status={a.animalStatus} />}</p>
                    <p className="text-xs text-ink-soft mt-0.5">{a.reason || "No reason given"}{a.dueDate ? ` · visit by ${new Date(a.dueDate).toLocaleDateString("en-GB")}` : ""}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/veterinary/animals/${a.animalId}`} className="btn-outline !py-1.5 !px-3 !text-xs">Health info</Link>
                    <Link href={`/dashboard/veterinary/new?animal=${a.animalId}`} className="btn-solid !py-1.5 !px-3 !text-xs">Write report</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wide">Your recent reports</h3>
            <Link href="/dashboard/veterinary" className="text-xs font-bold text-green">View all</Link>
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-ink-soft bg-white border border-border rounded-md p-5">You haven&apos;t submitted a report yet.</p>
          ) : (
            <ul className="bg-white border border-border rounded-md divide-y divide-border">
              {reports.slice(0, 5).map((r) => (
                <li key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <Link href={`/dashboard/veterinary/${r.id}`} className="text-sm"><b>{r.code}</b> <span className="text-ink-soft">· {r.animalTag} · {new Date(r.visitDate).toLocaleDateString("en-GB")}</span></Link>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
