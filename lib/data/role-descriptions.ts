import type { Role } from "@/lib/data/mock/users";

// What each role is *actually* enforced to do today -- not an aspirational
// list. The old copy promised things like "View & adjust inventory" for
// specific roles, but outside the guarded actions below every farm member
// can do the same things, so those lines described restrictions that don't
// exist. If a new database rule is added (see BUILD_LOG.md), update this.
//
// Enforced in the database:
//   - Farm Owner: add / re-role / suspend team members (only role that can)
//   - Farm Owner + Farm Manager: approve veterinary reports, read audit log
//   - Farm Owner + Farm Manager + Inventory Officer: approve harvests
//   - Nobody can approve something they submitted themselves
const EVERYONE = "Record and view farm data: animals, crops, harvests, tasks, inventory, suppliers, equipment, finance";

export const ROLE_DESCRIPTIONS: Record<Role, string[]> = {
  "Farm Owner": [EVERYONE, "Add, change and suspend team members", "Approve veterinary reports and harvests", "View the audit log"],
  "Farm Manager": [EVERYONE, "Approve veterinary reports and harvests", "View the audit log", "See team members' email addresses"],
  "Inventory Officer": [EVERYONE, "Approve harvests"],
  "Veterinarian": [EVERYONE, "Submit veterinary reports -- no one, themselves included, can approve a report they submitted"],
  "Sales Manager": [EVERYONE],
  "Farm Worker": [EVERYONE],
};

export const ASSIGNABLE_ROLES: Role[] = [
  "Farm Owner", "Farm Manager", "Inventory Officer", "Veterinarian", "Sales Manager", "Farm Worker",
];
