import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { NewIncomeForm } from "@/components/dashboard/NewIncomeForm";

export const metadata: Metadata = { title: "Add Income" };

export default function NewIncomePage() {
  return (
    <>
      <DashboardTopbar title="Finance" />
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/finance" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Finance
        </Link>
        <h2 className="text-lg font-extrabold mb-1">Add Income</h2>
        <p className="text-sm text-ink-soft mb-7">Record money coming into the farm.</p>
        <NewIncomeForm />
      </div>
    </>
  );
}
