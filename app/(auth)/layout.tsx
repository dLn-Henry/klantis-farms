import Link from "next/link";
import { SITE_CONTENT } from "@/lib/site-config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mist flex flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="flex items-center gap-3 mb-8">
        <span className="w-10 h-10 rounded-[10px] bg-green flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" className="w-[22px] h-[22px]">
            <path d="M12 3c-3 3-3 7 0 10 3-3 3-7 0-10Z" />
            <path d="M12 13v8" />
            <path d="M8 21h8" />
          </svg>
        </span>
        <span>
          <span className="block text-[19px] font-extrabold tracking-tight leading-tight">
            {SITE_CONTENT.name}
          </span>
          <span className="block text-[10.5px] text-ink-soft font-medium">{SITE_CONTENT.tagline}</span>
        </span>
      </Link>
      <div className="w-full max-w-[420px] bg-white border border-border rounded-2xl p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
