import type { Metadata } from "next";
import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllTasks } from "@/lib/data/repositories/tasks";

export const metadata: Metadata = { title: "Tasks" };

const PRIORITY_STYLE: Record<string, string> = {
  High: "text-[#C62828]",
  Medium: "text-[#B4801F]",
  Low: "text-ink-soft",
};

export default async function TasksPage() {
  const tasks = await getAllTasks();

  return (
    <>
      <DashboardTopbar title="Tasks" />

      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold">Tasks</h2>
            <p className="text-sm text-ink-soft mt-0.5">Everything assigned across the farm, and what needs attention.</p>
          </div>
          <Link href="/dashboard/tasks/new" className="btn-solid">
            <Plus size={15} /> New Task
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white border border-border rounded-md p-10 text-center">
            <p className="text-sm font-semibold text-ink-soft mb-4">No tasks yet.</p>
            <Link href="/dashboard/tasks/new" className="btn-solid inline-flex">
              <Plus size={15} /> Create your first task
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-md overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-border bg-surface text-left text-xs font-bold text-ink-soft uppercase tracking-wide">
                  <th className="px-5 py-3">Task</th>
                  <th className="px-5 py-3">Assigned To</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                    <td className="px-5 py-3.5 font-bold">{t.title}</td>
                    <td className="px-5 py-3.5 text-ink-soft">{t.assignedTo}</td>
                    <td className={`px-5 py-3.5 font-bold ${PRIORITY_STYLE[t.priority] ?? ""}`}>{t.priority}</td>
                    <td className="px-5 py-3.5">
                      {t.dueDate ? (
                        <span className={`inline-flex items-center gap-1.5 ${t.isOverdue ? "text-[#C62828] font-bold" : "text-ink-soft"}`}>
                          {t.isOverdue && <AlertTriangle size={13} />}
                          {t.dueDate}
                        </span>
                      ) : (
                        <span className="text-ink-soft">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/dashboard/tasks/${t.id}`} className="text-green font-bold text-xs">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
