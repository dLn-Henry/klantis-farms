import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllInventoryItems, getInventoryItemById } from "@/lib/data/repositories/inventory";
import { getInventoryStatus } from "@/lib/data/mock/inventory";
import { getAllHarvests } from "@/lib/data/repositories/harvests";

type Props = { params: { id: string } };

export async function generateStaticParams() {
  const items = await getAllInventoryItems();
  return items.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getInventoryItemById(params.id);
  return { title: item?.name ?? "Inventory Item" };
}

export default async function InventoryDetailPage({ params }: Props) {
  const item = await getInventoryItemById(params.id);
  if (!item) return notFound();

  const status = getInventoryStatus(item);
  const harvests = await getAllHarvests();

  return (
    <>
      <DashboardTopbar title="Inventory" />

      <div className="p-6 lg:p-8 max-w-[800px]">
        <Link href="/dashboard/inventory" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Inventory
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-extrabold">{item.name}</h2>
          <StatusBadge status={status} />
        </div>
        <p className="text-sm text-ink-soft mb-7">{item.sku} · {item.category} · {item.location}</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Current Stock</span>
            <p className="text-2xl font-extrabold text-green mt-1">{item.quantity.toLocaleString()} <span className="text-sm font-semibold text-ink-soft">{item.unit}</span></p>
          </div>
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Reorder Level</span>
            <p className="text-2xl font-extrabold mt-1">{item.reorderLevel.toLocaleString()} <span className="text-sm font-semibold text-ink-soft">{item.unit}</span></p>
          </div>
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Location</span>
            <p className="text-base font-bold mt-2">{item.location}</p>
          </div>
        </div>

        <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Movement Ledger</h3>
        <div className="bg-white border border-border rounded-md overflow-hidden">
          {item.transactions.map((t, i) => {
            const isIncrease = t.quantityChange.startsWith("+");
            const linkedHarvest = harvests.find((h) => t.reference.includes(h.code));
            return (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isIncrease ? "bg-[#E8F5E9]" : "bg-[#FDECEA]"}`}>
                  {isIncrease ? <ArrowUpRight size={15} className="stroke-[#2E7D32]" /> : <ArrowDownRight size={15} className="stroke-[#C62828]" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <b className="text-sm">{t.type}</b>
                    <span className="text-xs text-ink-soft">{t.date}</span>
                  </div>
                  {linkedHarvest ? (
                    <Link href={`/dashboard/harvests/${linkedHarvest.id}`} className="text-xs text-green font-semibold hover:underline">
                      {t.reference}
                    </Link>
                  ) : (
                    <span className="text-xs text-ink-soft">{t.reference}</span>
                  )}
                </div>
                <span className={`text-sm font-extrabold flex-shrink-0 ${isIncrease ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                  {t.quantityChange}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
