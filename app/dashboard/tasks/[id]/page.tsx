import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { TaskStatusActions } from "@/components/dashboard/TaskStatusActions";
import { getTaskById } from "@/lib/data/repositories/tasks";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const task = await getTaskById(params.id);
  return { title: task?.title ?? "Task" };
}

export default async function TaskDetailPage({ params }: Props) {
  const task = await getTaskById(params.id);
  if (!task) return notFound();

  return (
    <>
      <DashboardTopbar title="Tasks" />

      <div className="p-6 lg:p-8 max-w-[720px]">
        <Link href="/dashboard/tasks" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Tasks
        </Link>

        <h2 className="text-xl font-extrabold mb-1">{task.title}</h2>
        <p className="text-sm text-ink-soft mb-7">
          Assigned to {task.assignedTo} · Created by {task.createdBy}
          {task.dueDate && (
            <>
              {" "}· Due {task.dueDate}
              {task.isOverdue && (
                <span className="inline-flex items-center gap-1 text-[#C62828] font-bold ml-1">
                  <AlertTriangle size={13} /> Overdue
                </span>
              )}
            </>
          )}
        </p>

        {task.description && (
          <div className="bg-white border border-border rounded-md p-5 mb-6">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Description</span>
            <p className="text-sm mt-1.5 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-border rounded-md p-4">
            <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Priority</span>
            <p className="text-sm font-bold mt-1">{task.priority}</p>
          </div>
          {task.completedAt && (
            <div className="bg-white border border-border rounded-md p-4">
              <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Completed</span>
              <p className="text-sm font-bold mt-1">{new Date(task.completedAt).toLocaleString()}</p>
            </div>
          )}
        </div>

        <TaskStatusActions taskId={task.id} initialStatus={task.status} />
      </div>
    </>
  );
}
