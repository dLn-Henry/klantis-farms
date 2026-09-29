import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { NewTaskForm } from "@/components/dashboard/NewTaskForm";
import { getAssignableFarmMembers } from "@/lib/data/repositories/tasks";

export const metadata: Metadata = { title: "New Task" };

export default async function NewTaskPage() {
  const members = await getAssignableFarmMembers();

  return (
    <>
      <DashboardTopbar title="Tasks" />

      <div className="p-6 lg:p-8">
        <Link href="/dashboard/tasks" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Tasks
        </Link>

        <h2 className="text-lg font-extrabold mb-1">New Task</h2>
        <p className="text-sm text-ink-soft mb-7">Assign work to yourself or another member of the farm.</p>

        <NewTaskForm members={members} />
      </div>
    </>
  );
}
