import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { PageIntro } from "@/components/marketing/PageIntro";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { getAllProducts } from "@/lib/data/repositories/products";
import { categories } from "@/lib/data/mock/categories";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse everything currently available from Klantis Farms.",
};

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <>
      <PageIntro
        title="Shop"
        description="Everything currently available, straight from the farm."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10 grid lg:grid-cols-[220px_1fr] gap-10">
          <aside className="hidden lg:block">
            <h4 className="text-xs font-bold uppercase tracking-wide mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/produce/${c.slug}`} className="text-sm font-semibold text-ink-soft hover:text-green">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <div key={p.slug} className="prod-card">
                <div className="relative h-[150px]">
                  {p.badge && <span className="prod-badge">{p.badge}</span>}
                  <PhotoSlot label={`Photo — ${p.name}`} />
                </div>
                <div className="p-4">
                  <h3 className="text-[14.5px] font-bold">{p.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Star size={12} className="fill-gold stroke-gold" />
                    <span className="text-[11.5px] text-ink-soft">{p.rating} ({p.reviewCount})</span>
                  </div>
                  <div className="text-base font-extrabold text-green mt-2.5">
                    {p.price > 0 ? formatCurrency(p.price) : "Market price"}{" "}
                    <small className="text-[11px] font-medium text-ink-soft">/ {p.unit}</small>
                  </div>
                  <button className="prod-cart"><ShoppingCart size={14} /> Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
