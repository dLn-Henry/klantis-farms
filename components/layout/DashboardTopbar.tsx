"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, ChevronDown, LogOut, Globe, Plus, UserRound } from "lucide-react";
import { useShell } from "@/components/layout/DashboardShell";
import { QUICK_ACTIONS } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";

export function DashboardTopbar({ title }: { title: string }) {
  const router = useRouter();
  const supabase = createClient();
  const { permissions, setPaletteOpen } = useShell();
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const actions = QUICK_ACTIONS.filter((a) => permissions.has(a.perm));
  const [userLabel, setUserLabel] = useState("...");
  const [userInitials, setUserInitials] = useState("··");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name || data.user?.email || "Account";
      setUserLabel(name);
      setUserInitials(
        name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?"
      );
    });
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="h-[76px] border-b border-border bg-white flex items-center justify-between px-6 lg:px-8 flex-shrink-0 relative">
      <h1 className="text-lg font-extrabold">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 h-9 rounded-full border border-border px-3.5 text-xs text-ink-soft hover:border-green"
          aria-label="Search (Ctrl+K)"
        >
          <Search size={14} /> Search <kbd className="text-[10px] font-bold bg-surface rounded px-1.5 py-0.5">Ctrl K</kbd>
        </button>
        <button type="button" onClick={() => setPaletteOpen(true)} className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface" aria-label="Search">
          <Search size={17} />
        </button>

        {actions.length > 0 && (
          <div className="relative hidden lg:block">
            <button type="button" onClick={() => setCreateOpen((v) => !v)} aria-haspopup="menu" aria-expanded={createOpen} className="btn-solid !py-2 !px-3.5 !text-xs">
              <Plus size={14} /> New
            </button>
            {createOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCreateOpen(false)} />
                <div role="menu" className="absolute top-full right-0 mt-2 w-56 bg-white border border-border rounded-md shadow-lg py-1.5 z-20">
                  {actions.map((a) => (
                    <Link key={a.href} href={a.href} role="menuitem" onClick={() => setCreateOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-surface">
                      <a.icon size={15} className="stroke-green" /> {a.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <Link href="/dashboard/notifications" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface" aria-label="Notifications">
          <Bell size={17} />
        </Link>

        <div className="relative pl-3 border-l border-border ml-1">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-green text-white flex items-center justify-center text-xs font-bold">
              {userInitials}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-sm font-semibold max-w-[140px] truncate">
              {userLabel} <ChevronDown size={14} className={`stroke-ink-soft transition-transform flex-shrink-0 ${menuOpen ? "rotate-180" : ""}`} />
            </span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-border rounded-md shadow-lg py-1.5 z-20">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-surface"
                  onClick={() => setMenuOpen(false)}
                >
                  <Globe size={15} className="stroke-ink-soft" /> View Public Site
                </Link>
                <Link
                  href="/account"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-surface"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserRound size={15} className="stroke-ink-soft" /> My account
                </Link>
                <div className="border-t border-border my-1.5" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#C62828] hover:bg-surface"
                >
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
