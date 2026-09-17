import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllEquipment } from "@/lib/data/repositories/equipment";

export const metadata: Metadata = { title: "Equipment" };

export default async function EquipmentPage() {
  const equipment = await getAllEquipment();

  return (
    <>
      <DashboardTopbar title="Equipment" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Equipment</h2>
            <p className="text-sm text-ink-soft mt-0.5">Farm machinery and tools, and their service history.</p>
          </div>
          <button className="btn-solid"><Plus size={15} /> Add Equipment</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipment.map((eq) => (
            <Link key={eq.id} href={`/dashboard/equipment/${eq.id}`} className="bg-white border border-border rounded-md p-5 block hover:border-green transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-ink-soft">{eq.code}</span>
                <StatusBadge status={eq.status} />
              </div>
              <h3 className="text-base font-extrabold">{eq.name}</h3>
              <p className="text-sm text-ink-soft mt-1">{eq.manufacturer} {eq.model}</p>
              <div className="flex gap-4 mt-4 pt-4 border-t border-border text-xs text-ink-soft">
                <span>{eq.location}</span>
                <span>Condition: {eq.condition}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
