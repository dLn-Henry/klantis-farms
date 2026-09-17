import type { Metadata } from "next";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllVetReports } from "@/lib/data/repositories/vet-reports";

export const metadata: Metadata = { title: "Veterinary" };

export default async function VeterinaryPage() {
  const reports = await getAllVetReports();
  const pending = reports.filter((r) => r.status === "Under Review" || r.status === "Submitted");

  return (
    <>
      <DashboardTopbar title="Veterinary" />

      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold">Veterinary Reports</h2>
          <p className="text-sm text-ink-soft mt-0.5">Professional submissions become official animal records only after review.</p>
        </div>

        {pending.length > 0 && (
          <div className="flex items-center gap-3 bg-[#FDF3E3] border border-[#F0DBAF] rounded-md px-4 py-3.5 mb-6">
            <Stethoscope size={18} className="stroke-gold flex-shrink-0" />
            <span className="text-sm font-semibold">
              {pending.length} report{pending.length > 1 ? "s" : ""} awaiting your review
            </span>
          </div>
        )}

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
      </div>
    </>
  );
}
