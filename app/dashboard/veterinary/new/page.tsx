import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { NewVetReportForm } from "@/components/dashboard/NewVetReportForm";
import { getAllAnimals } from "@/lib/data/repositories/animals";
import { getCurrentFarmId } from "@/lib/data/current-farm";

export const metadata: Metadata = { title: "Submit Veterinary Report" };

export default async function NewVetReportPage({ searchParams }: { searchParams: { animal?: string } }) {
  // For a vet, row-level security returns ONLY the animals assigned to them.
  const [animals, farmId] = await Promise.all([getAllAnimals(), getCurrentFarmId()]);

  return (
    <>
      <DashboardTopbar title="Veterinary" />

      <div className="p-6 lg:p-8">
        <Link href="/dashboard/veterinary" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Veterinary
        </Link>

        <h2 className="text-lg font-extrabold mb-1">Submit Veterinary Report</h2>
        <p className="text-sm text-ink-soft mb-7">Record what you found during a visit. A farm manager will review it before it becomes an official record.</p>

        {!farmId ? (
          <p className="text-sm text-ink-soft">You&apos;re not a member of a farm yet.</p>
        ) : animals.length === 0 ? (
          <div className="max-w-[560px] bg-white border border-border rounded-md p-6">
            <h3 className="text-sm font-extrabold mb-1">No animals are assigned to you right now</h3>
            <p className="text-sm text-ink-soft">A farm manager assigns the animals for your visit. Once they do, they&apos;ll appear here and you can write your report.</p>
          </div>
        ) : (
          <NewVetReportForm
            animals={animals.map((a) => ({ id: a.id, tag: a.tag }))}
            farmId={farmId}
            defaultAnimalId={animals.some((a) => a.id === searchParams.animal) ? searchParams.animal : undefined}
          />
        )}
      </div>
    </>
  );
}
