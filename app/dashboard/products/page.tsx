import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllProducts } from "@/lib/data/repositories/products";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <>
      <DashboardTopbar title="Products" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Products</h2>
            <p className="text-sm text-ink-soft mt-0.5">What's listed for sale, and what inventory backs it.</p>
          </div>
          <button className="btn-solid"><Plus size={15} /> Add Product</button>
        </div>

        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.slug} className="border-b border-border last:border-b-0 hover:bg-surface">
                  <td className="px-5 py-3.5 font-bold">{p.name}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{p.sku}</td>
                  <td className="px-5 py-3.5 font-semibold">
                    {p.price > 0 ? formatCurrency(p.price) : "Market price"}{" "}
                    <span className="text-xs font-normal text-ink-soft">/ {p.unit}</span>
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft">{p.rating} ({p.reviewCount})</td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/dashboard/products/${p.slug}`} className="text-green font-bold text-xs">Edit →</Link>
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
