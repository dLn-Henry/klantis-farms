import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { NewSupplierForm } from "@/components/dashboard/NewSupplierForm";

export const metadata: Metadata = { title: "Add Supplier" };

export default function NewSupplierPage() {
  return (
    <>
      <DashboardTopbar title="Suppliers" />
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/suppliers" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Suppliers
        </Link>
        <h2 className="text-lg font-extrabold mb-1">Add Supplier</h2>
        <p className="text-sm text-ink-soft mb-7">Register a new supplier for the farm.</p>
        <NewSupplierForm />
      </div>
    </>
  );
}
