import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllProducts, getProductBySlug } from "@/lib/data/repositories/products";
import { getInventoryItemById } from "@/lib/data/repositories/inventory";
import { getInventoryStatus } from "@/lib/data/mock/inventory";
import { categories } from "@/lib/data/mock/categories";
import { formatCurrency } from "@/lib/utils";

type Props = { params: { id: string } };

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.id);
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductBySlug(params.id);
  if (!product) return notFound();

  const category = categories.find((c) => c.slug === product.categorySlug);
  const inventoryItem = product.inventoryItemId ? await getInventoryItemById(product.inventoryItemId) : undefined;

  return (
    <>
      <DashboardTopbar title="Products" />

      <div className="p-6 lg:p-8 max-w-[800px]">
        <Link href="/dashboard/products" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Products
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-extrabold">{product.name}</h2>
          <StatusBadge status={product.status} />
        </div>
        <p className="text-sm text-ink-soft mb-7">{product.sku} · {category?.name}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            ["Price", product.price > 0 ? `${formatCurrency(product.price)} / ${product.unit}` : "Market price"],
            ["Rating", `${product.rating} (${product.reviewCount} reviews)`],
            ["Category", category?.name ?? "—"],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-border rounded-md p-4">
              <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">{label}</span>
              <p className="text-sm font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>

        {inventoryItem ? (
          <Link
            href={`/dashboard/inventory/${inventoryItem.id}`}
            className="flex items-center justify-between bg-mist border border-border rounded-md px-5 py-4 mb-4"
          >
            <div>
              <span className="text-xs font-bold text-ink-soft uppercase tracking-wide">Backed By Inventory</span>
              <p className="text-sm font-bold mt-0.5">
                {inventoryItem.name} — {inventoryItem.quantity.toLocaleString()} {inventoryItem.unit} available
              </p>
            </div>
            <StatusBadge status={getInventoryStatus(inventoryItem)} />
          </Link>
        ) : (
          <div className="bg-[#FDF3E3] border border-[#F0DBAF] rounded-md px-5 py-4 mb-4">
            <p className="text-sm font-semibold">
              Not linked to an inventory item. Available quantity is unmanaged for this product.
            </p>
          </div>
        )}

        <a
          href={`/shop`}
          target="_blank"
          rel="noreferrer"
          className="link-arrow"
        >
          View in Public Shop <ExternalLink size={13} />
        </a>
      </div>
    </>
  );
}
