"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VetReport } from "@/lib/data/mock/vet-reports";

export function VetReportReview({ report }: { report: VetReport }) {
  const [status, setStatus] = useState(report.status);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const decided = status === "Approved" || status === "Rejected";

  function handleDecision(next: "Approved" | "Rejected" | "Changes Requested") {
    setStatus(next);
    if (next === "Approved") {
      setConfirmation(`Report approved. ${report.animalTag}'s official health record has been updated.`);
    } else if (next === "Rejected") {
      setConfirmation("Report rejected. The veterinarian will be notified.");
    } else {
      setConfirmation("Changes requested. The veterinarian will be notified to revise and resubmit.");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-extrabold">{report.code}</h2>
        <StatusBadge status={status} />
      </div>
      <p className="text-sm text-ink-soft mb-7">
        <Link href={`/dashboard/livestock/${report.animalId}`} className="font-semibold text-green">{report.animalTag}</Link>
        {" "}· Submitted by {report.submittedBy} · {report.visitDate}
      </p>

      {confirmation && (
        <div className="flex items-center gap-3 bg-mist border border-border rounded-md px-4 py-3.5 mb-6">
          <CheckCircle2 size={18} className="stroke-green flex-shrink-0" />
          <span className="text-sm font-semibold">{confirmation}</span>
        </div>
      )}

      <div className="bg-white border border-border rounded-md p-5 mb-6 space-y-5">
        <div>
          <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Reason for Visit</span>
          <p className="text-sm mt-1">{report.reason}</p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Findings</span>
          <p className="text-sm mt-1">{report.findings}</p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Diagnosis</span>
          <p className="text-sm mt-1">{report.diagnosis}</p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Treatment Plan</span>
          <p className="text-sm mt-1">{report.treatmentPlan}</p>
        </div>
      </div>

      {report.reviewedBy && (
        <p className="text-xs text-ink-soft mb-6">
          Reviewed by {report.reviewedBy} on {report.reviewedAt}
        </p>
      )}

      {!decided ? (
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleDecision("Approved")} className="btn-solid">
            <CheckCircle2 size={15} /> Approve
          </button>
          <button
            onClick={() => handleDecision("Changes Requested")}
            className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3.5 rounded-sm border border-border text-ink hover:border-gold hover:text-[#B4801F]"
          >
            <RotateCcw size={15} /> Request Changes
          </button>
          <button
            onClick={() => handleDecision("Rejected")}
            className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3.5 rounded-sm border border-border text-ink hover:border-[#C62828] hover:text-[#C62828]"
          >
            <XCircle size={15} /> Reject
          </button>
        </div>
      ) : (
        <Link href="/dashboard/veterinary" className="link-arrow">
          Back to All Reports <ArrowRight />
        </Link>
      )}
    </div>
  );
}
