import { ModuleGate } from "@/components/dashboard/ModuleGate";
import { REPORT_PERMISSIONS } from "@/lib/auth/access-keys";

// Part of the permission model (migration 0018). This only decides what is
// SHOWN; the database enforces the same permission on every read and write.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ModuleGate perm={REPORT_PERMISSIONS} section="Analytics">{children}</ModuleGate>;
}
