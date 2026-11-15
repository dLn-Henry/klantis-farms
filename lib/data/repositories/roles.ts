import { createClient } from "@/lib/supabase/server";

export type RoleInfo = { name: string; description: string; permissions: string[] };

// Display order (most to least privileged); anything new sorts after these.
const ORDER = [
  "Farm Owner", "Farm Manager", "Accountant", "Inventory Officer", "Procurement Officer",
  "Sales Manager", "Agronomist", "Veterinarian", "Equipment Officer", "Farm Worker", "Auditor",
];

// Roles and what each grants, straight from the tables the database enforces.
export async function getRoleCatalog(): Promise<RoleInfo[]> {
  const supabase = createClient();
  const [{ data: roles }, { data: grants }] = await Promise.all([
    supabase.from("roles").select("id, name, description"),
    supabase.from("role_permissions").select("role_id, permission_key"),
  ]);
  const byRole = new Map<string, string[]>();
  (grants ?? []).forEach((g) => byRole.set(g.role_id, [...(byRole.get(g.role_id) ?? []), g.permission_key]));

  const rank = (n: string) => { const i = ORDER.indexOf(n); return i === -1 ? ORDER.length : i; };
  return (roles ?? [])
    .map((r) => ({ name: r.name, description: r.description ?? "", permissions: (byRole.get(r.id) ?? []).sort() }))
    .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
}
