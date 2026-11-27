import {
  LayoutDashboard, Beef, Sprout, MapPin, Wheat, Stethoscope, Package, Wrench, Truck,
  ShoppingBag, Tag, Users, Wallet, FileBarChart, BarChart3, Newspaper, UserCog, Settings,
  ScrollText, ListChecks, ImageIcon, Bell, CheckCheck, ShieldAlert, ClipboardList, Calendar,
  BookOpen, Clock, TrendingUp, QrCode, BadgeCheck, FileText, Plus, UserPlus,
  type LucideIcon,
} from "lucide-react";
import { REPORT_PERMISSIONS } from "@/lib/auth/access-keys";

// ONE definition of the dashboard's navigation, used by the sidebar, the mobile
// menu, the Ctrl+K palette and quick-create. `perm` hides an item from people
// whose roles don't include it (display only -- the database still enforces
// every permission). `status: "planned"` items are shown muted with a SOON tag
// so it's always clear what exists today and what is coming.

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  status: "live" | "planned";
  perm?: string | readonly string[];
  /** Extra words the palette matches on. */
  keywords?: string;
};
export type NavGroup = { title: string; items: NavItem[] };

const L = (label: string, href: string, icon: LucideIcon, perm?: NavItem["perm"], keywords?: string): NavItem =>
  ({ label, href, icon, status: "live", perm, keywords });
const P = (label: string, href: string, icon: LucideIcon, perm?: NavItem["perm"], keywords?: string): NavItem =>
  ({ label, href, icon, status: "planned", perm, keywords });

export const NAV_GROUPS: NavGroup[] = [
  { title: "Overview", items: [
    L("Dashboard", "/dashboard", LayoutDashboard, undefined, "home overview"),
    L("Notifications", "/dashboard/notifications", Bell, undefined, "alerts inbox"),
    P("Approvals", "/dashboard/approvals", CheckCheck, ["veterinary.review", "harvests.approve"], "review approve queue"),
  ] },
  { title: "Farm Operations", items: [
    L("Livestock", "/dashboard/livestock", Beef, "livestock.view", "animals cattle goats sheep poultry herd"),
    L("Crops", "/dashboard/crops", Sprout, "crops.view", "planting cycles maize tomato"),
    L("Fields", "/dashboard/fields", MapPin, "fields.view", "land plots soil"),
    L("Harvests", "/dashboard/harvests", Wheat, "harvests.view", "yield produce"),
    L("Veterinary", "/dashboard/veterinary", Stethoscope, ["veterinary.view", "veterinary.create"], "vet health treatment vaccination reports"),
    P("Biosecurity", "/dashboard/biosecurity", ShieldAlert, ["veterinary.view", "livestock.view"], "disease quarantine outbreak"),
  ] },
  { title: "Resources & Procurement", items: [
    L("Inventory", "/dashboard/inventory", Package, "inventory.view", "stock feed seed fertilizer supplies"),
    L("Equipment", "/dashboard/equipment", Wrench, "equipment.view", "machinery tractor maintenance assets"),
    L("Suppliers", "/dashboard/suppliers", Truck, "suppliers.view", "vendors purchases"),
    P("Procurement", "/dashboard/procurement", ClipboardList, ["suppliers.view"], "requisition purchase orders goods received"),
  ] },
  { title: "Workforce & Planning", items: [
    L("Tasks", "/dashboard/tasks", ListChecks, ["tasks.view", "tasks.view_own"], "todo assignments jobs"),
    P("Calendar", "/dashboard/calendar", Calendar, ["tasks.view", "tasks.view_own"], "schedule events"),
    P("Farm Diary", "/dashboard/diary", BookOpen, ["tasks.view", "livestock.view", "crops.view"], "log journal observations"),
    P("Attendance & Timesheets", "/dashboard/attendance", Clock, ["team.view"], "clock in workforce hours leave"),
    P("Planning & Forecasting", "/dashboard/planning", TrendingUp, ["dashboard.overview"], "forecast budget season"),
  ] },
  { title: "Sales & Commerce", items: [
    L("Orders", "/dashboard/orders", ShoppingBag, "orders.view", "sales deliveries pickup"),
    L("Products", "/dashboard/products", Tag, "products.view", "shop catalogue prices"),
    L("Customers", "/dashboard/customers", Users, "customers.view", "buyers clients"),
  ] },
  { title: "Finance", items: [
    L("Finance", "/dashboard/finance", Wallet, "finance.view", "income expenses money revenue profit"),
  ] },
  { title: "Insights & Traceability", items: [
    L("Reports", "/dashboard/reports", FileBarChart, REPORT_PERMISSIONS, "export pdf"),
    L("Analytics", "/dashboard/analytics", BarChart3, REPORT_PERMISSIONS, "charts trends performance"),
    P("Traceability", "/dashboard/traceability", QrCode, ["harvests.view", "inventory.view"], "batches qr origin"),
    P("Quality & Compliance", "/dashboard/compliance", BadgeCheck, ["dashboard.overview"], "inspections food safety certificates"),
  ] },
  { title: "Website & Content", items: [
    L("Blog", "/dashboard/blog", Newspaper, "content.view", "journal articles posts"),
    L("Media", "/dashboard/media", ImageIcon, "media.view", "images photos library logo"),
  ] },
  { title: "Administration", items: [
    L("Users", "/dashboard/users", UserCog, "team.view", "team roles permissions staff"),
    L("Audit Log", "/dashboard/audit-log", ScrollText, "audit.view", "history changes activity"),
    L("Settings", "/dashboard/settings", Settings, "settings.view", "site identity favicon logo contact seo"),
    P("Documents", "/dashboard/documents", FileText, ["dashboard.overview"], "files certificates contracts"),
  ] },
];

