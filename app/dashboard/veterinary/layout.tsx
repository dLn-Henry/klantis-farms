import { ModuleGate } from "@/components/dashboard/ModuleGate";

// A vet holds veterinary.create (own reports); managers hold veterinary.view.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ModuleGate perm={["veterinary.view", "veterinary.create"]} section="Veterinary">{children}</ModuleGate>;
}
