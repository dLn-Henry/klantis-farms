"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Paperclip, X, FileText } from "lucide-react";
import { submitVetReport } from "@/lib/actions/vet-reports";
import { MAX_FILES_PER_REPORT, checkVetFile, uploadVetFiles } from "@/lib/media/vet-upload";
import { formatBytes } from "@/lib/media/constants";

const inputClass = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";

type Phase = "idle" | "saving" | "uploading";

export function NewVetReportForm({
  animals, farmId, defaultAnimalId,
}: { animals: { id: string; tag: string }[]; farmId: string; defaultAnimalId?: string }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileProblems, setFileProblems] = useState<string[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const busy = phase !== "idle";

  function addFiles(list: FileList | null) {
    if (!list) return;
    const problems: string[] = [];
    const accepted = [...files];
    for (const f of Array.from(list)) {
      const p = checkVetFile(f);
      if (p) problems.push(p);
      else if (accepted.length >= MAX_FILES_PER_REPORT) problems.push(`Only ${MAX_FILES_PER_REPORT} files per report.`);
      else accepted.push(f);
    }
    setFiles(accepted);
    setFileProblems(Array.from(new Set(problems)));
    if (fileInput.current) fileInput.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPhase("saving");
    const result = await submitVetReport(new FormData(e.currentTarget));
    if (!result.success) { setError(result.error); setPhase("idle"); return; }

    // The report now exists; attach the photos to it, then open it.
    let failures: string[] = [];
    if (files.length > 0) {
      setPhase("uploading");
      failures = await uploadVetFiles(files, farmId, result.reportId);
    }
    router.push(`/dashboard/veterinary/${result.reportId}${failures.length ? "?files=partial" : ""}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[640px] space-y-5">
      {error && (
        <div className="flex items-center gap-3 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-4 py-3.5" role="alert">
          <AlertCircle size={18} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="animalId" className={labelClass}>Animal</label>
          <select id="animalId" name="animalId" required defaultValue={defaultAnimalId ?? ""} className={inputClass} disabled={busy}>
            <option value="" disabled>Select an animal</option>
            {animals.map((a) => <option key={a.id} value={a.id}>{a.tag}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="visitDate" className={labelClass}>Visit Date</label>
          <input id="visitDate" name="visitDate" type="date" required defaultValue={today} max={today} className={inputClass} disabled={busy} />
        </div>
      </div>

      <div><label htmlFor="reason" className={labelClass}>Reason for Visit</label><input id="reason" name="reason" required placeholder="e.g. Routine health check" className={inputClass} disabled={busy} /></div>
      <div><label htmlFor="findings" className={labelClass}>Findings</label><textarea id="findings" name="findings" required rows={4} className={inputClass} disabled={busy} /></div>
      <div><label htmlFor="diagnosis" className={labelClass}>Diagnosis</label><textarea id="diagnosis" name="diagnosis" rows={2} className={inputClass} disabled={busy} /></div>
      <div><label htmlFor="treatmentPlan" className={labelClass}>Treatment Plan</label><textarea id="treatmentPlan" name="treatmentPlan" rows={3} className={inputClass} disabled={busy} /></div>

      <div>
        <span className={labelClass}>Photos &amp; documents <span className="font-normal normal-case">(optional)</span></span>
        <p className="text-xs text-ink-soft mb-2">Add pictures or a lab result to support your findings. They become part of this report.</p>
        <input ref={fileInput} id="files" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => addFiles(e.target.files)} disabled={busy} />
        <label htmlFor="files" className={`btn-outline inline-flex items-center gap-2 cursor-pointer ${busy ? "opacity-60 pointer-events-none" : ""}`}>
          <Paperclip size={15} /> Add photos or a PDF
        </label>
        <span className="text-[11.5px] text-ink-soft ml-3">JPG, PNG, WebP or PDF · up to {formatBytes(5 * 1024 * 1024)} each · max {MAX_FILES_PER_REPORT}</span>

        {fileProblems.length > 0 && <ul className="mt-2 space-y-0.5">{fileProblems.map((p) => <li key={p} className="text-xs font-semibold text-[#C62828]">{p}</li>)}</ul>}

        {files.length > 0 && (
          <ul className="mt-3 grid sm:grid-cols-2 gap-2.5">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-3 border border-border rounded-md p-2 bg-white">
                {f.type.startsWith("image/")
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={URL.createObjectURL(f)} alt="" className="w-12 h-12 object-cover rounded" />
                  : <span className="w-12 h-12 rounded bg-surface flex items-center justify-center"><FileText size={20} className="stroke-ink-soft" /></span>}
                <span className="min-w-0 flex-1"><b className="text-xs block truncate">{f.name}</b><span className="text-[11px] text-ink-soft">{formatBytes(f.size)}</span></span>
                <button type="button" onClick={() => setFiles(files.filter((_, k) => k !== i))} disabled={busy} aria-label={`Remove ${f.name}`} className="p-1.5 text-ink-soft hover:text-[#C62828]"><X size={15} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-ink-soft">
        Submitting sends this report for review. It becomes an official record only once a Farm Owner or Farm Manager approves it. You can&apos;t approve your own report.
      </p>

      <button type="submit" disabled={busy} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
        {busy ? <><Loader2 size={15} className="animate-spin" /> {phase === "uploading" ? "Uploading photos…" : "Submitting…"}</> : "Submit Report"}
      </button>
    </form>
  );
}
