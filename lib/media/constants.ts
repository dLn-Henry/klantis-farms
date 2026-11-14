// Shared by the browser uploader and the server actions. The database and the
// Storage buckets enforce the same limits independently (migration 0017);
// this copy exists only so the UI can refuse early with a friendly message.

export const MEDIA_BUCKETS = ["site-media", "private-media"] as const;
export type MediaBucket = (typeof MEDIA_BUCKETS)[number];

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME: Record<MediaBucket, readonly string[]> = {
  "site-media": ["image/jpeg", "image/png", "image/webp", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"],
  "private-media": ["image/jpeg", "image/png", "image/webp", "application/pdf"],
};

export const EXT_FOR_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
  "application/pdf": "pdf",
};

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
