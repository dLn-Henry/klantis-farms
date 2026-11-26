"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, Loader2 } from "lucide-react";
import { useShell } from "@/components/layout/DashboardShell";
import { ALL_ITEMS, QUICK_ACTIONS, canSee, type NavItem } from "@/lib/navigation";
import { searchRecords, type SearchHit } from "@/lib/actions/search";
import type { LucideIcon } from "lucide-react";

type Entry = { id: string; group: string; title: string; subtitle?: string; href: string; icon?: LucideIcon };

// Ctrl/Cmd+K: jump to a page, start something new, or find a record. Pages and
// actions are filtered by the person's permissions; records come back through
// row-level security, so people only ever find what they may open.
export function CommandPalette() {
  const router = useRouter();
  const { paletteOpen, setPaletteOpen, permissions, prefs, recents } = useShell();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const d = dialog.current; if (!d) return;
    if (paletteOpen && !d.open) { d.showModal(); setQuery(""); setHits([]); setActive(0); setTimeout(() => input.current?.focus(), 0); }
    if (!paletteOpen && d.open) d.close();
  }, [paletteOpen]);

  // Debounced record search.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setHits([]); setLoading(false); return; }
    setLoading(true);
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const r = await searchRecords(q);
        if (id === reqId.current) setHits(r);
      } catch { if (id === reqId.current) setHits([]); }
      finally { if (id === reqId.current) setLoading(false); }
    }, 220);
    return () => clearTimeout(t);
  }, [query]);

  const entries = useMemo<Entry[]>(() => {
    const q = query.trim().toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);
    const match = (text: string) => tokens.every((t) => text.toLowerCase().includes(t));

    const pages = (ALL_ITEMS.filter((i) => i.status === "live" && canSee(i, permissions)) as NavItem[]);
    const actions = QUICK_ACTIONS.filter((a) => permissions.has(a.perm));

    if (!q) {
      const byHref = new Map(pages.map((p) => [p.href, p]));
      const quick = [...prefs.favourites, ...recents].filter((h, i, a) => a.indexOf(h) === i).map((h) => byHref.get(h)).filter((p): p is NavItem => !!p);
      return [
        ...actions.map((a) => ({ id: `a:${a.href}`, group: "Create", title: a.label, href: a.href, icon: a.icon })),
        ...quick.map((p) => ({ id: `q:${p.href}`, group: "Favourites & recent", title: p.label, href: p.href, icon: p.icon })),
        ...pages.slice(0, 8).map((p) => ({ id: `p:${p.href}`, group: "Go to", title: p.label, href: p.href, icon: p.icon })),
      ];
    }
    return [
      ...pages.filter((p) => match(`${p.label} ${p.keywords ?? ""}`)).map((p) => ({ id: `p:${p.href}`, group: "Go to", title: p.label, href: p.href, icon: p.icon })),
      ...actions.filter((a) => match(a.label)).map((a) => ({ id: `a:${a.href}`, group: "Create", title: a.label, href: a.href, icon: a.icon })),
      ...hits.map((h, i) => ({ id: `r:${i}:${h.href}`, group: h.group, title: h.title, subtitle: h.subtitle, href: h.href })),
    ];
  }, [query, hits, permissions, prefs.favourites, recents]);

  useEffect(() => { setActive(0); }, [entries.length, query]);
  useEffect(() => { document.getElementById(`cmd-opt-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active]);

  function go(e: Entry) { setPaletteOpen(false); router.push(e.href); }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, entries.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && entries[active]) { e.preventDefault(); go(entries[active]); }
  }

  let lastGroup = "";
  return (
    <dialog
      ref={dialog}
      onClose={() => setPaletteOpen(false)}
      onClick={(e) => { if (e.target === dialog.current) setPaletteOpen(false); }}
      aria-label="Search and commands"
      className="rounded-xl p-0 w-[min(640px,94vw)] mt-[10vh] backdrop:bg-black/50 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 border-b border-border">
        <Search size={17} className="stroke-ink-soft flex-shrink-0" />
        <input
          ref={input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={entries[active] ? `cmd-opt-${active}` : undefined}
          placeholder="Search pages, animals, orders, tasks…"
          className="flex-1 py-4 text-[15px] outline-none bg-transparent"
          autoComplete="off"
        />
        {loading && <Loader2 size={15} className="animate-spin text-ink-soft" />}
        <kbd className="hidden sm:block text-[10px] font-bold bg-surface rounded px-1.5 py-0.5 text-ink-soft">Esc</kbd>
      </div>

      <ul id="cmd-list" role="listbox" className="max-h-[52vh] overflow-y-auto py-2">
        {entries.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-ink-soft">
            {query.trim().length < 2 ? "Type to search." : loading ? "Searching…" : `Nothing found for “${query.trim()}”.`}
          </li>
        )}
        {entries.map((e, i) => {
          const header = e.group !== lastGroup ? e.group : null;
          lastGroup = e.group;
          return (
            <li key={e.id} role="presentation">
              {header && <div className="px-5 pt-3 pb-1 text-[10.5px] font-bold uppercase tracking-wider text-ink-soft">{header}</div>}
              <div
                id={`cmd-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(e)}
                className={`mx-2 flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer ${i === active ? "bg-mist" : ""}`}
              >
                {e.icon ? <e.icon size={16} className="stroke-green flex-shrink-0" /> : <span className="w-4" />}
                <span className="min-w-0 flex-1">
                  <span className="text-sm font-semibold block truncate">{e.title}</span>
                  {e.subtitle && <span className="text-xs text-ink-soft block truncate">{e.subtitle}</span>}
                </span>
                {i === active && <CornerDownLeft size={14} className="stroke-ink-soft flex-shrink-0" />}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="px-5 py-2.5 border-t border-border bg-surface text-[11px] text-ink-soft flex gap-4">
        <span><b>↑↓</b> to move</span><span><b>Enter</b> to open</span><span className="hidden sm:inline">Results only include what your roles can see.</span>
      </div>
    </dialog>
  );
}
