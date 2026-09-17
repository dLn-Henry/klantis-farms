import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllCropCycles } from "@/lib/data/repositories/crop-cycles";

export const metadata: Metadata = { title: "Crops" };

export default async function CropsPage() {
  const cycles = await getAllCropCycles();

  return (
    <>
      <DashboardTopbar title="Crops" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Crop Cycles</h2>
            <p className="text-sm text-ink-soft mt-0.5">Track every crop from planting through harvest.</p>
          </div>
          <button className="btn-solid">
            <Plus size={15} /> New Crop Cycle
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 stroke-ink-soft" />
            <input
              type="text"
              placeholder="Search by crop or field..."
              className="w-full border border-border rounded-lg pl-10 pr-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-green"
            />
          </div>
          <select className="border border-border rounded-lg px-3.5 py-2.5 text-sm bg-white">
            <option>All Status</option>
            <option>Planned</option>
            <option>Planted</option>
            <option>Growing</option>
            <option>Harvesting</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Crop</th>
                <th className="px-5 py-3">Variety</th>
                <th className="px-5 py-3">Field</th>
                <th className="px-5 py-3">Expected Harvest</th>
                <th className="px-5 py-3">Area</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                  <td className="px-5 py-3.5 font-bold">{c.crop}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{c.variety}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{c.field}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{c.expectedHarvest}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{c.area}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/dashboard/crops/${c.id}`} className="text-green font-bold text-xs">
                      View →
                    </Link>
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
