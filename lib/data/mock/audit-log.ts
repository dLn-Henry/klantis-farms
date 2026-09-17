export type AuditEntry = {
  id: string;
  user: string;
  action: string;
  entityType: string;
  entityLabel: string;
  timestamp: string;
};

export const auditLog: AuditEntry[] = [
  { id: "aud-001", user: "Farm Manager", action: "Approved", entityType: "Veterinary Report", entityLabel: "VT-0041", timestamp: "2026-08-11 09:42" },
  { id: "aud-002", user: "Farm Manager", action: "Approved", entityType: "Veterinary Report", entityLabel: "VT-0040", timestamp: "2026-08-10 14:15" },
  { id: "aud-003", user: "Farm Manager", action: "Rejected", entityType: "Veterinary Report", entityLabel: "VT-0039", timestamp: "2026-07-31 11:03" },
  { id: "aud-004", user: "Kofi Mensah", action: "Adjusted", entityType: "Inventory", entityLabel: "Cattle Feed — -45 kg", timestamp: "2026-08-19 07:30" },
  { id: "aud-005", user: "Farm Manager", action: "Recorded", entityType: "Harvest", entityLabel: "HAR-2026-031", timestamp: "2026-08-20 10:12" },
  { id: "aud-006", user: "Ama Serwaa", action: "Updated", entityType: "Order", entityLabel: "KF-1058 → Processing", timestamp: "2026-08-19 16:20" },
  { id: "aud-007", user: "Farm Manager", action: "Created", entityType: "Task", entityLabel: "Irrigate Field B", timestamp: "2026-08-18 08:05" },
  { id: "aud-008", user: "Farm Manager", action: "Invited", entityType: "User", entityLabel: "Yaw Owusu", timestamp: "2026-08-15 13:47" },
];
