import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllAnimals } from "@/lib/data/repositories/animals";

export const metadata: Metadata = { title: "Livestock" };

export default async function LivestockPage() {
  const animals = await getAllAnimals();

  return (
    <>
      <DashboardTopbar title="Livestock" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Animals</h2>
            <p className="text-sm text-ink-soft mt-0.5">Manage and monitor animals across the farm.</p>
          </div>
          <button className="btn-solid">
            <Plus size={15} /> Add Animal
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 stroke-ink-soft" />
            <input
              type="text"
              placeholder="Search by tag..."
              className="w-full border border-border rounded-lg pl-10 pr-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-green"
            />
          </div>
          <select className="border border-border rounded-lg px-3.5 py-2.5 text-sm bg-white">
            <option>All Species</option>
            <option>Cattle</option>
          </select>
          <select className="border border-border rounded-lg px-3.5 py-2.5 text-sm bg-white">
            <option>All Status</option>
            <option>Active</option>
            <option>Sick</option>
            <option>Pregnant</option>
            <option>Quarantined</option>
          </select>
        </div>

        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Tag</th>
                <th className="px-5 py-3">Breed</th>
                <th className="px-5 py-3">Sex</th>
                <th className="px-5 py-3">Age</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {animals.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                  <td className="px-5 py-3.5 font-bold">{a.tag}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{a.breed}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{a.sex}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{a.ageLabel}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{a.location}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/dashboard/livestock/${a.id}`} className="text-green font-bold text-xs">
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
