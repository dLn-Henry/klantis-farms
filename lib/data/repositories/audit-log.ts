import { auditLog, type AuditEntry } from "@/lib/data/mock/audit-log";

export async function getAuditLog(): Promise<AuditEntry[]> {
  return auditLog;
}
