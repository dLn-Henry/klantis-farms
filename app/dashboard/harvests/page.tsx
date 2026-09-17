import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllHarvests } from "@/lib/data/repositories/harvests";

export const metadata: Metadata = { title: "Harvests" };

export default async function HarvestsPage() {
  const harvests = await getAllHarvests();

  return (
    <>
      <DashboardTopbar title="Harvests" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Harvests</h2>
            <p className="text-sm text-ink-soft mt-0.5">Every harvest recorded, and where it went.</p>
          </div>
          <button className="btn-solid"><Plus size={15} /> Record Harvest</button>
        </div>

        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Batch</th>
                <th className="px-5 py-3">Crop</th>
                <th className="px-5 py-3">Field</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {harvests.map((h) => (
                <tr key={h.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                  <td className="px-5 py-3.5 font-bold">{h.code}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{h.crop}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{h.field}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{h.date}</td>
                  <td className="px-5 py-3.5 font-semibold">{h.quantity}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{h.qualityGrade}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={h.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/dashboard/harvests/${h.id}`} className="text-green font-bold text-xs">View →</Link>
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
