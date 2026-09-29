import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { NewAnimalForm } from "@/components/dashboard/NewAnimalForm";
import { getSpeciesWithBreeds } from "@/lib/data/repositories/animals";

export const metadata: Metadata = { title: "Add Animal" };

export default async function NewAnimalPage() {
  const species = await getSpeciesWithBreeds();
  return (
    <>
      <DashboardTopbar title="Livestock" />
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/livestock" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Animals
        </Link>
        <h2 className="text-lg font-extrabold mb-1">Add Animal</h2>
        <p className="text-sm text-ink-soft mb-7">Register a new animal on the farm.</p>
        <NewAnimalForm species={species} />
      </div>
    </>
  );
}
