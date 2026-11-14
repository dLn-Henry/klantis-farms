import { createClient } from "@/lib/supabase/server";
import type { MediaBucket } from "@/lib/media/constants";

export type MediaItem = {
  id: string;
  bucket: MediaBucket;
  path: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  createdAt: string;
  uploadedBy: string;
  /** Public URL for site-media; short-lived signed URL for private-media. */
  url: string | null;
};

const SIGNED_URL_SECONDS = 60 * 60;

export async function listMedia(limit = 200): Promise<MediaItem[]> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("media")
    .select("id, bucket, path, file_name, mime_type, size_bytes, alt_text, created_at, uploaded_by")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!rows || rows.length === 0) return [];

  const ids = Array.from(new Set(rows.map((r) => r.uploaded_by).filter((x): x is string => !!x)));
  const names = new Map<string, string>();
  if (ids.length) {
    const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", ids);
    (profiles ?? []).forEach((p) => names.set(p.id, p.display_name ?? "—"));
  }

  // One batched call for all private files rather than one per row.
  const privatePaths = rows.filter((r) => r.bucket === "private-media").map((r) => r.path);
  const signed = new Map<string, string>();
  if (privatePaths.length) {
    const { data } = await supabase.storage.from("private-media").createSignedUrls(privatePaths, SIGNED_URL_SECONDS);
    (data ?? []).forEach((d) => d.path && d.signedUrl && signed.set(d.path, d.signedUrl));
  }

  return rows.map((r) => ({
    id: r.id,
    bucket: r.bucket as MediaBucket,
    path: r.path,
    fileName: r.file_name,
    mimeType: r.mime_type,
    sizeBytes: Number(r.size_bytes),
    altText: r.alt_text ?? "",
    createdAt: r.created_at,
    uploadedBy: r.uploaded_by ? names.get(r.uploaded_by) ?? "—" : "—",
    url:
      r.bucket === "site-media"
        ? supabase.storage.from("site-media").getPublicUrl(r.path).data.publicUrl
        : signed.get(r.path) ?? null,
  }));
}
