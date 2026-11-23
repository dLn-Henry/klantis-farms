import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountNav } from "@/components/account/AccountNav";
import { SignOutButton } from "@/components/account/SignOutButton";

// The CUSTOMER workspace: a storefront-style account area, completely separate
// from the farm dashboard. Everyone has one login; farm staff additionally get
// /dashboard. Never indexed by search engines.
export const metadata: Metadata = { title: { default: "My account", template: "%s · My account" }, robots: { index: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase.from("farm_members").select("id").eq("user_id", user.id).eq("status", "active").limit(1),
  ]);
  const name = profile?.display_name || user.email || "there";
  const isFarmMember = (membership ?? []).length > 0;

  return (
    <div className="bg-surface min-h-[70vh]">
      <div className="bg-white border-b border-border">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">My account</p>
            <h1 className="text-2xl font-extrabold tracking-tight">Hello, {name}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isFarmMember && <Link href="/dashboard" className="btn-outline">Go to farm dashboard</Link>}
            <SignOutButton />
          </div>
        </div>
      </div>
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8 grid lg:grid-cols-[240px_1fr] gap-7 items-start">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