export const GROUP_TITLES = NAV_GROUPS.map((g) => g.title);
export const ALL_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
export const LIVE_HREFS = new Set(ALL_ITEMS.filter((i) => i.status === "live").map((i) => i.href));

export function canSee(item: { perm?: string | readonly string[] }, perms: ReadonlySet<string>): boolean {
  if (!item.perm) return true;
  return (typeof item.perm === "string" ? [item.perm] : item.perm).some((k) => perms.has(k));
}

export function visibleGroups(perms: ReadonlySet<string>, showPlanned: boolean): NavGroup[] {
  return NAV_GROUPS
    .map((g) => ({ ...g, items: g.items.filter((i) => canSee(i, perms) && (showPlanned || i.status === "live")) }))
    .filter((g) => g.items.length > 0);
}

/** The live nav item a pathname belongs to (longest matching href). */
export function itemForPath(pathname: string): NavItem | undefined {
  return ALL_ITEMS
    .filter((i) => i.status === "live" && (pathname === i.href || (i.href !== "/dashboard" && pathname.startsWith(i.href + "/"))))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

// "+" menu and palette "Create" commands. Only pages that exist today.
export type QuickAction = { label: string; href: string; icon: LucideIcon; perm: string };
export const QUICK_ACTIONS: QuickAction[] = [
  { label: "Add animal", href: "/dashboard/livestock/new", icon: Beef, perm: "livestock.create" },
  { label: "Record harvest", href: "/dashboard/harvests/new", icon: Wheat, perm: "harvests.create" },
  { label: "Add crop cycle", href: "/dashboard/crops/new", icon: Sprout, perm: "crops.create" },
  { label: "Add task", href: "/dashboard/tasks/new", icon: ListChecks, perm: "tasks.create" },
  { label: "Submit vet report", href: "/dashboard/veterinary/new", icon: Stethoscope, perm: "veterinary.create" },
  { label: "Add supplier", href: "/dashboard/suppliers/new", icon: Truck, perm: "suppliers.create" },
  { label: "Add equipment", href: "/dashboard/equipment/new", icon: Wrench, perm: "equipment.create" },
  { label: "New blog post", href: "/dashboard/blog/new", icon: Newspaper, perm: "content.create" },
  { label: "Add team member", href: "/dashboard/users/new", icon: UserPlus, perm: "team.assign_roles" },
];
export const QUICK_ICON = Plus;
