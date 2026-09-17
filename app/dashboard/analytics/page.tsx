import type { Metadata } from "next";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { RevenueExpenseChart } from "@/components/dashboard/charts/RevenueExpenseChart";
import { SimpleBarChart } from "@/components/dashboard/charts/SimpleBarChart";
import { monthlyFinance } from "@/lib/data/mock/analytics-trends";
import { getSalesByProduct, getLivestockByStatus, getTotalOrderRevenue } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const salesByProduct = await getSalesByProduct();
  const livestockByStatus = await getLivestockByStatus();
  const totalRevenue = await getTotalOrderRevenue();

  const salesData = salesByProduct.map((s) => ({ label: s.product, value: s.revenue }));
  const livestockData = livestockByStatus.map((l) => ({ label: l.status, value: l.count }));

  return (
    <>
      <DashboardTopbar title="Analytics" />

      <div className="p-6 lg:p-8 max-w-[900px]">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold">Analytics</h2>
          <p className="text-sm text-ink-soft mt-0.5">Trends over time, built from the same records as everything else.</p>
        </div>

        <div className="bg-white border border-border rounded-md p-5 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-extrabold uppercase tracking-wide">Revenue vs Expenses</h3>
            <span className="text-xs font-semibold text-ink-soft">Last 6 months</span>
          </div>
          <RevenueExpenseChart data={monthlyFinance} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-border rounded-md p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Sales by Product</h3>
            {salesData.length > 0 ? (
              <SimpleBarChart data={salesData} valueType="currency" />
            ) : (
              <p className="text-sm text-ink-soft">No sales recorded yet.</p>
            )}
          </div>

          <div className="bg-white border border-border rounded-md p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Livestock by Status</h3>
            <SimpleBarChart data={livestockData} color="#D99A2B" />
          </div>
        </div>

        <div className="bg-mist border border-border rounded-md p-5 mt-6">
          <span className="text-xs font-bold text-ink-soft uppercase tracking-wide">Total Order Revenue (excl. cancelled)</span>
          <p className="text-2xl font-extrabold text-green mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>
    </>
  );
}
