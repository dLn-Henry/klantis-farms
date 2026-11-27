"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Star } from "lucide-react";
import { useShell } from "@/components/layout/DashboardShell";
import { ALL_ITEMS, canSee, itemForPath, visibleGroups, type NavItem } from "@/lib/navigation";

// The navigation list shared by the desktop sidebar and the mobile drawer:
// Favourites, Recent, then the nine groups (collapsible). Items the person's
// roles don't include are not shown; unbuilt ones carry a SOON tag.
export function NavTree({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { permissions, prefs, recents, toggleFavourite, toggleGroup, setShowPlanned } = useShell();
  const active = itemForPath(pathname)?.href;
  const groups = visibleGroups(permissions, prefs.showPlanned);
  const byHref = new Map(ALL_ITEMS.map((i) => [i.href, i]));
  const pick = (hrefs: string[]) => hrefs.map((h) => byHref.get(h)).filter((i): i is NavItem => !!i && i.status === "live" && canSee(i, permissions));
  const favourites = pick(prefs.favourites);
  const recent = pick(recents).filter((i) => !prefs.favourites.includes(i.href)).slice(0, 4);

  const row = (item: NavItem, opts: { star?: boolean } = {}) => {
    const isActive = active === item.href;
    if (item.status === "planned") {
      return (
        <div key={item.href} className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-[13px] font-medium text-[#7E9789] cursor-not-allowed" aria-disabled="true">
          <span className="flex items-center gap-2.5"><item.icon size={16} /> {item.label}</span>
          <span className="text-[9px] font-bold bg-white/10 px-1.5 py-0.5 rounded">SOON</span>
        </div>
      );
    }
    const pinned = prefs.favourites.includes(item.href);
    return (
      <div key={item.href} className={`group flex items-center rounded-md ${isActive ? "bg-green" : "hover:bg-white/5"}`}>
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={isActive ? "page" : undefined}
          className={`flex-1 min-w-0 flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-semibold ${isActive ? "text-white" : "text-[#DCEBE0]"}`}
        >
          <item.icon size={16} className="flex-shrink-0" /> <span className="truncate">{item.label}</span>
        </Link>
        {opts.star !== false && item.href !== "/dashboard" && (
          <button
            type="button"
            onClick={() => toggleFavourite(item.href)}
            aria-label={pinned ? `Remove ${item.label} from favourites` : `Add ${item.label} to favourites`}
            aria-pressed={pinned}
            className={`p-2 mr-0.5 rounded ${pinned ? "text-gold" : "text-white/40 lg:opacity-0 group-hover:opacity-100 focus:opacity-100"} hover:text-gold`}
          >
            <Star size={13} fill={pinned ? "currentColor" : "none"} />
          </button>
        )}
      </div>
    );
  };

  const head = "text-[10px] font-bold uppercase tracking-wider text-[#7E9789] px-2 mb-2";
  return (
    <>
      <nav aria-label="Dashboard" className="flex-1 overflow-y-auto py-4 px-4">
        {favourites.length > 0 && (
          <div className="mb-5"><div className={head}>Favourites</div><div className="space-y-0.5">{favourites.map((i) => row(i, { star: true }))}</div></div>
        )}
        {recent.length > 0 && (
          <div className="mb-5"><div className={head}>Recent</div><div className="space-y-0.5">{recent.map((i) => row(i, { star: false }))}</div></div>
        )}
        {groups.map((group) => {
          const collapsed = prefs.collapsedGroups.includes(group.title) && group.items.every((i) => i.href !== active);
          return (
            <div key={group.title} className="mb-4">
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                aria-expanded={!collapsed}
                className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#7E9789] hover:text-white px-2 mb-1.5"
              >
                {group.title} <ChevronDown size={12} className={`transition-transform ${collapsed ? "-rotate-90" : ""}`} />
              </button>
              {!collapsed && <div className="space-y-0.5">{group.items.map((i) => row(i))}</div>}
            </div>
          );
        })}
      </nav>
      <div className="px-5 py-3 border-t border-white/10">
        <label className="flex items-center gap-2 text-[11.5px] text-[#9DB3A5] cursor-pointer">
          <input type="checkbox" checked={prefs.showPlanned} onChange={(e) => setShowPlanned(e.target.checked)} className="accent-[#1F6B45]" />
          Show features coming soon
        </label>
      </div>
    </>
  );
}
