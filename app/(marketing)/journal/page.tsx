import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "@/components/marketing/PageIntro";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { getPublishedPosts } from "@/lib/data/repositories/posts";

export const metadata: Metadata = {
  title: "Farm Journal",
  description: "Notes from the farm — livestock, crops, and how we run things day to day.",
};

export default async function JournalPage() {
  const posts = await getPublishedPosts();
  const [featured, ...rest] = posts;
  const categoryCounts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageIntro
        title="Farm Journal"
        description="Notes from the farm — livestock, crops, and how we run things day to day."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Farm Journal" }]}
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10 grid lg:grid-cols-[2fr_1fr] gap-14 items-start">
          <div>
            <div className="grid md:grid-cols-2 gap-9 bg-surface rounded-2xl p-8 mb-9 items-center">
              <PhotoSlot label={`Photo — ${featured.title.slice(0, 28)}`} className="h-[240px] rounded-lg" />
              <div>
                <div className="text-xs font-semibold text-ink-soft">Featured · {featured.date}</div>
                <h3 className="text-2xl font-extrabold tracking-tight mt-2 mb-3 leading-snug">{featured.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed mb-4">{featured.excerpt}</p>
                <Link href={`/journal/${featured.slug}`} className="link-arrow">
                  Read the Full Article <ArrowRight />
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {rest.map((post) => (
                <div key={post.slug}>
                  <div className="relative">
                    <PhotoSlot label={`Photo — ${post.title.slice(0, 24)}`} className="h-[150px] rounded-md mb-3" />
                    <span className="absolute top-2.5 left-2.5 bg-forest text-white text-[9.5px] font-bold px-2.5 py-1 rounded uppercase">
                      {post.category}
                    </span>
                  </div>
                  <div className="text-xs text-ink-soft font-semibold">{post.date}</div>
                  <h3 className="text-[15px] font-bold mt-1 leading-snug">
                    <Link href={`/journal/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <Link href={`/journal/${post.slug}`} className="link-arrow mt-2.5">
                    Read More <ArrowRight />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="border border-border rounded-md p-5.5 mb-5">
              <h4 className="text-xs font-extrabold uppercase tracking-wide mb-3.5">Categories</h4>
              <div className="space-y-0">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between py-2.5 border-b border-border last:border-b-0 text-[13.5px] font-semibold">
                    <span>{cat}</span>
                    <span className="text-ink-soft font-medium text-xs">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-border rounded-md p-5.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wide mb-3">Subscribe</h4>
              <p className="text-[13px] text-ink-soft mb-3.5">New articles, straight to your inbox.</p>
              <input type="email" placeholder="Enter your email" className="w-full border border-border rounded-lg px-3.5 py-3 text-sm mb-2.5 focus:outline-none focus:border-green" />
              <button className="btn-solid w-full justify-center">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
