import type { Metadata } from "next";
import { Bell, ListChecks, Package, Stethoscope, ClipboardCheck } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";

export const metadata: Metadata = { title: "Notifications" };

// Honest placeholder: the notification centre is the next piece of work (1F).
// Nothing here is a made-up alert and the bell shows no fake unread count.
const WILL_COVER = [
  { icon: ListChecks, text: "Tasks assigned to you, due soon or overdue" },
  { icon: ClipboardCheck, text: "Reports and harvests waiting for your approval" },
  { icon: Stethoscope, text: "Animals needing attention and vaccinations due" },
  { icon: Package, text: "Stock running low or about to expire" },
];

export default function NotificationsPage() {
  return (
    <>
      <DashboardTopbar title="Notifications" />
      <div className="p-6 lg:p-8">
        <div className="max-w-[560px] bg-white border border-border rounded-md p-8">
          <span className="w-12 h-12 rounded-full bg-mist flex items-center justify-center mb-4"><Bell size={22} className="stroke-green" /></span>
          <span className="text-[11px] font-extrabold uppercase tracking-wide bg-[#FDF3E3] text-[#8A5A00] px-2 py-1 rounded">Coming soon</span>
          <h2 className="text-lg font-extrabold mt-3 mb-1.5">Your notification centre</h2>
          <p className="text-sm text-ink-soft mb-5">When it&apos;s ready, important things will appear here and link straight to the record. For example:</p>
          <ul className="space-y-3">
            {WILL_COVER.map((w) => (
              <li key={w.text} className="flex items-center gap-3 text-sm"><w.icon size={16} className="stroke-green flex-shrink-0" /> {w.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
