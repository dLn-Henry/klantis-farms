import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { NewCropCycleForm } from "@/components/dashboard/NewCropCycleForm";
import { getAllFields } from "@/lib/data/repositories/fields";
import { getCropTypeOptions } from "@/lib/data/repositories/crop-cycles";

export const metadata: Metadata = { title: "New Crop Cycle" };

export default async function NewCropCyclePage() {
  const [fields, cropTypes] = await Promise.all([getAllFields(), getCropTypeOptions()]);
  return (
    <>
      <DashboardTopbar title="Crops" />
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/crops" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Crops
        </Link>
        <h2 className="text-lg font-extrabold mb-1">New Crop Cycle</h2>
        <p className="text-sm text-ink-soft mb-7">Start tracking a new planting on one of your fields.</p>
        <NewCropCycleForm fields={fields.map((f) => ({ id: f.id, name: f.name }))} cropTypes={cropTypes} />
      </div>
    </>
  );
}
