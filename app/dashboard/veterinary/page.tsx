import type { Metadata } from "next";
import Link from "next/link";
import { Stethoscope, Plus } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllVetReports } from "@/lib/data/repositories/vet-reports";
import { getAccess, can } from "@/lib/auth/access";
import { getAllAnimals } from "@/lib/data/repositories/animals";
import { getMyOpenAssignments, getOpenAssignments, getVetCandidates } from "@/lib/data/repositories/vet-portal";
import { AssignVetPanel } from "@/components/dashboard/AssignVetForm";

export const metadata: Metadata = { title: "Veterinary" };

export default async function VeterinaryPage() {
  const access = await getAccess();
  const canReview = can(access, "veterinary.review");
  const canAssign = can(access, "veterinary.assign");
  const canCreate = can(access, "veterinary.create");

  // Row-level security decides what each person gets: a vet receives only
  // their own reports and assigned animals; managers receive everything.
  const [reports, mine, open, vets, animals] = await Promise.all([
    getAllVetReports(),
    canCreate && !canAssign ? getMyOpenAssignments() : Promise.resolve([]),
    canAssign ? getOpenAssignments() : Promise.resolve([]),
    canAssign ? getVetCandidates() : Promise.resolve([]),
    canAssign ? getAllAnimals() : Promise.resolve([]),
  ]);
  const pending = reports.filter((r) => r.status === "Under Review" || r.status === "Submitted");

  return (
    <>
      <DashboardTopbar title="Veterinary" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">{canReview ? "Veterinary Reports" : "My Veterinary Work"}</h2>
            <p className="text-sm text-ink-soft mt-0.5">{canReview ? "Professional submissions become official animal records only after review." : "The animals assigned to you and the reports you have submitted."}</p>
          </div>
          {canCreate && (
            <Link href="/dashboard/veterinary/new" className="btn-solid">
              <Plus size={15} /> Submit Report
            </Link>
          )}
        </div>

        {canReview && pending.length > 0 && (
          <div className="flex items-center gap-3 bg-[#FDF3E3] border border-[#F0DBAF] rounded-md px-4 py-3.5 mb-6">
            <Stethoscope size={18} className="stroke-gold flex-shrink-0" />
            <span className="text-sm font-semibold">
              {pending.length} report{pending.length > 1 ? "s" : ""} awaiting your review
            </span>
          </div>
        )}

        {canAssign && <AssignVetPanel vets={vets} animals={animals.map((a) => ({ id: a.id, tag: a.tag }))} open={open} />}

        {canCreate && !canAssign && (
          <section className="bg-white border border-border rounded-md p-5 mb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wide mb-3">Assigned to you ({mine.length})</h3>
            {mine.length === 0 ? (
              <p className="text-sm text-ink-soft">Nothing assigned right now. A farm manager will assign the animals for your next visit.</p>
            ) : (
              <ul className="divide-y divide-border">
                {mine.map((a) => (
                  <li key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">{a.animalTag} <span className="font-normal text-ink-soft">· {[a.species, a.breed].filter(Boolean).join(" · ")}</span></p>
                      <p className="text-xs text-ink-soft">{a.reason || "No reason given"}{a.dueDate ? ` · visit by ${new Date(a.dueDate).toLocaleDateString("en-GB")}` : ""}</p>
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
        )}

        {reports.length === 0 ? (
          <div className="bg-white border border-border rounded-md p-8 text-center text-sm text-ink-soft">No reports yet.</div>
        ) : (
        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Report</th>
                <th className="px-5 py-3">Animal</th>
                <th className="px-5 py-3">Submitted By</th>
                <th className="px-5 py-3">Visit Date</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                  <td className="px-5 py-3.5 font-bold">{r.code}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{r.animalTag}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{r.submittedBy}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{r.visitDate}</td>
                  <td className="px-5 py-3.5 text-ink-soft max-w-[220px] truncate">{r.reason}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/dashboard/veterinary/${r.id}`} className="text-green font-bold text-xs">Review →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </>
  );
}