import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AnimalDetailTabs } from "@/components/dashboard/AnimalDetailTabs";
import { getAllAnimals, getAnimalById } from "@/lib/data/repositories/animals";

type Props = { params: { id: string } };

export async function generateStaticParams() {
  const animals = await getAllAnimals();
  return animals.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const animal = await getAnimalById(params.id);
  return { title: animal?.tag ?? "Animal" };
}

export default async function AnimalDetailPage({ params }: Props) {
  const animal = await getAnimalById(params.id);
  if (!animal) return notFound();

  return (
    <>
      <DashboardTopbar title="Livestock" />

      <div className="p-6 lg:p-8 max-w-[1000px]">
        <Link href="/dashboard/livestock" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Livestock
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-extrabold">{animal.tag}</h2>
          <StatusBadge status={animal.status} />
        </div>
        <p className="text-sm text-ink-soft mb-7">{animal.breed} {animal.species} · {animal.sex}</p>

        <AnimalDetailTabs animal={animal} />
      </div>
    </>
  );
}
