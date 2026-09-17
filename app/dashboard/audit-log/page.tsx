import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getAuditLog } from "@/lib/data/repositories/audit-log";

export const metadata: Metadata = { title: "Audit Log" };

const ACTION_COLORS: Record<string, string> = {
  Approved: "text-[#2E7D32]",
  Rejected: "text-[#C62828]",
  Created: "text-green",
  Recorded: "text-green",
  Updated: "text-[#B4801F]",
  Adjusted: "text-[#B4801F]",
  Invited: "text-[#2878A8]",
};

export default async function AuditLogPage() {
  const entries = await getAuditLog();

  return (
    <>
      <DashboardTopbar title="Audit Log" />

      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold">Audit Log</h2>
          <p className="text-sm text-ink-soft mt-0.5">Who changed what, and when — every important action, traceable.</p>
        </div>

        <div className="bg-white border border-border rounded-md overflow-hidden">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-4 px-5 py-4 border-b border-border last:border-b-0">
              <span className="w-8 h-8 rounded-full bg-mist flex items-center justify-center flex-shrink-0 mt-0.5">
                <ScrollText size={15} className="stroke-green" />
              </span>
              <div className="flex-1">
                <p className="text-sm">
                  <b className="font-bold">{entry.user}</b>{" "}
                  <span className={`font-semibold ${ACTION_COLORS[entry.action] ?? "text-ink"}`}>{entry.action.toLowerCase()}</span>{" "}
                  {entry.entityType.toLowerCase()}{" "}
                  <span className="font-semibold">{entry.entityLabel}</span>
                </p>
                <span className="text-xs text-ink-soft">{entry.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
