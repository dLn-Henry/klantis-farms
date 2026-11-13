import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getCurrentFarmId } from "@/lib/data/current-farm";

export type PostStatus = "Published" | "Draft" | "Scheduled";

export type Post = {
  id: string;
  slug: string;
  category: string;
  title: string;
  date: string;
  excerpt: string;
  body: string[];
  author: string;
  readingTime: string;
  status: PostStatus;
  // ISO timestamp. For Scheduled posts this is when they go live.
  publishedAt: string | null;
};

type PostRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  body: string | null;
  author_name: string | null;
  reading_time: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
};

// Never select author_id or farm_id for the public site: an anonymous visitor
// only needs what is rendered on the page.
const PUBLIC_COLUMNS =
  "id, slug, title, category, excerpt, body, author_name, reading_time, status, published_at, created_at";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  // UTC on purpose: Ghana is UTC+0, and a fixed zone keeps server and client
  // renders identical.
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// A Scheduled post whose time has passed is live to the public (the database
// policy computes the same thing at query time -- there is no cron job), so
// everywhere in the app it counts as Published.
function effectiveStatus(status: string, publishedAt: string | null): PostStatus {
  if (status === "Scheduled" && publishedAt && new Date(publishedAt).getTime() <= Date.now()) {
    return "Published";
  }
  return status as PostStatus;
}

// Body is a single text column; paragraphs are separated by blank lines.
function splitBody(body: string | null): string[] {
  return (body ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category ?? "Uncategorised",
    title: row.title,
    date: formatDate(row.published_at ?? row.created_at),
    excerpt: row.excerpt ?? "",
    body: splitBody(row.body),
    author: row.author_name ?? "Farm team",
    readingTime: row.reading_time ?? "1 min read",
    status: effectiveStatus(row.status, row.published_at),
    publishedAt: row.published_at,
  };
}

// ---------------------------------------------------------------------------
// PUBLIC (anonymous client). Row Level Security only ever returns live posts;
// the explicit filter is a second layer, and the status check is a third.
// ---------------------------------------------------------------------------
function liveFilter() {
  return `status.eq.Published,and(status.eq.Scheduled,published_at.lte.${new Date().toISOString()})`;
}

export async function getPublishedPosts(): Promise<Post[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(PUBLIC_COLUMNS)
    .or(liveFilter())
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return (data as PostRow[]).map(toPost).filter((p) => p.status === "Published");
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | undefined> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .or(liveFilter())
    .limit(1)
    .maybeSingle();
  if (!data) return undefined;
  const post = toPost(data as PostRow);
  return post.status === "Published" ? post : undefined;
}

export async function getRelatedPosts(currentSlug: string, limit = 3, category?: string): Promise<Post[]> {
  const others = (await getPublishedPosts()).filter((p) => p.slug !== currentSlug);
  // Same-category articles first, then the rest by recency.
  const same = others.filter((p) => category && p.category === category);
  const rest = others.filter((p) => !(category && p.category === category));
  return [...same, ...rest].slice(0, limit);
}

// ---------------------------------------------------------------------------
// DASHBOARD (signed-in session client). Row Level Security lets a member see
// their own farm's posts -- and, because live posts are public, other farms'
// live posts too. So every query is scoped to the member's own farm explicitly.
// ---------------------------------------------------------------------------
export async function getAllPosts(): Promise<Post[]> {
  const farmId = await getCurrentFarmId();
  if (!farmId) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(PUBLIC_COLUMNS)
    .eq("farm_id", farmId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as PostRow[]).map(toPost);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const farmId = await getCurrentFarmId();
  if (!farmId) return undefined;
  const supabase = createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(PUBLIC_COLUMNS)
    .eq("farm_id", farmId)
    .eq("slug", slug)
    .maybeSingle();
  return data ? toPost(data as PostRow) : undefined;
}
