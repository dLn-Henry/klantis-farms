import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CropDetailTabs } from "@/components/dashboard/CropDetailTabs";
import { getAllCropCycles, getCropCycleById } from "@/lib/data/repositories/crop-cycles";

type Props = { params: { id: string } };

export async function generateStaticParams() {
  const cycles = await getAllCropCycles();
  return cycles.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cycle = await getCropCycleById(params.id);
  return { title: cycle?.code ?? "Crop Cycle" };
}

export default async function CropDetailPage({ params }: Props) {
  const cycle = await getCropCycleById(params.id);
  if (!cycle) return notFound();

  return (
    <>
      <DashboardTopbar title="Crops" />

      <div className="p-6 lg:p-8 max-w-[1000px]">
        <Link href="/dashboard/crops" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Crops
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-extrabold">{cycle.code}</h2>
          <StatusBadge status={cycle.status} />
        </div>
        <p className="text-sm text-ink-soft mb-7">{cycle.crop} · {cycle.variety} · {cycle.field}</p>

        <CropDetailTabs cycle={cycle} />
      </div>
    </>
  );
}
