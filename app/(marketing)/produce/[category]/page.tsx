import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingCart, Star, ArrowRight } from "lucide-react";
import { PageIntro } from "@/components/marketing/PageIntro";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { categories } from "@/lib/data/mock/categories";
import { getProductsInCategory } from "@/lib/data/repositories/products";
import { getPublishedPosts } from "@/lib/data/repositories/posts";
import { formatCurrency } from "@/lib/utils";

type Props = { params: { category: string } };

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = categories.find((c) => c.slug === params.category);
  return { title: cat?.name ?? "Produce" };
}

export default async function ProduceCategoryPage({ params }: Props) {
  const cat = categories.find((c) => c.slug === params.category);
  if (!cat) return notFound();

  const products = await getProductsInCategory(cat.slug);
  const posts = (await getPublishedPosts()).slice(0, 2);

  return (
    <>
      <PageIntro
        title={cat.name}
        description={cat.description}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "What We Produce", href: "/produce" }, { label: cat.name }]}
      />

      <section className="py-16">
        <div className="max-w-[900px] mx-auto px-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.length === 0 && (
            <p className="text-ink-soft text-sm col-span-full">No products listed in this category yet.</p>
          )}
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
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-[760px] mx-auto px-10">
          <span className="eyebrow">Related Reading</span>
          <h2 className="text-3xl font-extrabold tracking-tight mb-7">About This Harvest</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div key={post.slug}>
                <PhotoSlot label={`Photo — ${post.title.slice(0, 24)}`} className="h-[150px] rounded-md mb-3" />
                <div className="text-xs text-ink-soft font-semibold">{post.date}</div>
                <h3 className="text-[15px] font-bold mt-1"><Link href={`/journal/${post.slug}`}>{post.title}</Link></h3>
                <Link href={`/journal/${post.slug}`} className="link-arrow mt-2.5">Read More <ArrowRight /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
