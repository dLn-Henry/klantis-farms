import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import type { TeamMember, Role, UserStatus } from "@/lib/data/mock/users";

const STATUS_LABEL: Record<string, UserStatus> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

// Goes through list_farm_team() rather than querying farm_members/profiles
// directly: profiles has no email column and only exposes *active*
// co-members, so suspended people would silently vanish from the list.
// The function also withholds emails from anyone who isn't an owner/manager.
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const farmId = await getCurrentFarmId();
  if (!farmId) return [];

  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_farm_team", { p_farm_id: farmId });
  if (error) throw error;

  return (data ?? []).map((m) => ({
    id: m.member_id,
    userId: m.user_id,
    name: m.display_name,
    email: m.email ?? "",
    role: m.role_name as Role,
    status: STATUS_LABEL[m.status] ?? "Active",
    joinedDate: m.joined_at.slice(0, 10),
  }));
}

export async function getTeamMemberById(id: string): Promise<TeamMember | undefined> {
  const members = await getAllTeamMembers();
  return members.find((m) => m.id === id);
}
