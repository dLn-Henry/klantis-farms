import type { Metadata } from "next";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { ReportsTabs } from "@/components/dashboard/ReportsTabs";
import {
  getLivestockByStatus, getCropYieldSummary, getInventoryStatusSummary, getSalesByProduct,
} from "@/lib/analytics";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const [livestockByStatus, cropYield, inventoryStatus, salesByProduct] = await Promise.all([
    getLivestockByStatus(),
    getCropYieldSummary(),
    getInventoryStatusSummary(),
    getSalesByProduct(),
  ]);

  return (
    <>
      <DashboardTopbar title="Reports" />

      <div className="p-6 lg:p-8 max-w-[820px]">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold">Reports</h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Generated from the actual records in Livestock, Crops, Inventory and Orders — not typed in separately.
          </p>
        </div>

        <ReportsTabs
          livestockByStatus={livestockByStatus}
          cropYield={cropYield}
          inventoryStatus={inventoryStatus}
          salesByProduct={salesByProduct}
        />
      </div>
    </>
  );
}
