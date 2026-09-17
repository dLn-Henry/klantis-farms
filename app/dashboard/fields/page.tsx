import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllFields } from "@/lib/data/repositories/fields";

export const metadata: Metadata = { title: "Fields" };

export default async function FieldsPage() {
  const fields = await getAllFields();

  return (
    <>
      <DashboardTopbar title="Fields" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Fields</h2>
            <p className="text-sm text-ink-soft mt-0.5">Every cultivated area on the farm, and what's growing there now.</p>
          </div>
          <button className="btn-solid"><Plus size={15} /> Add Field</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {fields.map((f) => (
            <Link key={f.id} href={`/dashboard/fields/${f.id}`} className="bg-white border border-border rounded-md p-5 block hover:border-green transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-ink-soft">{f.code}</span>
                <StatusBadge status={f.status} />
              </div>
              <h3 className="text-base font-extrabold">{f.name}</h3>
              <p className="text-sm text-ink-soft mt-1">{f.currentCrop}</p>
              <div className="flex gap-4 mt-4 pt-4 border-t border-border text-xs text-ink-soft">
                <span>{f.area}</span>
                <span>{f.soilType}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
