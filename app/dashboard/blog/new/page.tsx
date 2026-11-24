import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { BlogPostEditor } from "@/components/dashboard/BlogPostEditor";
import { getAccess, can } from "@/lib/auth/access";
import { listMedia } from "@/lib/data/repositories/media";
import { getCurrentFarmId } from "@/lib/data/current-farm";

export const metadata: Metadata = { title: "New Post" };

export default async function NewBlogPostPage() {
  const access = await getAccess();
  const canPublish = can(access, "content.publish");
  // Only people who may open the media library (Owner/Manager) get pictures here.
  const [media, farmId] = await Promise.all([can(access, "media.view") ? listMedia() : Promise.resolve([]), getCurrentFarmId()]);
  const images = media
    .filter((m) => m.bucket === "site-media" && m.mimeType.startsWith("image/") && m.url)
    .map((m) => ({ id: m.id, path: m.path, url: m.url!, alt: m.altText, name: m.fileName }));

  return (
    <>
      <DashboardTopbar title="Blog" />
      <div className="p-6 lg:p-8 max-w-[760px]">
        <Link href="/dashboard/blog" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Blog
        </Link>
        <h2 className="text-xl font-extrabold mb-7">New Post</h2>
        <BlogPostEditor canPublish={canPublish} images={images} farmId={can(access, "media.create") ? farmId : null} />
      </div>
    </>
  );
}
