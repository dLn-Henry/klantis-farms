import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { getPublishedPosts, getPostBySlug, getRelatedPosts } from "@/lib/data/repositories/posts";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  return { title: post?.title ?? "Farm Journal" };
}

export default async function ArticlePage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  // Draft/Scheduled posts exist for the dashboard preview but should never
  // be reachable on the public site, even by someone guessing the URL.
  if (!post || post.status !== "Published") return notFound();

  const related = await getRelatedPosts(post.slug, 3);

  return (
    <>
      <div className="bg-mist border-b border-border py-11">
        <div className="max-w-[1280px] mx-auto px-10">
          <div className="breadcrumb">
            <Link href="/">Home</Link><span className="sep">/</span>
            <Link href="/journal">Farm Journal</Link><span className="sep">/</span>
            <span>{post.category}</span>
          </div>
          <h1 className="text-[30px] font-extrabold tracking-tight max-w-2xl">{post.title}</h1>
          <div className="flex items-center gap-4 mt-3.5 text-xs text-ink-soft">
            <span className="w-7 h-7 rounded-full bg-green text-white flex items-center justify-center text-[11px] font-bold">
              {post.author.split(" ").map((w) => w[0]).join("")}
            </span>
            <span>{post.author}</span><span>·</span><span>{post.date}</span><span>·</span><span>{post.readingTime}</span>
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <PhotoSlot label={`Photo — ${post.title}`} className="h-[360px] rounded-2xl" />
          <div className="prose-farm max-w-[680px] mt-9">
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <span className="eyebrow">Keep Reading</span>
          <h2 className="text-3xl font-extrabold tracking-tight mb-7">Related Articles</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((p) => (
              <div key={p.slug}>
                <div className="relative">
                  <PhotoSlot label={`Photo — ${p.title.slice(0, 24)}`} className="h-[150px] rounded-md mb-3" />
                  <span className="absolute top-2.5 left-2.5 bg-forest text-white text-[9.5px] font-bold px-2.5 py-1 rounded uppercase">
                    {p.category}
                  </span>
                </div>
                <div className="text-xs text-ink-soft font-semibold">{p.date}</div>
                <h3 className="text-[15px] font-bold mt-1 leading-snug"><Link href={`/journal/${p.slug}`}>{p.title}</Link></h3>
                <Link href={`/journal/${p.slug}`} className="link-arrow mt-2.5">Read More <ArrowRight /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
