// Where images may come from. Public pages only ever show pictures from THIS
// project's public Supabase Storage bucket -- never an arbitrary URL typed or
// pasted into a post (tracking pixels, hotlinked or hostile images).
export function publicMediaBase(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  return `${url.replace(/\/$/, "")}/storage/v1/object/public/site-media/`;
}

export function publicMediaUrl(path: string | null | undefined): string | null {
  const base = publicMediaBase();
  if (!base || !path) return null;
  return `${base}${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function isAllowedImageUrl(url: string): boolean {
  const base = publicMediaBase();
  return !!base && url.startsWith(base) && !url.slice(base.length).includes("..");
}

// ![alt](url "title") occurrences in a markdown string.
const IMAGE_RE = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;

export function markdownImageUrls(markdown: string): string[] {
  return Array.from(markdown.matchAll(IMAGE_RE)).map((m) => m[1]);
}

// Pictures inside a post must come from THIS farm's public media folder -- not
// a pasted link to some other website. (Public pages also refuse any other
// image at render time; this gives the author a clear message up front.)
export function foreignImages(markdown: string, farmId: string): string[] {
  const base = publicMediaBase();
  const mine = base ? `${base}${farmId}/` : null;
  return markdownImageUrls(markdown).filter((u) => !mine || !u.startsWith(mine) || u.slice(mine.length).includes(".."));
}
