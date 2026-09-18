import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

// Everything under /dashboard is private, per-user, farm-scoped data.
// Force dynamic rendering so each request is authenticated and RLS-scoped
// on its own terms — never pre-rendered/cached as a shared static snapshot.
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
