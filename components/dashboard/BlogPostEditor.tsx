"use client";

import { useRef, useState, useTransition } from "react";
import { AlertCircle, Loader2, Save, Lock, Bold, Italic, Heading2, Link2, List, Quote, ImagePlus, ImageIcon, X, Eye, Pencil } from "lucide-react";
import { createPost, updatePost } from "@/lib/actions/posts";
import type { Post } from "@/lib/data/repositories/posts";
import { MediaPicker, type PickerImage } from "@/components/media/MediaPicker";
import { MarkdownBody } from "@/components/content/MarkdownBody";

// Editor for both creating and editing. Publish/Schedule are only offered to
// Farm Owners and Managers -- that is a convenience; the database trigger
// refuses anyone else on every write regardless of what the form sends.
export function BlogPostEditor({
  post,
  canPublish,
  images,
  farmId,
}: {
  post?: Post;
  canPublish: boolean;
  /** Pictures from the farm's public media library (empty if the person can't open it). */
  images: PickerImage[];
  farmId: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Post["status"]>(post?.status ?? "Draft");
  const [body, setBody] = useState(post?.body ?? "");
  const [preview, setPreview] = useState(false);
  const [featured, setFeatured] = useState<{ path: string; url: string } | null>(
    post?.featuredImagePath && post.featuredImageUrl ? { path: post.featuredImagePath, url: post.featuredImageUrl } : null,
  );
  const [featuredAlt, setFeaturedAlt] = useState(post?.featuredImageAlt ?? "");
  const [picking, setPicking] = useState<null | "featured" | "inline">(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const canPick = !!farmId && images.length >= 0;

  // Wrap the selection (or insert at the cursor) with Markdown syntax.
  function wrap(before: string, after = before, placeholder = "text") {
    const el = bodyRef.current; if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const chosen = body.slice(a, b) || placeholder;
    const next = body.slice(0, a) + before + chosen + after + body.slice(b);
    setBody(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + before.length, a + before.length + chosen.length); });
  }
  function linePrefix(prefix: string) {
    const el = bodyRef.current; if (!el) return;
    const a = el.selectionStart;
    const lineStart = body.lastIndexOf("\n", a - 1) + 1;
    setBody(body.slice(0, lineStart) + prefix + body.slice(lineStart));
    requestAnimationFrame(() => el.focus());
  }
  function insertImage(img: PickerImage) {
    const el = bodyRef.current;
    const md = `\n\n![${(img.alt || img.name).replace(/[\[\]]/g, "")}](${img.url})\n\n`;
    const at = el ? el.selectionStart : body.length;
    setBody(body.slice(0, at) + md + body.slice(at));
  }

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

        <div className="mb-4.5">
          <span className="text-xs font-bold block mb-1.5">Featured image</span>
          <div className="flex items-start gap-4">
            <div className="w-40 h-24 rounded-md border border-border bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {featured ? <img src={featured.url} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="stroke-ink-soft" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 mb-2">
                <button type="button" disabled={!canPick} onClick={() => setPicking("featured")} className="btn-outline !py-1.5 !px-3 !text-xs">{featured ? "Change" : "Choose image"}</button>
                {featured && <button type="button" onClick={() => { setFeatured(null); setFeaturedAlt(""); }} className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-[#C62828]"><X size={13} /> Remove</button>}
              </div>
              {featured ? (
                <>
                  <label htmlFor="featuredImageAlt" className="text-[11.5px] font-bold block mb-1">Describe the image <span className="font-normal text-ink-soft">(for screen readers &amp; search)</span></label>
                  <input id="featuredImageAlt" name="featuredImageAlt" required maxLength={300} value={featuredAlt} onChange={(e) => setFeaturedAlt(e.target.value)} className={input} />
                </>
              ) : (
                <p className="text-[11.5px] text-ink-soft">Shown at the top of the post and in link previews. {!canPick && "Only a Farm Owner or Manager can use the media library."}</p>
              )}
              <input type="hidden" name="featuredImagePath" value={featured?.path ?? ""} />
            </div>
          </div>
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="body" className="text-xs font-bold">Body</label>
            <button type="button" onClick={() => setPreview(!preview)} className="inline-flex items-center gap-1.5 text-xs font-bold text-green">
              {preview ? <><Pencil size={13} /> Edit</> : <><Eye size={13} /> Preview</>}
            </button>
          </div>

          {!preview && (
            <div className="flex flex-wrap items-center gap-1 border border-border border-b-0 rounded-t-lg bg-surface px-2 py-1.5" role="toolbar" aria-label="Formatting">
              {[
                { l: "Bold", i: Bold, f: () => wrap("**") },
                { l: "Italic", i: Italic, f: () => wrap("*") },
                { l: "Heading", i: Heading2, f: () => linePrefix("## ") },
                { l: "Link", i: Link2, f: () => wrap("[", "](https://)", "link text") },
                { l: "Bulleted list", i: List, f: () => linePrefix("- ") },
                { l: "Quote", i: Quote, f: () => linePrefix("> ") },
              ].map((t) => (
                <button key={t.l} type="button" onClick={t.f} aria-label={t.l} title={t.l} className="p-2 rounded hover:bg-white text-ink-soft hover:text-ink"><t.i size={16} /></button>
              ))}
              <button type="button" disabled={!canPick} onClick={() => setPicking("inline")} className="ml-1 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded hover:bg-white text-green disabled:text-ink-soft" title={canPick ? "Insert a picture" : "Only a Farm Owner or Manager can use the media library"}>
                <ImagePlus size={15} /> Image
              </button>
            </div>
          )}

          {preview ? (
            <div className="border border-border rounded-lg p-5 min-h-[260px] prose-farm">
              {body.trim() ? <MarkdownBody markdown={body} /> : <p className="text-sm text-ink-soft">Nothing to preview yet.</p>}
            </div>
          ) : (
            <textarea
              ref={bodyRef}
              id="body"
              rows={14}
              maxLength={50000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your post. Leave a blank line between paragraphs. Use the toolbar for headings, links, lists and pictures."
              className={`${input} ${canPick ? "rounded-t-none" : ""} font-mono leading-relaxed`}
            />
          )}
          <input type="hidden" name="body" value={body} />
        </div>
      </fieldset>

      {!locked && (
        <button type="submit" disabled={isPending} className="btn-solid">
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {post ? "Save Changes" : "Create Post"}
        </button>
      )}

      {farmId && (
        <MediaPicker
          open={picking !== null}
          onClose={() => setPicking(null)}
          farmId={farmId}
          images={images}
          title={picking === "featured" ? "Choose the featured image" : "Insert a picture"}
          onPick={(img) => {
            if (picking === "featured") { setFeatured({ path: img.path, url: img.url }); if (!featuredAlt) setFeaturedAlt(img.alt); }
            else insertImage(img);
          }}
        />
      )}
    </form>
  );
}
