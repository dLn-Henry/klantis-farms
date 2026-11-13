"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import { friendlyDbError } from "@/lib/actions/errors";

export type TeamActionResult = { success: true } | { success: false; error: string };

// Every rule (owner-only, no self-change, keep one active owner, audit
// trail) lives in the database functions from migration 0015. These
// actions only call them and relay the answer -- nothing here decides who
// is allowed to do what.

export async function addTeamMember(formData: FormData): Promise<{ success: false; error: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  if (!email) return { success: false, error: "Enter their email address." };
  if (!role) return { success: false, error: "Choose a role." };

  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const supabase = createClient();
  const { error } = await supabase.rpc("add_farm_member", { p_farm_id: farmId, p_email: email, p_role_name: role });
  if (error) return { success: false, error: friendlyDbError(error) };

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function changeMemberRole(memberId: string, role: string): Promise<TeamActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc("set_member_role", { p_member_id: memberId, p_role_name: role });
  if (error) return { success: false, error: friendlyDbError(error) };

  revalidatePath(`/dashboard/users/${memberId}`);
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function setMemberStatus(memberId: string, status: "active" | "suspended"): Promise<TeamActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc("set_member_status", { p_member_id: memberId, p_status: status });
  if (error) return { success: false, error: friendlyDbError(error) };

  revalidatePath(`/dashboard/users/${memberId}`);
  revalidatePath("/dashboard/users");
  return { success: true };
}
