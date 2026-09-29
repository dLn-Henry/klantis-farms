import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { NewHarvestForm } from "@/components/dashboard/NewHarvestForm";
import { getAllCropCycles } from "@/lib/data/repositories/crop-cycles";

export const metadata: Metadata = { title: "Record Harvest" };

export default async function NewHarvestPage() {
  const cycles = await getAllCropCycles();
  return (
    <>
      <DashboardTopbar title="Harvests" />
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/harvests" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Harvests
        </Link>
        <h2 className="text-lg font-extrabold mb-1">Record Harvest</h2>
        <p className="text-sm text-ink-soft mb-7">Log what came in from a crop cycle.</p>
        <NewHarvestForm cycles={cycles.map((c) => ({ id: c.id, label: `${c.crop} — ${c.field} (${c.code})` }))} />
      </div>
    </>
  );
}
