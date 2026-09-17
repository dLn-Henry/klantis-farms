import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "@/components/marketing/PageIntro";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { categories } from "@/lib/data/mock/categories";

export const metadata: Metadata = {
  title: "What We Produce",
  description: "Browse everything Klantis Farms grows and raises, by category.",
};

export default function ProducePage() {
  return (
    <>
      <PageIntro
        title="What We Produce"
        description="Five core lines, all raised or grown on one farm in the Eastern Region."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "What We Produce" }]}
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/produce/${cat.slug}`} className="block group">
              <PhotoSlot label={`Photo — ${cat.name}`} className="h-[170px] rounded-t-md" />
              <div className="border border-t-0 border-border rounded-b-md p-4">
                <h3 className="text-[15px] font-bold">{cat.name}</h3>
                <p className="text-[13px] text-ink-soft mt-1.5">{cat.description}</p>
                <p className="text-sm font-bold text-green mt-2.5 flex items-center gap-1.5">
                  {cat.productCount} products <ArrowRight size={14} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
