import type { Metadata } from "next";
import Link from "next/link";
import { getMyOrders } from "@/lib/data/repositories/my-orders";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "My orders" };

export default async function MyOrdersPage() {
  const orders = await getMyOrders();
  return (
    <section>
      <h2 className="text-lg font-extrabold mb-1">My orders</h2>
      <p className="text-sm text-ink-soft mb-5">Track what you&apos;ve ordered from the farm.</p>
      {orders.length === 0 ? (
        <div className="bg-white border border-border rounded-md p-10 text-center">
          <p className="text-sm font-semibold">No orders yet.</p>
          <Link href="/shop" className="btn-solid inline-flex mt-4">Browse the shop</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <article key={o.id} className="bg-white border border-border rounded-md p-5">
              <header className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-extrabold">{o.orderNumber}</h3>
                  <p className="text-xs text-ink-soft">{new Date(o.date).toLocaleDateString("en-GB")} · {o.deliveryMethod}</p>
                </div>
                <div className="flex items-center gap-2"><StatusBadge status={o.paymentStatus} /><StatusBadge status={o.status} /></div>
              </header>
              <ul className="text-sm divide-y divide-border border-y border-border">
                {o.items.map((i, k) => (
                  <li key={k} className="py-2 flex justify-between"><span>{i.quantity} × {i.name}</span><span className="text-ink-soft">GHS {(i.quantity * i.unitPrice).toFixed(2)}</span></li>
                ))}
              </ul>
              <p className="text-sm font-extrabold text-right mt-3">Total GHS {o.total.toFixed(2)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
