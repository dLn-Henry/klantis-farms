"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, Plus, Bell, Search, X, ListChecks, Stethoscope, Beef, ShoppingBag } from "lucide-react";
import { useShell } from "@/components/layout/DashboardShell";
import { NavTree } from "@/components/layout/NavTree";
import { QUICK_ACTIONS, canSee, ALL_ITEMS } from "@/lib/navigation";

// Phones and tablets: a bottom bar for the things done most often, a "+"
// quick-create sheet, and the full navigation in a slide-in drawer.
export function MobileNav() {
  const pathname = usePathname();
  const { permissions, site, drawerOpen, setDrawerOpen, quickOpen, setQuickOpen, setPaletteOpen } = useShell();
  const drawer = useRef<HTMLDialogElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);

  useEffect(() => { const d = drawer.current; if (!d) return; if (drawerOpen && !d.open) d.showModal(); if (!drawerOpen && d.open) d.close(); }, [drawerOpen]);
  useEffect(() => { const d = sheet.current; if (!d) return; if (quickOpen && !d.open) d.showModal(); if (!quickOpen && d.open) d.close(); }, [quickOpen]);

  const actions = QUICK_ACTIONS.filter((a) => permissions.has(a.perm));
  // The second slot is the first of these the person's roles include.
  const candidates = [
    { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
    { href: "/dashboard/veterinary", label: "Vet", icon: Stethoscope },
    { href: "/dashboard/livestock", label: "Animals", icon: Beef },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  ].filter((c) => { const it = ALL_ITEMS.find((i) => i.href === c.href); return it && canSee(it, permissions); });
  const second = candidates[0];

  const slot = (href: string, label: string, Icon: typeof Home) => {
    const on = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
    return (
      <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10.5px] font-bold ${on ? "text-green" : "text-ink-soft"}`}>
        <Icon size={20} /> {label}
      </Link>
    );
  };

  return (
    <>
      <nav aria-label="Quick navigation" className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border flex items-center justify-around px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {slot("/dashboard", "Home", Home)}
        {second ? slot(second.href, second.label, second.icon) : (
          <button type="button" onClick={() => setPaletteOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10.5px] font-bold text-ink-soft"><Search size={20} /> Search</button>
        )}
        {actions.length > 0 ? (
          <button type="button" onClick={() => setQuickOpen(true)} aria-label="Create new" className="-mt-5 w-12 h-12 rounded-full bg-green text-white flex items-center justify-center shadow-lg"><Plus size={24} /></button>
        ) : (
          <button type="button" onClick={() => setPaletteOpen(true)} aria-label="Search" className="-mt-5 w-12 h-12 rounded-full bg-green text-white flex items-center justify-center shadow-lg"><Search size={22} /></button>
        )}
        {slot("/dashboard/notifications", "Alerts", Bell)}
        <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10.5px] font-bold text-ink-soft"><Menu size={20} /> More</button>
      </nav>

      <dialog ref={drawer} onClose={() => setDrawerOpen(false)} onClick={(e) => { if (e.target === drawer.current) setDrawerOpen(false); }} aria-label="Menu"
        className="m-0 mr-auto h-full max-h-none w-[300px] max-w-[88vw] p-0 bg-forest text-[#DCEBE0] backdrop:bg-black/50">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <span className="text-white font-extrabold text-[15px]">{site.name}</span>
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="p-1.5 rounded hover:bg-white/10"><X size={18} /></button>
          </div>
          <NavTree onNavigate={() => setDrawerOpen(false)} />
        </div>
      </dialog>

      <dialog ref={sheet} onClose={() => setQuickOpen(false)} onClick={(e) => { if (e.target === sheet.current) setQuickOpen(false); }} aria-label="Create new"
        className="m-0 mt-auto w-full max-w-none rounded-t-2xl p-0 backdrop:bg-black/50">
        <div className="px-5 pt-4 pb-6">
          <div className="flex items-center justify-between mb-3"><h2 className="text-base font-extrabold">Create new</h2>
            <button type="button" onClick={() => setQuickOpen(false)} aria-label="Close" className="p-1.5 rounded hover:bg-surface"><X size={18} /></button></div>
          <ul className="grid grid-cols-2 gap-2.5">
            {actions.map((a) => (
              <li key={a.href}><Link href={a.href} onClick={() => setQuickOpen(false)} className="flex items-center gap-2.5 border border-border rounded-md px-3.5 py-3 text-sm font-bold hover:border-green"><a.icon size={17} className="stroke-green" /> {a.label}</Link></li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
