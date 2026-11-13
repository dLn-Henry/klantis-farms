"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2, Save, Lock } from "lucide-react";
import { createPost, updatePost } from "@/lib/actions/posts";
import type { Post } from "@/lib/data/repositories/posts";

// Editor for both creating and editing. Publish/Schedule are only offered to
// Farm Owners and Managers -- that is a convenience; the database trigger
// refuses anyone else on every write regardless of what the form sends.
export function BlogPostEditor({
  post,
  canPublish,
}: {
  post?: Post;
  canPublish: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Post["status"]>(post?.status ?? "Draft");

  // A non-publisher can't change a post that is already live (the database
  // refuses it), so say so up front instead of letting them hit the error.
  const locked = !!post && post.status !== "Draft" && !canPublish;

  // For an existing Scheduled post, prefill the datetime-local input (UTC).
  const scheduledDefault =
    post?.status === "Scheduled" && post.publishedAt ? post.publishedAt.slice(0, 16) : "";

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = post ? await updatePost(post.id, formData) : await createPost(formData);
      // On success the action redirects, so this only runs on failure.
      if (result && !result.success) setError(result.error);
    });
  }

  const input =
    "w-full border border-border rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-green disabled:bg-surface disabled:text-ink-soft";

  return (
    <form action={handleSubmit}>
      {locked && (
        <div className="flex items-center gap-3 bg-surface border border-border rounded-md px-4 py-3.5 mb-5">
          <Lock size={16} className="stroke-ink-soft flex-shrink-0" />
          <span className="text-sm font-semibold">
            This post is live. Only a Farm Owner or Farm Manager can edit or unpublish it.
          </span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-4 py-3.5 mb-5">
          <AlertCircle size={18} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <fieldset disabled={locked || isPending} className="space-y-4.5">
        <div className="mb-4.5">
          <label htmlFor="title" className="text-xs font-bold block mb-1.5">Title</label>
          <input id="title" name="title" required maxLength={200} defaultValue={post?.title} className={input} />
        </div>

        <div className="mb-4.5">
          <label htmlFor="excerpt" className="text-xs font-bold block mb-1.5">Excerpt</label>
          <textarea id="excerpt" name="excerpt" rows={3} maxLength={500} defaultValue={post?.excerpt} className={input} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4.5 mb-4.5">
          <div>
            <label htmlFor="category" className="text-xs font-bold block mb-1.5">Category</label>
            <input id="category" name="category" maxLength={60} defaultValue={post?.category === "Uncategorised" ? "" : post?.category} className={input} />
          </div>
          <div>
            <label htmlFor="status" className="text-xs font-bold block mb-1.5">Status</label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Post["status"])}
              className={`${input} bg-white`}
            >
              <option value="Draft">Draft</option>
              {canPublish && <option value="Scheduled">Scheduled</option>}
              {canPublish && <option value="Published">Published</option>}
            </select>
            {!canPublish && (
              <p className="text-[11.5px] text-ink-soft mt-1.5">
                You can save drafts. A Farm Owner or Manager publishes them.
              </p>
            )}
          </div>
        </div>

        {status === "Scheduled" && (
          <div className="mb-4.5">
            <label htmlFor="scheduledFor" className="text-xs font-bold block mb-1.5">Go live on (UTC / Ghana time)</label>
            <input id="scheduledFor" name="scheduledFor" type="datetime-local" required defaultValue={scheduledDefault} className={input} />
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="body" className="text-xs font-bold block mb-1.5">Body</label>
          <textarea
            id="body"
            name="body"
            rows={12}
            maxLength={50000}
            defaultValue={post?.body.join("\n\n")}
            placeholder="Separate paragraphs with a blank line."
            className={`${input} font-mono leading-relaxed`}
          />
        </div>
      </fieldset>

      {!locked && (
        <button type="submit" disabled={isPending} className="btn-solid">
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {post ? "Save Changes" : "Create Post"}
        </button>
      )}
    </form>
  );
}
