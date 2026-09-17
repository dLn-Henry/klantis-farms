import type { Metadata } from "next";
import Link from "next/link";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getAllCustomers } from "@/lib/data/repositories/customers";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  const customers = await getAllCustomers();

  return (
    <>
      <DashboardTopbar title="Customers" />

      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold">Customers</h2>
          <p className="text-sm text-ink-soft mt-0.5">Everyone who's ordered from Klantis Farms.</p>
        </div>

        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Total Spent</th>
                <th className="px-5 py-3">Customer Since</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                  <td className="px-5 py-3.5">
                    <b className="font-bold block">{c.name}</b>
                    <span className="text-xs text-ink-soft">{c.email}</span>
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft">{c.location}</td>
                  <td className="px-5 py-3.5 font-semibold">{c.totalOrders}</td>
                  <td className="px-5 py-3.5 font-semibold text-green">{formatCurrency(c.totalSpent)}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{c.joinedDate}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/dashboard/customers/${c.id}`} className="text-green font-bold text-xs">View →</Link>
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
