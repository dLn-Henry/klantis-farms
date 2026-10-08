import { createClient } from "@/lib/supabase/server";
import type { AuditEntry } from "@/lib/data/mock/audit-log";

export async function getAuditLog(): Promise<AuditEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("id, user_id, action, entity_type, entity_label, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  const userIds = Array.from(new Set((data ?? []).map((r) => r.user_id).filter((x): x is string => !!x)));
  const nameMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
    (profiles ?? []).forEach((p) => nameMap.set(p.id, p.display_name ?? "—"));
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    user: (r.user_id && nameMap.get(r.user_id)) || "System",
    action: r.action,
    entityType: r.entity_type,
    entityLabel: r.entity_label,
    timestamp: new Date(r.created_at).toLocaleString(),
  }));
}
