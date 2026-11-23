import { ModuleGate } from "@/components/dashboard/ModuleGate";

// tasks.view = every task; tasks.view_own = only the ones assigned to you.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ModuleGate perm={["tasks.view", "tasks.view_own"]} section="Tasks">{children}</ModuleGate>;
}
