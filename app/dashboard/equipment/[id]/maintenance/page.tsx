import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { LogMaintenanceForm } from "@/components/dashboard/LogMaintenanceForm";
import { getEquipmentById } from "@/lib/data/repositories/equipment";

type Props = { params: { id: string } };

export const metadata: Metadata = { title: "Log Maintenance" };

export default async function LogMaintenancePage({ params }: Props) {
  const eq = await getEquipmentById(params.id);
  if (!eq) return notFound();

  return (
    <>
      <DashboardTopbar title="Equipment" />
      <div className="p-6 lg:p-8">
        <Link href={`/dashboard/equipment/${eq.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to {eq.name}
        </Link>
        <h2 className="text-lg font-extrabold mb-1">Log Maintenance</h2>
        <p className="text-sm text-ink-soft mb-7">Record service work done on {eq.name}.</p>
        <LogMaintenanceForm equipmentId={eq.id} />
      </div>
    </>
  );
}
