import Link from "next/link";
import { getSiteContent } from "@/lib/site-settings";
import { BrandMark } from "@/components/layout/BrandMark";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const SITE_CONTENT = await getSiteContent();
  return (
    <div className="min-h-screen bg-mist flex flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="flex items-center gap-3 mb-8">
        <BrandMark logoUrl={SITE_CONTENT.logoUrl} name={SITE_CONTENT.name} className="w-10 h-10 rounded-[10px]" />
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
