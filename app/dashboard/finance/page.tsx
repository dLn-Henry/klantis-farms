import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getAllExpenses, getAllIncome } from "@/lib/data/repositories/finance";
import { totalExpenses, totalIncome } from "@/lib/data/mock/finance";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Finance" };

export default async function FinancePage() {
  const expenses = await getAllExpenses();
  const income = await getAllIncome();
  const revenue = totalIncome();
  const spent = totalExpenses();
  const net = revenue - spent;

  return (
    <>
      <DashboardTopbar title="Finance" />

      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold">Finance Overview</h2>
          <p className="text-sm text-ink-soft mt-0.5">Revenue and expenses recorded so far this season.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-border rounded-md p-5">
            <span className="w-9 h-9 rounded-lg bg-[#E8F5E9] flex items-center justify-center mb-3">
              <TrendingUp size={18} className="stroke-[#2E7D32]" />
            </span>
            <b className="block text-2xl font-extrabold text-[#2E7D32]">{formatCurrency(revenue)}</b>
            <span className="text-xs text-ink-soft font-semibold">Total Revenue</span>
          </div>
          <div className="bg-white border border-border rounded-md p-5">
            <span className="w-9 h-9 rounded-lg bg-[#FDECEA] flex items-center justify-center mb-3">
              <TrendingDown size={18} className="stroke-[#C62828]" />
            </span>
            <b className="block text-2xl font-extrabold text-[#C62828]">{formatCurrency(spent)}</b>
            <span className="text-xs text-ink-soft font-semibold">Total Expenses</span>
          </div>
          <div className="bg-white border border-border rounded-md p-5">
            <span className="w-9 h-9 rounded-lg bg-mist flex items-center justify-center mb-3">
              <DollarSign size={18} className="stroke-green" />
            </span>
            <b className={`block text-2xl font-extrabold ${net >= 0 ? "text-green" : "text-[#C62828]"}`}>{formatCurrency(net)}</b>
            <span className="text-xs text-ink-soft font-semibold">Net</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Income</h3>
            <div className="bg-white border border-border rounded-md overflow-hidden">
              {income.map((i) => (
                <div key={i.id} className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0">
                  <div>
                    <b className="text-sm block">{i.description}</b>
                    <span className="text-xs text-ink-soft">{i.category} · {i.date}</span>
                  </div>
                  <span className="text-sm font-bold text-[#2E7D32]">+{formatCurrency(i.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Expenses</h3>
            <div className="bg-white border border-border rounded-md overflow-hidden">
              {expenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0">
                  <div>
                    <b className="text-sm block">{e.description}</b>
                    <span className="text-xs text-ink-soft">
                      {e.category} · {e.date}
                      {e.supplierId && (
                        <> · <Link href={`/dashboard/suppliers/${e.supplierId}`} className="text-green font-semibold hover:underline">{e.supplierName}</Link></>
                      )}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#C62828]">-{formatCurrency(e.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
