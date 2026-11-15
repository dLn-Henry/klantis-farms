import { getAccess, canAny } from "@/lib/auth/access";
import { NoAccess } from "@/components/dashboard/NoAccess";

// Wrap a module's layout: renders the section only if the person holds at
// least one of the permissions, otherwise a clear "no access" screen.
export async function ModuleGate({
  perm,
  section,
  children,
}: {
  perm: string | readonly string[];
  section: string;
  children: React.ReactNode;
}) {
  const access = await getAccess();
  const needed = typeof perm === "string" ? [perm] : perm;
  if (!canAny(access, needed)) return <NoAccess section={section} roles={access.roles} />;
  return <>{children}</>;
}
