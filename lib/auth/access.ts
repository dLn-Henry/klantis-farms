import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";

export type Access = {
  farmId: string | null;
  roles: string[];
  permissions: string[];
  /** Set when the permission lookup itself failed (e.g. migration 0018 not applied yet). */
  error?: string;
};

const NONE: Access = { farmId: null, roles: [], permissions: [] };

// The signed-in user's roles and combined permissions on their farm, fetched
// once per request (React cache). This is for deciding what to SHOW. It is
// never the security boundary: every table policy and guard trigger asks the
// database again (has_permission()), so forcing a request past a hidden
// button still gets refused.
export const getAccess = cache(async (): Promise<Access> => {
  const farmId = await getCurrentFarmId();
  if (!farmId) return NONE;

  const supabase = createClient();
  const { data, error } = await supabase.rpc("my_access", { p_farm_id: farmId });
  if (error || !data) return { ...NONE, farmId, error: error?.message ?? "No permission data returned." };
  return { farmId, roles: data.roles ?? [], permissions: data.permissions ?? [] };
});

export function can(access: Pick<Access, "permissions">, perm: string): boolean {
  return access.permissions.includes(perm);
}

/** True if the user holds at least one of the listed permissions. */
export function canAny(access: Pick<Access, "permissions">, perms: readonly string[]): boolean {
  return perms.some((p) => access.permissions.includes(p));
}

export { REPORT_PERMISSIONS } from "@/lib/auth/access-keys";
