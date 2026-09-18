import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getHarvestById } from "@/lib/data/repositories/harvests";
import { getCropCycleById } from "@/lib/data/repositories/crop-cycles";
import { getAllInventoryItems } from "@/lib/data/repositories/inventory";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const harvest = await getHarvestById(params.id);
  return { title: harvest?.code ?? "Harvest" };
}

export default async function HarvestDetailPage({ params }: Props) {
  const harvest = await getHarvestById(params.id);
  if (!harvest) return notFound();

  const cycle = await getCropCycleById(harvest.cropCycleId);
  const items = await getAllInventoryItems();
  const linkedItem = items.find((i) => i.transactions.some((t) => t.reference === harvest.code));

  return (
    <>
      <DashboardTopbar title="Harvests" />

      <div className="p-6 lg:p-8 max-w-[800px]">
        <Link href="/dashboard/harvests" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Harvests
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-extrabold">{harvest.code}</h2>
          <StatusBadge status={harvest.status} />
        </div>
        <p className="text-sm text-ink-soft mb-7">{harvest.crop} · {harvest.field} · {harvest.date}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {[
            ["Quantity", harvest.quantity],
            ["Quality Grade", harvest.qualityGrade],
            ["Destination", harvest.destination],
            ["Recorded By", harvest.recordedBy],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-border rounded-md p-4">
              <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">{label}</span>
              <p className="text-sm font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-1 gap-3 mb-6">
          {cycle && (
            <Link
              href={`/dashboard/crops/${cycle.id}`}
              className="flex items-center justify-between bg-mist border border-border rounded-md px-5 py-4"
            >
              <div>
                <span className="text-xs font-bold text-ink-soft uppercase tracking-wide">Source Crop Cycle</span>
                <p className="text-sm font-bold mt-0.5">{cycle.code} — {cycle.crop} ({cycle.variety})</p>
              </div>
              <ArrowRight size={16} className="stroke-green flex-shrink-0" />
            </Link>
          )}

          {linkedItem && (
            <Link
              href={`/dashboard/inventory/${linkedItem.id}`}
              className="flex items-center justify-between bg-mist border border-border rounded-md px-5 py-4"
            >
              <div>
                <span className="text-xs font-bold text-ink-soft uppercase tracking-wide">Added to Inventory As</span>
                <p className="text-sm font-bold mt-0.5">{linkedItem.name} — {linkedItem.quantity.toLocaleString()} {linkedItem.unit} in stock</p>
              </div>
              <ArrowRight size={16} className="stroke-green flex-shrink-0" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
