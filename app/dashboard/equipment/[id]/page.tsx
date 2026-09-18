import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Wrench } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getEquipmentById } from "@/lib/data/repositories/equipment";
import { formatCurrency } from "@/lib/utils";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const eq = await getEquipmentById(params.id);
  return { title: eq?.name ?? "Equipment" };
}

export default async function EquipmentDetailPage({ params }: Props) {
  const eq = await getEquipmentById(params.id);
  if (!eq) return notFound();

  return (
    <>
      <DashboardTopbar title="Equipment" />

      <div className="p-6 lg:p-8 max-w-[800px]">
        <Link href="/dashboard/equipment" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Equipment
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-extrabold">{eq.name}</h2>
          <StatusBadge status={eq.status} />
        </div>
        <p className="text-sm text-ink-soft mb-7">{eq.code} · {eq.manufacturer} {eq.model}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            ["Category", eq.category],
            ["Purchase Date", eq.purchaseDate],
            ["Condition", eq.condition],
            ["Location", eq.location],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-border rounded-md p-4">
              <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">{label}</span>
              <p className="text-sm font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Maintenance History</h3>
        <div className="bg-white border border-border rounded-md overflow-hidden">
          {eq.maintenance.length === 0 && (
            <p className="p-5 text-sm text-ink-soft">No maintenance recorded yet.</p>
          )}
          {eq.maintenance.map((m, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4 border-b border-border last:border-b-0">
              <span className="w-8 h-8 rounded-full bg-mist flex items-center justify-center flex-shrink-0">
                <Wrench size={15} className="stroke-green" />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  <b className="text-sm">{m.type}</b>
                  <span className="text-xs text-ink-soft">{m.date}</span>
                </div>
                <p className="text-xs text-ink-soft mt-0.5">{m.notes}</p>
              </div>
              <span className="text-sm font-bold flex-shrink-0">{m.cost > 0 ? formatCurrency(m.cost) : "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
