import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllFields, getFieldById } from "@/lib/data/repositories/fields";

type Props = { params: { id: string } };

export async function generateStaticParams() {
  const fields = await getAllFields();
  return fields.map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const field = await getFieldById(params.id);
  return { title: field?.name ?? "Field" };
}

export default async function FieldDetailPage({ params }: Props) {
  const field = await getFieldById(params.id);
  if (!field) return notFound();

  return (
    <>
      <DashboardTopbar title="Fields" />

      <div className="p-6 lg:p-8 max-w-[900px]">
        <Link href="/dashboard/fields" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Fields
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-extrabold">{field.name}</h2>
          <StatusBadge status={field.status} />
        </div>
        <p className="text-sm text-ink-soft mb-7">{field.code} · Currently growing: {field.currentCrop}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            ["Area", field.area],
            ["Soil Type", field.soilType],
            ["Irrigation", field.irrigationType],
            ["Current Crop", field.currentCrop],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-border rounded-md p-4">
              <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">{label}</span>
              <p className="text-sm font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Crop History</h3>
        <div className="bg-white border border-border rounded-md overflow-hidden">
          {field.history.map((h, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0">
              <div>
                <b className="text-sm block">{h.crop}</b>
                <span className="text-xs text-ink-soft">{h.season}</span>
              </div>
              <span className="text-xs font-semibold text-ink-soft">{h.outcome}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
