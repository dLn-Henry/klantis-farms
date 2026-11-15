// Types for the Users screens. (The old hard-coded sample team lived here;
// the screens now read the real team from the database.)
export type UserStatus = "Active" | "Invited" | "Suspended";
// Role names come from the `roles` table, so they are plain strings.
export type Role = string;

export type TeamMember = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  roles: Role[];
  status: UserStatus;
  joinedDate: string;
};
