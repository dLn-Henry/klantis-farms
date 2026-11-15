import { ModuleGate } from "@/components/dashboard/ModuleGate";

// Part of the permission model (migration 0018). This only decides what is
// SHOWN; the database enforces the same permission on every read and write.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ModuleGate perm={"livestock.view"} section="Livestock">{children}</ModuleGate>;
}
