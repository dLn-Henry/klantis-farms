import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { NewEquipmentForm } from "@/components/dashboard/NewEquipmentForm";

export const metadata: Metadata = { title: "Add Equipment" };

export default function NewEquipmentPage() {
  return (
    <>
      <DashboardTopbar title="Equipment" />
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/equipment" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Equipment
        </Link>
        <h2 className="text-lg font-extrabold mb-1">Add Equipment</h2>
        <p className="text-sm text-ink-soft mb-7">Register a new piece of equipment.</p>
        <NewEquipmentForm />
      </div>
    </>
  );
}
