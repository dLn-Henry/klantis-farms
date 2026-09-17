"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Beef, Sprout, MapPin, Wheat, Stethoscope,
  Package, Wrench, Truck, ShoppingBag, Tag, Users, Wallet,
  FileBarChart, BarChart3, Newspaper, UserCog, Settings, ScrollText,
} from "lucide-react";
import { SITE_CONTENT } from "@/lib/site-config";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  live?: boolean;
};

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, live: true }],
  },
  {
    title: "Farm Operations",
    items: [
      { label: "Livestock", href: "/dashboard/livestock", icon: Beef, live: true },
      { label: "Crops", href: "/dashboard/crops", icon: Sprout, live: true },
      { label: "Fields", href: "/dashboard/fields", icon: MapPin, live: true },
      { label: "Harvests", href: "/dashboard/harvests", icon: Wheat, live: true },
      { label: "Veterinary", href: "/dashboard/veterinary", icon: Stethoscope, live: true },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Inventory", href: "/dashboard/inventory", icon: Package, live: true },
      { label: "Equipment", href: "/dashboard/equipment", icon: Wrench, live: true },
      { label: "Suppliers", href: "/dashboard/suppliers", icon: Truck, live: true },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag, live: true },
      { label: "Products", href: "/dashboard/products", icon: Tag, live: true },
      { label: "Customers", href: "/dashboard/customers", icon: Users, live: true },
      { label: "Finance", href: "/dashboard/finance", icon: Wallet, live: true },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Reports", href: "/dashboard/reports", icon: FileBarChart, live: true },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, live: true },
    ],
  },
  {
    title: "Content",
    items: [{ label: "Blog", href: "/dashboard/blog", icon: Newspaper, live: true }],
  },
  {
    title: "System",
    items: [
      { label: "Users", href: "/dashboard/users", icon: UserCog, live: true },
      { label: "Audit Log", href: "/dashboard/audit-log", icon: ScrollText, live: true },
      { label: "Settings", href: "/dashboard/settings", icon: Settings, live: true },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-forest text-[#DCEBE0] min-h-screen hidden lg:flex flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-6 py-6 border-b border-white/10">
        <span className="w-9 h-9 rounded-[9px] bg-green flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" className="w-5 h-5">
            <path d="M12 3c-3 3-3 7 0 10 3-3 3-7 0-10Z" />
            <path d="M12 13v8" />
            <path d="M8 21h8" />
          </svg>
        </span>
        <span className="text-white font-extrabold text-[15px] leading-tight">{SITE_CONTENT.name}</span>
      </Link>

      <nav className="flex-1 overflow-y-auto py-5 px-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E9789] px-2 mb-2">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.live &&
                  (item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/"));
                if (!item.live) {
                  return (
                    <div
                      key={item.href}
                      className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-[13px] font-medium text-[#7E9789] cursor-not-allowed"
                    >
                      <span className="flex items-center gap-2.5">
                        <item.icon size={16} />
                        {item.label}
                      </span>
                      <span className="text-[9px] font-bold bg-white/10 px-1.5 py-0.5 rounded">SOON</span>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-semibold transition-colors ${
                      isActive ? "bg-green text-white" : "text-[#DCEBE0] hover:bg-white/5"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
