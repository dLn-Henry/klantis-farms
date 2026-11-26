"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { NavTree } from "@/components/layout/NavTree";
import { useShell } from "@/components/layout/DashboardShell";

// Desktop sidebar. (Below `lg` the same navigation lives in MobileNav's drawer.)
export function DashboardSidebar() {
  const { site, setPaletteOpen } = useShell();
  return (
    <aside className="w-64 flex-shrink-0 bg-forest text-[#DCEBE0] min-h-screen hidden lg:flex flex-col sticky top-0 h-screen">
      <Link href="/" className="flex items-center gap-2.5 px-6 py-5 border-b border-white/10">
        <BrandMark logoUrl={site.logoUrl} name={site.name} className="w-9 h-9 rounded-[9px]" onDark />
        <span className="text-white font-extrabold text-[15px] leading-tight">{site.name}</span>
      </Link>
      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="w-full flex items-center justify-between gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-[12.5px] text-[#9DB3A5]"
        >
          <span className="flex items-center gap-2"><Search size={14} /> Search…</span>
          <kbd className="text-[10px] font-bold bg-white/10 rounded px-1.5 py-0.5">Ctrl K</kbd>
        </button>
      </div>
      <NavTree />
    </aside>
  );
}
