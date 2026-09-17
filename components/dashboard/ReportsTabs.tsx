"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils";

const TABS = ["Livestock", "Crops", "Inventory", "Sales"] as const;
type Tab = (typeof TABS)[number];

type Props = {
  livestockByStatus: { status: string; count: number }[];
  cropYield: { crop: string; field: string; status: string; harvestedCount: number }[];
  inventoryStatus: { status: string; count: number }[];
  salesByProduct: { product: string; revenue: number }[];
};

export function ReportsTabs({ livestockByStatus, cropYield, inventoryStatus, salesByProduct }: Props) {
  const [tab, setTab] = useState<Tab>("Livestock");

  return (
    <div>
      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === t ? "border-green text-green" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Livestock" && (
        <div className="bg-white border border-border rounded-md overflow-hidden">
          <div className="grid grid-cols-2 bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide px-5 py-3">
            <span>Status</span><span>Animal Count</span>
          </div>
          {livestockByStatus.map((row) => (
            <div key={row.status} className="grid grid-cols-2 px-5 py-3.5 border-t border-border items-center">
              <StatusBadge status={row.status} />
              <span className="font-bold text-sm">{row.count}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "Crops" && (
        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Crop</th>
                <th className="px-5 py-3">Field</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Harvest Records</th>
              </tr>
            </thead>
            <tbody>
              {cropYield.map((row) => (
                <tr key={row.field} className="border-t border-border">
                  <td className="px-5 py-3.5 font-bold">{row.crop}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{row.field}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={row.status} /></td>
                  <td className="px-5 py-3.5 font-semibold">{row.harvestedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Inventory" && (
        <div className="bg-white border border-border rounded-md overflow-hidden">
          <div className="grid grid-cols-2 bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide px-5 py-3">
            <span>Status</span><span>Item Count</span>
          </div>
          {inventoryStatus.map((row) => (
            <div key={row.status} className="grid grid-cols-2 px-5 py-3.5 border-t border-border items-center">
              <StatusBadge status={row.status} />
              <span className="font-bold text-sm">{row.count}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "Sales" && (
        <div className="bg-white border border-border rounded-md overflow-hidden">
          <div className="grid grid-cols-2 bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide px-5 py-3">
            <span>Product</span><span>Revenue</span>
          </div>
          {salesByProduct.map((row) => (
            <div key={row.product} className="grid grid-cols-2 px-5 py-3.5 border-t border-border items-center">
              <span className="text-sm font-semibold">{row.product}</span>
              <span className="font-bold text-sm text-green">{formatCurrency(row.revenue)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
