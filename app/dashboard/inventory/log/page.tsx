import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { LogMovementForm } from "@/components/dashboard/LogMovementForm";
import { getAllInventoryItems } from "@/lib/data/repositories/inventory";

export const metadata: Metadata = { title: "Log Movement" };

export default async function LogMovementPage({ searchParams }: { searchParams: { item?: string } }) {
  const items = await getAllInventoryItems();

  return (
    <>
      <DashboardTopbar title="Inventory" />
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/inventory" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Inventory
        </Link>
        <h2 className="text-lg font-extrabold mb-1">Log Movement</h2>
        <p className="text-sm text-ink-soft mb-7">Record stock coming in or going out.</p>
        <LogMovementForm
          items={items.map((i) => ({ id: i.id, name: i.name, unit: i.unit, quantity: i.quantity }))}
          preselectedId={searchParams.item}
        />
      </div>
    </>
  );
}
