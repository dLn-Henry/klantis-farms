import type { Metadata } from "next";
import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllInventoryItems } from "@/lib/data/repositories/inventory";
import { getInventoryStatus } from "@/lib/data/mock/inventory";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const items = await getAllInventoryItems();
  const lowStock = items.filter((i) => getInventoryStatus(i) !== "Normal");

  return (
    <>
      <DashboardTopbar title="Inventory" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Inventory</h2>
            <p className="text-sm text-ink-soft mt-0.5">Stock levels, derived from actual movements — not typed in by hand.</p>
          </div>
          <button className="btn-solid"><Plus size={15} /> Record Movement</button>
        </div>

        {lowStock.length > 0 && (
          <div className="flex items-center gap-3 bg-[#FDF3E3] border border-[#F0DBAF] rounded-md px-4 py-3.5 mb-6">
            <AlertTriangle size={18} className="stroke-gold flex-shrink-0" />
            <span className="text-sm font-semibold">
              {lowStock.length} item{lowStock.length > 1 ? "s" : ""} at or below reorder level:{" "}
              {lowStock.map((i) => i.name).join(", ")}
            </span>
          </div>
        )}

        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Reorder Level</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const status = getInventoryStatus(item);
                return (
                  <tr key={item.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                    <td className="px-5 py-3.5">
                      <b className="font-bold block">{item.name}</b>
                      <span className="text-xs text-ink-soft">{item.sku}</span>
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">{item.category}</td>
                    <td className="px-5 py-3.5 font-semibold">{item.quantity.toLocaleString()} {item.unit}</td>
                    <td className="px-5 py-3.5 text-ink-soft">{item.location}</td>
                    <td className="px-5 py-3.5 text-ink-soft">{item.reorderLevel.toLocaleString()} {item.unit}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/dashboard/inventory/${item.id}`} className="text-green font-bold text-xs">View →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
