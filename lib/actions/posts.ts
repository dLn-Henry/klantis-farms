"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import type { Database } from "@/lib/supabase/types";
import { friendlyDbError } from "@/lib/actions/errors";

export type PostActionResult = { success: false; error: string };

type Status = "Draft" | "Scheduled" | "Published";
const STATUSES: Status[] = ["Draft", "Scheduled", "Published"];

// Lower-case, hyphen-separated, ASCII only, <= 80 chars, never the reserved
// route name "new". The database CHECK enforces the same shape; this just
// produces a valid one from a human title.
function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
  return !base || base === "new" ? `post-${randomSuffix()}` : base;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

// ~200 words per minute, never less than a minute.
function readingTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

type Parsed =
  | { ok: false; error: string }
  | {
      ok: true;
      title: string;
      category: string | null;
      excerpt: string | null;
      body: string;
      status: Status;
      publishedAt: string | null;
    };

// Shape-only validation. WHO may publish is not decided here -- the database
// trigger decides that on every write, so forcing the request still fails.
function parse(formData: FormData): Parsed {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n").trim();
  const status = String(formData.get("status") ?? "Draft") as Status;
  const scheduledFor = String(formData.get("scheduledFor") ?? "").trim();

  if (!title) return { ok: false, error: "Give the post a title." };
  if (title.length > 200) return { ok: false, error: "The title is too long (200 characters at most)." };
  if (excerpt.length > 500) return { ok: false, error: "The excerpt is too long (500 characters at most)." };
  if (category.length > 60) return { ok: false, error: "The category is too long (60 characters at most)." };
  if (body.length > 50000) return { ok: false, error: "The body is too long (50,000 characters at most)." };
  if (!STATUSES.includes(status)) return { ok: false, error: "Choose Draft, Scheduled or Published." };
  if (status !== "Draft" && !body) return { ok: false, error: "Write the post body before publishing or scheduling it." };

  let publishedAt: string | null = null;
  if (status === "Scheduled") {
    if (!scheduledFor) return { ok: false, error: "Choose when this post should go live." };
    // datetime-local has no zone. The server runs in UTC, which is also
    // Ghana's zone, so this is exact for the farm's actual location.
    const when = new Date(scheduledFor);
    if (Number.isNaN(when.getTime())) return { ok: false, error: "That date and time isn't valid." };
    if (when.getTime() <= Date.now()) return { ok: false, error: "Pick a time in the future, or choose Published to go live now." };
    publishedAt = when.toISOString();
  }

  return {
    ok: true,
    title,
    category: category || null,
    excerpt: excerpt || null,
    body,
    status,
    publishedAt,
  };
}

function revalidateBlog(slug?: string) {
  revalidatePath("/dashboard/blog");
  revalidatePath("/journal");
  if (slug) revalidatePath(`/journal/${slug}`);
}

export async function createPost(formData: FormData): Promise<PostActionResult> {
  const parsed = parse(formData);
  if (!parsed.ok) return { success: false, error: parsed.error };

  const supabase = createClient();
  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const row = {
    farm_id: farmId,
    title: parsed.title,
    category: parsed.category,
    excerpt: parsed.excerpt,
    body: parsed.body,
    reading_time: readingTime(parsed.body),
    status: parsed.status,
    published_at: parsed.publishedAt,
  };

  // The slug comes from the title. If it's taken, retry once with a short
  // suffix; the unique constraint is the real arbiter, not a pre-check.
  let slug = slugify(parsed.title);
  let { error } = await supabase.from("blog_posts").insert({ ...row, slug });
  if (error?.code === "23505") {
    slug = `${slug.slice(0, 75)}-${randomSuffix()}`;
    ({ error } = await supabase.from("blog_posts").insert({ ...row, slug }));
  }
  if (error) return { success: false, error: friendlyDbError(error, { unique: "A post with that title already exists." }) };

  revalidateBlog(slug);
  redirect("/dashboard/blog");
}

export async function updatePost(id: string, formData: FormData): Promise<PostActionResult> {
  if (!id) return { success: false, error: "Missing post." };
  const parsed = parse(formData);
  if (!parsed.ok) return { success: false, error: parsed.error };

  const supabase = createClient();
  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  // The slug is deliberately NOT updated: changing it would break links
  // already shared or indexed. farm_id and author are immutable in the
  // database too.
  const patch: Database["public"]["Tables"]["blog_posts"]["Update"] = {
    title: parsed.title,
    category: parsed.category,
    excerpt: parsed.excerpt,
    body: parsed.body,
    reading_time: readingTime(parsed.body),
    status: parsed.status,
  };
  // Only a Scheduled post carries a date we choose; for Published/Draft the
  // database sets or keeps published_at itself.
  if (parsed.status === "Scheduled") patch.published_at = parsed.publishedAt;
  if (parsed.status === "Draft") patch.published_at = null;

  const { data, error } = await supabase
    .from("blog_posts")
    .update(patch)
    .eq("id", id)
    .eq("farm_id", farmId)
    .select("slug");

  if (error) return { success: false, error: friendlyDbError(error) };
  // RLS hides rows you can't touch, so an update that matched nothing means
  // the post doesn't exist or isn't on your farm.
  if (!data || data.length === 0) return { success: false, error: "That post could not be found on your farm." };

  revalidateBlog(data[0].slug);
  redirect("/dashboard/blog");
}
