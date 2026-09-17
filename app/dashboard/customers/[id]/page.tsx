import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllCustomers, getCustomerById } from "@/lib/data/repositories/customers";
import { getAllOrders } from "@/lib/data/repositories/orders";
import { orderTotal } from "@/lib/data/mock/orders";
import { formatCurrency } from "@/lib/utils";

type Props = { params: { id: string } };

export async function generateStaticParams() {
  const customers = await getAllCustomers();
  return customers.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const customer = await getCustomerById(params.id);
  return { title: customer?.name ?? "Customer" };
}

export default async function CustomerDetailPage({ params }: Props) {
  const customer = await getCustomerById(params.id);
  if (!customer) return notFound();

  const allOrders = await getAllOrders();
  const customerOrders = allOrders.filter((o) => o.customerId === customer.id);

  return (
    <>
      <DashboardTopbar title="Customers" />

      <div className="p-6 lg:p-8 max-w-[800px]">
        <Link href="/dashboard/customers" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Customers
        </Link>

        <h2 className="text-xl font-extrabold mb-1">{customer.name}</h2>
        <p className="text-sm text-ink-soft mb-7">Customer since {customer.joinedDate}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide flex items-center gap-1.5"><Mail size={12} /> Email</span>
            <p className="text-sm font-bold mt-1 truncate">{customer.email}</p>
          </div>
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide flex items-center gap-1.5"><Phone size={12} /> Phone</span>
            <p className="text-sm font-bold mt-1">{customer.phone}</p>
          </div>
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide flex items-center gap-1.5"><MapPin size={12} /> Location</span>
            <p className="text-sm font-bold mt-1">{customer.location}</p>
          </div>
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide flex items-center gap-1.5"><Calendar size={12} /> Total Spent</span>
            <p className="text-sm font-bold mt-1 text-green">{formatCurrency(customer.totalSpent)}</p>
          </div>
        </div>

        <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Order History</h3>
        <div className="bg-white border border-border rounded-md overflow-hidden">
          {customerOrders.length === 0 && (
            <p className="p-5 text-sm text-ink-soft">No orders yet.</p>
          )}
          {customerOrders.map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/orders/${o.id}`}
              className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0 hover:bg-surface"
            >
              <div>
                <b className="text-sm block">{o.orderNumber}</b>
                <span className="text-xs text-ink-soft">{o.date} · {o.items.length} item{o.items.length > 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">{formatCurrency(orderTotal(o))}</span>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
