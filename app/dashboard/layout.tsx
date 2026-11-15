import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { getAccess } from "@/lib/auth/access";

// Everything under /dashboard is private, per-user, farm-scoped data.
// Force dynamic rendering so each request is authenticated and RLS-scoped
// on its own terms — never pre-rendered/cached as a shared static snapshot.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const access = await getAccess();
  return (
    <div className="flex min-h-screen bg-surface">
      <DashboardSidebar permissions={access.permissions} />
      <div className="flex-1 min-w-0">
        {access.error && (
          <div role="alert" className="bg-[#FDEDED] border-b border-[#F3C6C6] px-6 py-3 text-xs font-semibold text-[#C62828]">
            The app couldn&apos;t load your permissions, so most sections are hidden. This usually means the
            latest database migration (0018) hasn&apos;t been run yet — see SUPABASE_SETUP.md, then run
            supabase/verify_schema.sql. ({access.error})
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
