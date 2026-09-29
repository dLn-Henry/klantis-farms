"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VetReport } from "@/lib/data/mock/vet-reports";
import { reviewVetReport, type ReviewDecision } from "@/lib/actions/vet-reports";

export function VetReportReview({ report }: { report: VetReport }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const decided = report.status === "Approved" || report.status === "Rejected";

  function handleDecision(next: ReviewDecision) {
    setError(null);
    setConfirmation(null);
    startTransition(async () => {
      const result = await reviewVetReport(report.id, next);
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (next === "Approved") {
        setConfirmation(`Report approved for ${report.animalTag}.`);
      } else if (next === "Rejected") {
        setConfirmation("Report rejected. The veterinarian will be notified.");
      } else {
        setConfirmation("Changes requested. The veterinarian will be notified to revise and resubmit.");
      }
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-extrabold">{report.code}</h2>
        <StatusBadge status={report.status} />
      </div>
      <p className="text-sm text-ink-soft mb-7">
        <Link href={`/dashboard/livestock/${report.animalId}`} className="font-semibold text-green">{report.animalTag}</Link>
        {" "}· Submitted by {report.submittedBy} · {report.visitDate}
      </p>

      {error && (
        <div className="flex items-center gap-3 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-4 py-3.5 mb-6">
          <AlertCircle size={18} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

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
          <button disabled={isPending} onClick={() => handleDecision("Approved")} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Approve
          </button>
          <button
            disabled={isPending}
            onClick={() => handleDecision("Changes Requested")}
            className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3.5 rounded-sm border border-border text-ink hover:border-gold hover:text-[#B4801F] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RotateCcw size={15} /> Request Changes
          </button>
          <button
            disabled={isPending}
            onClick={() => handleDecision("Rejected")}
            className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3.5 rounded-sm border border-border text-ink hover:border-[#C62828] hover:text-[#C62828] disabled:opacity-60 disabled:cursor-not-allowed"
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
