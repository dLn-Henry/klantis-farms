"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, UserRound, ShieldCheck, Store } from "lucide-react";

const ITEMS = [
  { label: "Overview", href: "/account", icon: LayoutGrid },
  { label: "My orders", href: "/account/orders", icon: Package },
  { label: "Profile", href: "/account/profile", icon: UserRound },
  { label: "Password & security", href: "/account/security", icon: ShieldCheck },
  { label: "Sell on Klantis", href: "/account/sell", icon: Store },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="bg-white border border-border rounded-md p-2 lg:sticky lg:top-[110px]">
      <ul className="flex lg:flex-col gap-1 overflow-x-auto">
        {ITEMS.map((i) => {
          const active = i.href === "/account" ? pathname === "/account" : pathname.startsWith(i.href);
          return (
            <li key={i.href} className="flex-shrink-0">
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-sm font-semibold whitespace-nowrap ${
                  active ? "bg-mist text-green" : "text-ink-soft hover:bg-surface hover:text-ink"
                }`}
              >
                <i.icon size={16} /> {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
