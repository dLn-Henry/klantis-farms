import { teamMembers, type TeamMember } from "@/lib/data/mock/users";

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  return teamMembers;
}

export async function getTeamMemberById(id: string): Promise<TeamMember | undefined> {
  return teamMembers.find((u) => u.id === id);
}
