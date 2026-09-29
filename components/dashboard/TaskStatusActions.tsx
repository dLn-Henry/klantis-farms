"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Circle, PlayCircle, CheckCircle2, XCircle } from "lucide-react";
import { updateTaskStatus } from "@/lib/actions/tasks";
import type { TaskStatus } from "@/lib/data/repositories/tasks";

const OPTIONS: { status: TaskStatus; label: string; icon: typeof Circle }[] = [
  { status: "Pending", label: "Pending", icon: Circle },
  { status: "In Progress", label: "In Progress", icon: PlayCircle },
  { status: "Completed", label: "Completed", icon: CheckCircle2 },
  { status: "Cancelled", label: "Cancelled", icon: XCircle },
];

export function TaskStatusActions({ taskId, initialStatus }: { taskId: string; initialStatus: TaskStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: TaskStatus) {
    if (next === status) return;
    setError(null);
    startTransition(async () => {
      const result = await updateTaskStatus(taskId, next);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setStatus(next);
      router.refresh();
    });
  }

  return (
    <div className="bg-white border border-border rounded-md p-5">
      <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">Status</h3>

      {error && (
        <div className="flex items-center gap-2.5 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-3.5 py-3 mb-4">
          <AlertCircle size={16} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(({ status: opt, label, icon: Icon }) => (
          <button
            key={opt}
            disabled={isPending}
            onClick={() => handleChange(opt)}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-sm border disabled:opacity-60 disabled:cursor-not-allowed ${
              status === opt ? "bg-green text-white border-green" : "border-border text-ink hover:border-green"
            }`}
          >
            {isPending && status !== opt ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
