import type { Metadata } from "next";
import { ClipboardList, BadgeCheck, LayoutDashboard, Wallet } from "lucide-react";

export const metadata: Metadata = { title: "Sell on Klantis" };

const STEPS = [
  { icon: ClipboardList, title: "Apply", text: "Tell us about you and your farm: location, what you produce, and supporting documents." },
  { icon: BadgeCheck, title: "Get verified", text: "We review your application. Only verified farms can list products, which keeps buyers' trust." },
  { icon: LayoutDashboard, title: "Open your farm dashboard", text: "Once approved you get your own farm workspace, separate from your customer account, to manage production, stock and orders." },
  { icon: Wallet, title: "Sell and get paid", text: "List products, fulfil orders and receive payouts." },
];

export default function SellPage() {
  return (
    <section className="bg-white border border-border rounded-md p-6">
      <span className="text-[11px] font-extrabold uppercase tracking-wide bg-[#FDF3E3] text-[#8A5A00] px-2 py-1 rounded">Coming soon</span>
      <h2 className="text-lg font-extrabold mt-3 mb-1">Sell on Klantis Farms</h2>
      <p className="text-sm text-ink-soft mb-6 max-w-[560px]">
        Soon you&apos;ll be able to register your own farm from this account, with no new login. Your orders and details stay where they are,
        and a farm dashboard is added once you&apos;re approved. This is how it will work:
      </p>
      <ol className="space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="w-10 h-10 rounded-full bg-mist flex items-center justify-center flex-shrink-0"><s.icon size={18} className="stroke-green" /></span>
            <div><h3 className="text-sm font-extrabold">{i + 1}. {s.title}</h3><p className="text-sm text-ink-soft">{s.text}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}
