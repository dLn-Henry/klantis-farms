import Link from "next/link";
import { Package, UserRound, Store, ArrowRight } from "lucide-react";
import { getMyOrders } from "@/lib/data/repositories/my-orders";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function AccountOverviewPage() {
  const orders = await getMyOrders(3);
  return (
    <div className="space-y-7">
      <section className="bg-white border border-border rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold">Recent orders</h2>
          {orders.length > 0 && <Link href="/account/orders" className="text-sm font-bold text-green inline-flex items-center gap-1">View all <ArrowRight size={14} /></Link>}
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <span className="w-12 h-12 rounded-full bg-mist flex items-center justify-center mx-auto mb-3"><Package size={22} className="stroke-green" /></span>
            <p className="text-sm font-semibold">You haven&apos;t placed an order yet.</p>
            <p className="text-sm text-ink-soft mt-1 mb-4">Fresh produce, straight from the farm.</p>
            <Link href="/shop" className="btn-solid inline-flex">Browse the shop</Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {orders.map((o) => (
              <li key={o.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{o.orderNumber}</p>
                  <p className="text-xs text-ink-soft">{new Date(o.date).toLocaleDateString("en-GB")} · {o.itemCount} item{o.itemCount === 1 ? "" : "s"} · GHS {o.total.toFixed(2)}</p>
                </div>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid sm:grid-cols-2 gap-5">
        <Link href="/account/profile" className="bg-white border border-border rounded-md p-5 hover:border-green">
          <UserRound size={20} className="stroke-green mb-2" />
          <h3 className="text-sm font-extrabold">Your details</h3>
          <p className="text-xs text-ink-soft mt-1">Name and phone number for deliveries.</p>
        </Link>
        <Link href="/account/sell" className="bg-white border border-border rounded-md p-5 hover:border-green">
          <Store size={20} className="stroke-green mb-2" />
          <h3 className="text-sm font-extrabold">Sell on Klantis Farms</h3>
          <p className="text-xs text-ink-soft mt-1">Run your own farm on the platform. Coming soon.</p>
        </Link>
      </div>
    </div>
  );
}
