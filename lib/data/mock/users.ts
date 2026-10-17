export type UserStatus = "Active" | "Invited" | "Suspended";
export type Role = "Farm Owner" | "Farm Manager" | "Veterinarian" | "Inventory Officer" | "Sales Manager" | "Farm Worker";

export type TeamMember = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  joinedDate: string;
};

export const teamMembers: TeamMember[] = [
  { id: "user-001", name: "Farm Manager", email: "manager@klantisfarms.com", role: "Farm Owner", status: "Active", joinedDate: "2024-01-10" },
  { id: "user-002", name: "Dr. Adjei", email: "adjei@klantisfarms.com", role: "Veterinarian", status: "Active", joinedDate: "2025-03-22" },
  { id: "user-003", name: "Kofi Mensah", email: "kofi@klantisfarms.com", role: "Inventory Officer", status: "Active", joinedDate: "2025-06-14" },
  { id: "user-004", name: "Ama Serwaa", email: "ama@klantisfarms.com", role: "Sales Manager", status: "Active", joinedDate: "2026-02-01" },
  { id: "user-005", name: "Yaw Owusu", email: "yaw@klantisfarms.com", role: "Farm Worker", status: "Invited", joinedDate: "2026-08-15" },
];

// Role descriptions live in lib/data/role-descriptions.ts and describe what is
// actually enforced. The old list here promised restrictions that don't exist.
