import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getAccess } from "@/lib/auth/access";
import { getSiteContent } from "@/lib/site-settings";
import { getMyPreferences } from "@/lib/data/repositories/preferences";

// Everything under /dashboard is private, per-user, farm-scoped data.
// Force dynamic rendering so each request is authenticated and RLS-scoped
// on its own terms — never pre-rendered/cached as a shared static snapshot.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [access, site, prefs] = await Promise.all([getAccess(), getSiteContent(), getMyPreferences()]);
  // Not a farm member (e.g. a customer): the farm workspace isn't theirs.
  if (!access.farmId) redirect("/account");

  return (
    <DashboardShell
      permissions={access.permissions}
      roles={access.roles}
      site={{ name: site.name, logoUrl: site.logoUrl }}
      initialPrefs={prefs}
      banner={access.error ? (
        <div role="alert" className="bg-[#FDEDED] border-b border-[#F3C6C6] px-6 py-3 text-xs font-semibold text-[#C62828]">
          The app couldn&apos;t load your permissions, so most sections are hidden. This usually means the
          latest database migrations haven&apos;t been run yet — see SUPABASE_SETUP.md, then run
          supabase/verify_schema.sql. ({access.error})
        </div>
      ) : undefined}
    >
      {children}
    </DashboardShell>
  );
}
