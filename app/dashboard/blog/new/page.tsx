import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { BlogPostEditor } from "@/components/dashboard/BlogPostEditor";
import { getMyRoleName } from "@/lib/data/current-farm";

export const metadata: Metadata = { title: "New Post" };

export default async function NewBlogPostPage() {
  const role = await getMyRoleName();
  const canPublish = role === "Farm Owner" || role === "Farm Manager";

  return (
    <>
      <DashboardTopbar title="Blog" />
      <div className="p-6 lg:p-8 max-w-[700px]">
        <Link href="/dashboard/blog" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Blog
        </Link>
        <h2 className="text-xl font-extrabold mb-7">New Post</h2>
        <BlogPostEditor canPublish={canPublish} />
      </div>
    </>
  );
}
