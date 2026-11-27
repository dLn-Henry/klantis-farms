"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { MobileNav } from "@/components/layout/MobileNav";
import { savePreferences } from "@/lib/actions/preferences";
import { itemForPath } from "@/lib/navigation";
import type { Preferences } from "@/lib/data/repositories/preferences";

type Shell = {
  permissions: ReadonlySet<string>;
  roles: string[];
  site: { name: string; logoUrl: string | null };
  prefs: Preferences;
  recents: string[];
  toggleFavourite: (href: string) => void;
  toggleGroup: (title: string) => void;
  setShowPlanned: (v: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  quickOpen: boolean;
  setQuickOpen: (v: boolean) => void;
};

const Ctx = createContext<Shell | null>(null);
export function useShell(): Shell {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShell must be used inside <DashboardShell>");
  return v;
}

const RECENTS_KEY = "klantis.recents";

// Holds what the navigation pieces share: who the person is (permissions),
// their saved preferences, recent pages, and the open/closed state of the
// palette, mobile drawer and quick-create sheet.
export function DashboardShell({
  permissions, roles, site, initialPrefs, banner, children,
}: {
  permissions: string[]; roles: string[]; site: { name: string; logoUrl: string | null };
  initialPrefs: Preferences; banner?: React.ReactNode; children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [prefs, setPrefs] = useState(initialPrefs);
  const [recents, setRecents] = useState<string[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [, startTransition] = useTransition();
  const perms = useMemo(() => new Set(permissions), [permissions]);

  // Optimistic: update the screen now, save in the background.
  const save = useCallback((next: Preferences, patch: Parameters<typeof savePreferences>[0]) => {
    setPrefs(next);
    startTransition(() => { void savePreferences(patch); });
  }, []);

  const toggleFavourite = useCallback((href: string) => {
    const has = prefs.favourites.includes(href);
    const favourites = has ? prefs.favourites.filter((h) => h !== href) : [...prefs.favourites, href].slice(0, 12);
    save({ ...prefs, favourites }, { favourites });
  }, [prefs, save]);
  const toggleGroup = useCallback((title: string) => {
    const collapsedGroups = prefs.collapsedGroups.includes(title)
      ? prefs.collapsedGroups.filter((g) => g !== title) : [...prefs.collapsedGroups, title];
    save({ ...prefs, collapsedGroups }, { collapsedGroups });
  }, [prefs, save]);
  const setShowPlanned = useCallback((showPlanned: boolean) => save({ ...prefs, showPlanned }, { showPlanned }), [prefs, save]);

  // Recently visited pages (this browser only; not worth a database write per click).
  useEffect(() => { try { setRecents(JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]")); } catch { /* ignore */ } }, []);
  useEffect(() => {
    const item = itemForPath(pathname);
    if (!item || item.href === "/dashboard") return;
    setRecents((prev) => {
      const next = [item.href, ...prev.filter((h) => h !== item.href)].slice(0, 5);
      try { localStorage.setItem(RECENTS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    setDrawerOpen(false); setQuickOpen(false);
  }, [pathname]);

  // Ctrl/Cmd + K opens the palette from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value: Shell = {
    permissions: perms, roles, site, prefs, recents, toggleFavourite, toggleGroup, setShowPlanned,
    paletteOpen, setPaletteOpen, drawerOpen, setDrawerOpen, quickOpen, setQuickOpen,
  };

  return (
    <Ctx.Provider value={value}>
      <div className="flex min-h-screen bg-surface">
        <DashboardSidebar />
        <div className="flex-1 min-w-0 pb-20 lg:pb-0">
          {banner}
          {children}
        </div>
      </div>
      <MobileNav />
      <CommandPalette />
    </Ctx.Provider>
  );
}
