import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Phone } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllSuppliers, getSupplierById } from "@/lib/data/repositories/suppliers";
import { formatCurrency } from "@/lib/utils";

type Props = { params: { id: string } };

export async function generateStaticParams() {
  const suppliers = await getAllSuppliers();
  return suppliers.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supplier = await getSupplierById(params.id);
  return { title: supplier?.name ?? "Supplier" };
}

export default async function SupplierDetailPage({ params }: Props) {
  const supplier = await getSupplierById(params.id);
  if (!supplier) return notFound();

  const totalSpent = supplier.recentPurchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <DashboardTopbar title="Suppliers" />

      <div className="p-6 lg:p-8 max-w-[800px]">
        <Link href="/dashboard/suppliers" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Suppliers
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-extrabold">{supplier.name}</h2>
          <StatusBadge status={supplier.status} />
        </div>
        <p className="text-sm text-ink-soft mb-7">{supplier.code} · {supplier.category}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Contact Person</span>
            <p className="text-sm font-bold mt-1">{supplier.contactPerson}</p>
          </div>
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide flex items-center gap-1.5"><Phone size={11} /> Phone</span>
            <p className="text-sm font-bold mt-1">{supplier.phone}</p>
          </div>
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide flex items-center gap-1.5"><Mail size={11} /> Email</span>
            <p className="text-sm font-bold mt-1 truncate">{supplier.email}</p>
          </div>
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Payment Terms</span>
            <p className="text-sm font-bold mt-1">{supplier.paymentTerms}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wide">Recent Purchases</h3>
          <span className="text-sm font-bold text-green">{formatCurrency(totalSpent)} total</span>
        </div>
        <div className="bg-white border border-border rounded-md overflow-hidden">
          {supplier.recentPurchases.length === 0 && (
            <p className="p-5 text-sm text-ink-soft">No purchases recorded yet.</p>
          )}
          {supplier.recentPurchases.map((p, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0">
              <div>
                <b className="text-sm block">{p.item}</b>
                <span className="text-xs text-ink-soft">{p.date}</span>
              </div>
              <span className="text-sm font-bold">{formatCurrency(p.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
