import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllPosts } from "@/lib/data/repositories/posts";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogManagementPage() {
  const posts = await getAllPosts();

  return (
    <>
      <DashboardTopbar title="Blog" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Farm Journal Posts</h2>
            <p className="text-sm text-ink-soft mt-0.5">What's published, drafted, or scheduled on the public Farm Journal.</p>
          </div>
          <button className="btn-solid"><Plus size={15} /> New Post</button>
        </div>

        <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Author</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.slug} className="border-b border-border last:border-b-0 hover:bg-surface">
                  <td className="px-5 py-3.5 font-bold">{p.title}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{p.category}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{p.author}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{p.date}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/dashboard/blog/${p.slug}`} className="text-green font-bold text-xs">Edit →</Link>
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
