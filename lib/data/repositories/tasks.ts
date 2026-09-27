import { createClient } from "@/lib/supabase/server";

export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Cancelled";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  assignedTo: string;
  assignedToId: string | null;
  createdBy: string;
  completedAt: string | null;
  isOverdue: boolean;
};

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  created_by: string | null;
  completed_at: string | null;
};

async function getProfileNameMap(userIds: (string | null)[]): Promise<Map<string, string>> {
  const ids = Array.from(new Set(userIds.filter((x): x is string => !!x)));
  if (ids.length === 0) return new Map();
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("id, display_name").in("id", ids);
  return new Map((data ?? []).map((p) => [p.id, p.display_name ?? "—"]));
}

function mapTaskRow(row: TaskRow, nameMap: Map<string, string>): Task {
  const isOverdue =
    !!row.due_date &&
    row.status !== "Completed" &&
    row.status !== "Cancelled" &&
    new Date(row.due_date) < new Date(new Date().toDateString());

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    priority: row.priority as TaskPriority,
    status: row.status as TaskStatus,
    dueDate: row.due_date,
    assignedTo: (row.assigned_to && nameMap.get(row.assigned_to)) || "Unassigned",
    assignedToId: row.assigned_to,
    createdBy: (row.created_by && nameMap.get(row.created_by)) || "—",
    completedAt: row.completed_at,
    isOverdue,
  };
}

const TASK_COLUMNS = "id, title, description, priority, status, due_date, assigned_to, created_by, completed_at";

export async function getAllTasks(): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  const rows = data ?? [];
  const nameMap = await getProfileNameMap(rows.flatMap((r) => [r.assigned_to, r.created_by]));
  return rows.map((row) => mapTaskRow(row, nameMap));
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase.from("tasks").select(TASK_COLUMNS).eq("id", id).single();

  if (error || !data) return undefined;
  const nameMap = await getProfileNameMap([data.assigned_to, data.created_by]);
  return mapTaskRow(data, nameMap);
}

// Farm members available to assign a task to. Used by the "New Task" form.
export async function getAssignableFarmMembers(): Promise<{ id: string; name: string }[]> {
  const supabase = createClient();
  const { data: memberships } = await supabase.from("farm_members").select("user_id").eq("status", "active");
  const userIds = Array.from(new Set((memberships ?? []).map((m) => m.user_id)));
  if (userIds.length === 0) return [];
  const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
  return (profiles ?? []).map((p) => ({ id: p.id, name: p.display_name ?? "—" }));
}
