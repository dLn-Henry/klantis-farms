import type { Metadata } from "next";
import Link from "next/link";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllOrders } from "@/lib/data/repositories/orders";
import { orderTotal } from "@/lib/data/mock/orders";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <>
      <DashboardTopbar title="Orders" />

      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold">Orders</h2>
          <p className="text-sm text-ink-soft mt-0.5">Every customer order, from placed to delivered.</p>
        </div>

        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                  <td className="px-5 py-3.5 font-bold">{o.orderNumber}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{o.customerName}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{o.date}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{o.items.length}</td>
                  <td className="px-5 py-3.5 font-semibold">{formatCurrency(orderTotal(o))}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={o.paymentStatus} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/dashboard/orders/${o.id}`} className="text-green font-bold text-xs">View →</Link>
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
