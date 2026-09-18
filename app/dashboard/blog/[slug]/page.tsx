import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { BlogPostEditor } from "@/components/dashboard/BlogPostEditor";
import { getPostBySlug } from "@/lib/data/repositories/posts";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  return { title: post?.title ?? "Blog Post" };
}

export default async function BlogPostEditPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) return notFound();

  return (
    <>
      <DashboardTopbar title="Blog" />

      <div className="p-6 lg:p-8 max-w-[700px]">
        <div className="flex items-center justify-between mb-5">
          <Link href="/dashboard/blog" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green">
            <ChevronLeft size={14} /> Back to Blog
          </Link>
          {post.status === "Published" && (
            <a href={`/journal/${post.slug}`} target="_blank" rel="noreferrer" className="link-arrow">
              View Live <ExternalLink size={13} />
            </a>
          )}
        </div>

        <h2 className="text-xl font-extrabold mb-7">Edit Post</h2>

        <BlogPostEditor post={post} />
      </div>
    </>
  );
}
