import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderStatusActions } from "@/components/dashboard/OrderStatusActions";
import { getOrderById } from "@/lib/data/repositories/orders";
import { orderSubtotal, orderTotal } from "@/lib/data/mock/orders";
import { getAllCustomers } from "@/lib/data/repositories/customers";
import { formatCurrency } from "@/lib/utils";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const order = await getOrderById(params.id);
  return { title: order?.orderNumber ?? "Order" };
}

export default async function OrderDetailPage({ params }: Props) {
  const order = await getOrderById(params.id);
  if (!order) return notFound();

  const customers = await getAllCustomers();
  const customer = customers.find((c) => c.id === order.customerId);
  const subtotal = orderSubtotal(order);
  const total = orderTotal(order);

  return (
    <>
      <DashboardTopbar title="Orders" />

      <div className="p-6 lg:p-8 max-w-[820px]">
        <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Orders
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-extrabold">{order.orderNumber}</h2>
          <StatusBadge status={order.paymentStatus} />
        </div>
        <p className="text-sm text-ink-soft mb-7">
          {customer ? (
            <Link href={`/dashboard/customers/${customer.id}`} className="font-semibold text-green">{order.customerName}</Link>
          ) : order.customerName}
          {" "}· {order.date} · {order.deliveryMethod}
        </p>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Items</h3>
            <div className="bg-white border border-border rounded-md overflow-hidden mb-6">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0">
                  <div>
                    <b className="text-sm block">{item.name}</b>
                    <span className="text-xs text-ink-soft">{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                  </div>
                  <span className="text-sm font-bold">{formatCurrency(item.quantity * item.unitPrice)}</span>
                </div>
              ))}
              <div className="px-5 py-4 space-y-2 bg-surface">
                <div className="flex justify-between text-xs text-ink-soft">
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-ink-soft">
                  <span>Delivery</span><span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-border">
                  <span>Total</span><span className="text-green">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Delivery</h3>
            <div className="bg-white border border-border rounded-md p-4">
              <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">{order.deliveryMethod} Address</span>
              <p className="text-sm font-bold mt-1">{order.address}</p>
            </div>
          </div>

          <OrderStatusActions orderId={order.id} initialStatus={order.status} />
        </div>
      </div>
    </>
  );
}
