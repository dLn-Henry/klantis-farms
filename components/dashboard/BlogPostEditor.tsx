"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import type { Post } from "@/lib/data/repositories/posts";

export function BlogPostEditor({ post }: { post: Post }) {
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [status, setStatus] = useState(post.status);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // No backend yet — this updates local state only, not the underlying
    // data file. A real save would persist to the blog_posts table.
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave}>
      {saved && (
        <div className="flex items-center gap-2.5 bg-mist border border-border rounded-md px-4 py-3 mb-5">
          <CheckCircle2 size={16} className="stroke-green flex-shrink-0" />
          <span className="text-sm font-semibold">
            Saved locally. This won&apos;t persist yet — there&apos;s no backend to save to.
          </span>
        </div>
      )}

      <div className="mb-4.5">
        <label className="text-xs font-bold block mb-1.5">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-border rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-green"
        />
      </div>

      <div className="mb-4.5">
        <label className="text-xs font-bold block mb-1.5">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="w-full border border-border rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-green"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4.5 mb-6">
        <div>
          <label className="text-xs font-bold block mb-1.5">Category</label>
          <input
            defaultValue={post.category}
            className="w-full border border-border rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-green"
          />
        </div>
        <div>
          <label className="text-xs font-bold block mb-1.5">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Post["status"])}
            className="w-full border border-border rounded-lg px-3.5 py-3 text-sm bg-white focus:outline-none focus:border-green"
          >
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Published">Published</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-bold block mb-1.5">Body</label>
        <textarea
          defaultValue={post.body.join("\n\n")}
          rows={10}
          className="w-full border border-border rounded-lg px-3.5 py-3 text-sm font-mono leading-relaxed focus:outline-none focus:border-green"
        />
      </div>

      <button type="submit" className="btn-solid">
        <Save size={15} /> Save Changes
      </button>
    </form>
  );
}
