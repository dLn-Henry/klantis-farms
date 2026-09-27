"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { createTask } from "@/lib/actions/tasks";

export function NewTaskForm({ members }: { members: { id: string; name: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTask(formData);
      // On success the action redirects, so this line only runs on failure.
      if (result && !result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="max-w-[560px] space-y-5">
      {error && (
        <div className="flex items-center gap-3 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-4 py-3.5">
          <AlertCircle size={18} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="e.g. Vaccinate goats in Pen 3"
          className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Any additional detail or instructions"
          className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="Medium"
            className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">
            Due Date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green"
          />
        </div>
      </div>

      <div>
        <label htmlFor="assignedTo" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">
          Assign To
        </label>
        <select
          id="assignedTo"
          name="assignedTo"
          defaultValue=""
          className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white"
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Create Task"}
      </button>
    </form>
  );
}
