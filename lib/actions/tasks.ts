"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import type { TaskPriority, TaskStatus } from "@/lib/data/repositories/tasks";

export type ActionResult = { success: true } | { success: false; error: string };

export async function createTask(formData: FormData): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = String(formData.get("priority") ?? "Medium") as TaskPriority;
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const assignedTo = String(formData.get("assignedTo") ?? "").trim();

  if (!title) {
    return { success: false, error: "A task needs a title." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You need to be signed in to create a task." };
  }

  const farmId = await getCurrentFarmId();
  if (!farmId) {
    return { success: false, error: "You're not a member of a farm yet." };
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      farm_id: farmId,
      title,
      description: description || null,
      priority,
      due_date: dueDate || null,
      assigned_to: assignedTo || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Could not create the task." };
  }

  revalidatePath("/dashboard/tasks");
  redirect(`/dashboard/tasks/${data.id}`);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You need to be signed in to update a task." };
  }

  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/tasks/${taskId}`);
  revalidatePath("/dashboard/tasks");

  return { success: true };
}
