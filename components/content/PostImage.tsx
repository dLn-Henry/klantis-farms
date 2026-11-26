import { PhotoSlot } from "@/components/ui/PhotoSlot";

// A post's featured image, or the placeholder tile when it has none.
// next/image isn't used because the picture is already a sized public file;
// `loading="lazy"` keeps long lists light.
export function PostImage({
  url, alt, fallbackLabel, className, priority = false,
}: { url: string | null; alt: string; fallbackLabel: string; className: string; priority?: boolean }) {
  if (!url) return <PhotoSlot label={fallbackLabel} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} loading={priority ? "eager" : "lazy"} className={`${className} w-full object-cover`} />
  );
}
