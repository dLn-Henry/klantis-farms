import type { Metadata } from "next";
import Link from "next/link";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import {
  Beef, Sprout, Package, ShoppingBag, AlertTriangle,
  Stethoscope, Wheat,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

const KPIS = [
  { label: "Total Animals", value: "1,248", icon: Beef, href: "/dashboard/livestock" },
  { label: "Active Crop Cycles", value: "4", icon: Sprout, href: "/dashboard/crops" },
  { label: "Inventory Items", value: "86", icon: Package, href: "/dashboard/inventory" },
  { label: "Today's Orders", value: "12", icon: ShoppingBag, href: "/dashboard/orders" },
];

const ATTENTION = [
  { text: "2 veterinary reports awaiting review", icon: Stethoscope, href: "/dashboard/veterinary" },
  { text: "Feed stock in Warehouse A is running low", icon: AlertTriangle, href: "/dashboard/inventory/inv-cattle-feed" },
  { text: "3 overdue tasks in Field B", icon: AlertTriangle, href: "/dashboard/fields/field-b" },
];

const ACTIVITY = [
  { time: "08:45", text: "Poultry house 2 inspected" },
  { time: "08:30", text: "150 trays added to egg inventory" },
  { time: "08:15", text: "Veterinary report submitted" },
  { time: "07:55", text: "Tomato field irrigation completed" },
];

export default function DashboardOverviewPage() {
  return (
    <>
      <DashboardTopbar title="Dashboard" />

      <div className="p-6 lg:p-8 max-w-[1100px]">
        <h2 className="text-xl font-extrabold tracking-tight">Good morning, Farm Manager.</h2>
        <p className="text-sm text-ink-soft mt-1 mb-7">Here&apos;s what&apos;s happening across Klantis Farms today.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {KPIS.map((kpi) => {
            const card = (
              <>
                <span className="w-9 h-9 rounded-lg bg-mist flex items-center justify-center mb-3">
                  <kpi.icon size={18} className="stroke-green" />
                </span>
                <b className="block text-2xl font-extrabold">{kpi.value}</b>
                <span className="text-xs text-ink-soft font-semibold">{kpi.label}</span>
              </>
            );
            const className = "bg-white border border-border rounded-md p-5";
            return kpi.href ? (
              <Link key={kpi.label} href={kpi.href} className={`${className} block hover:border-green transition-colors`}>
                {card}
              </Link>
            ) : (
              <div key={kpi.label} className={className}>{card}</div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-border rounded-md p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Needs Your Attention</h3>
            <div className="space-y-3">
              {ATTENTION.map((item, i) => {
                const content = (
                  <>
                    <item.icon size={16} className="stroke-gold flex-shrink-0" />
                    <span className="text-[13px] font-semibold">{item.text}</span>
                  </>
                );
                const className = "flex items-center gap-3 bg-[#FDF3E3] border border-[#F0DBAF] rounded-md px-3.5 py-3";
                return item.href ? (
                  <Link key={i} href={item.href} className={`${className} hover:border-gold transition-colors`}>
                    {content}
                  </Link>
                ) : (
                  <div key={i} className={className}>{content}</div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-border rounded-md p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex gap-3.5">
                  <span className="text-xs font-bold text-green w-11 flex-shrink-0">{a.time}</span>
                  <span className="text-[13px] text-ink border-l border-border pl-3.5">{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-mist border border-border rounded-md p-5 mt-6 flex items-center gap-4">
          <span className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center flex-shrink-0">
            <Wheat size={18} className="stroke-green" />
          </span>
          <div>
            <b className="text-sm">Every module in the sidebar is now live.</b>
            <p className="text-xs text-ink-soft mt-0.5">
              Farm Records, Inventory, Commerce, Business Ops, Reports &amp; Analytics, Blog, Users
              &amp; Roles, the Audit Log and Settings all work end-to-end on real (mock) data.
              Settings even edits the same content object the public site reads from. What's left
              is what your roadmap marks as later-stage: Multi-Farm, Advanced Ag Tech, and AI —
              plus the real backend behind all of this.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
