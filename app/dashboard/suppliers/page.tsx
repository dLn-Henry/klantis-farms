import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllSuppliers } from "@/lib/data/repositories/suppliers";

export const metadata: Metadata = { title: "Suppliers" };

export default async function SuppliersPage() {
  const suppliers = await getAllSuppliers();

  return (
    <>
      <DashboardTopbar title="Suppliers" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Suppliers</h2>
            <p className="text-sm text-ink-soft mt-0.5">Who the farm buys from, and what for.</p>
          </div>
          <button className="btn-solid"><Plus size={15} /> Add Supplier</button>
        </div>

        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Supplier</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Payment Terms</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                  <td className="px-5 py-3.5">
                    <b className="font-bold block">{s.name}</b>
                    <span className="text-xs text-ink-soft">{s.code}</span>
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft">{s.category}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{s.contactPerson}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{s.paymentTerms}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/dashboard/suppliers/${s.id}`} className="text-green font-bold text-xs">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
