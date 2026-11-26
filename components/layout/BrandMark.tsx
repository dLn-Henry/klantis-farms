// The little square next to the farm name: the uploaded logo if there is one,
// otherwise the default leaf mark.
export function BrandMark({
  logoUrl,
  name,
  className = "w-10 h-10 rounded-[10px]",
  onDark = false,
}: { logoUrl: string | null; name: string; className?: string; onDark?: boolean }) {
  if (logoUrl) {
    return (
      <span className={`${className} ${onDark ? "bg-white" : "bg-white border border-border"} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name} className="w-full h-full object-contain" />
      </span>
    );
  }
  return (
    <span className={`${className} bg-green flex items-center justify-center flex-shrink-0`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" className="w-[22px] h-[22px]" aria-hidden="true">
        <path d="M12 3c-3 3-3 7 0 10 3-3 3-7 0-10Z" />
        <path d="M12 13v8" />
        <path d="M8 21h8" />
      </svg>
    </span>
  );
}
