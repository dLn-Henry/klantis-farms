import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { NewVetReportForm } from "@/components/dashboard/NewVetReportForm";
import { getAllAnimals } from "@/lib/data/repositories/animals";

export const metadata: Metadata = { title: "Submit Veterinary Report" };

export default async function NewVetReportPage() {
  const animals = await getAllAnimals();

  return (
    <>
      <DashboardTopbar title="Veterinary" />

      <div className="p-6 lg:p-8">
        <Link href="/dashboard/veterinary" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Reports
        </Link>

        <h2 className="text-lg font-extrabold mb-1">Submit Veterinary Report</h2>
        <p className="text-sm text-ink-soft mb-7">Record what you found during a visit. A farm manager will review it before it becomes an official record.</p>

        <NewVetReportForm animals={animals.map((a) => ({ id: a.id, tag: a.tag }))} />
      </div>
    </>
  );
}
