"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Paperclip, Trash2, Loader2, AlertCircle } from "lucide-react";
import { deleteVetAttachment } from "@/lib/actions/vet-reports";
import { MAX_FILES_PER_REPORT, uploadVetFiles } from "@/lib/media/vet-upload";
import { formatBytes } from "@/lib/media/constants";
import type { ReportFile } from "@/lib/data/repositories/vet-portal";

export function VetAttachmentsPanel({
  items, farmId, reportId, canAdd, canRemove, partialUpload,
}: { items: ReportFile[]; farmId: string; reportId: string; canAdd: boolean; canRemove: boolean; partialUpload?: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [problems, setProblems] = useState<string[]>(partialUpload ? ["Some files didn't upload. You can add them again below."] : []);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();

  async function add(list: FileList | null) {
    if (!list || list.length === 0) return;
    const room = MAX_FILES_PER_REPORT - items.length;
    setBusy(true); setProblems([]);
    const failures = await uploadVetFiles(Array.from(list).slice(0, Math.max(0, room)), farmId, reportId);
    if (list.length > room) failures.push(`Only ${MAX_FILES_PER_REPORT} files per report.`);
    setProblems(failures); setBusy(false);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  function remove(id: string, name: string) {
    if (!window.confirm(`Remove "${name}" from this report?`)) return;
    start(async () => {
      const r = await deleteVetAttachment(id);
      if (!r.success) setProblems([r.error]); else router.refresh();
    });
  }

  if (items.length === 0 && !canAdd) return null;

  return (
    <section className="mt-6 bg-white border border-border rounded-md p-5">
      <h3 className="text-sm font-extrabold uppercase tracking-wide mb-3">Photos &amp; documents ({items.length})</h3>

      {problems.length > 0 && (
        <ul className="mb-3 space-y-1">{problems.map((p) => <li key={p} className="flex items-center gap-2 text-xs font-semibold text-[#C62828]"><AlertCircle size={14} /> {p}</li>)}</ul>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-ink-soft">No files attached.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((f) => (
            <li key={f.id} className="border border-border rounded-md overflow-hidden bg-surface">
              <a href={f.url ?? undefined} target="_blank" rel="noopener noreferrer" className="block aspect-[4/3] bg-white flex items-center justify-center">
                {f.mime.startsWith("image/") && f.url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={f.url} alt={f.name} loading="lazy" className="w-full h-full object-cover" />
                  : <FileText size={34} className="stroke-ink-soft" />}
              </a>
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="min-w-0 flex-1"><b className="text-xs block truncate" title={f.name}>{f.name}</b><span className="text-[11px] text-ink-soft">{formatBytes(f.size)}</span></span>
                {canRemove && (
                  <button onClick={() => remove(f.id, f.name)} disabled={pending} aria-label={`Remove ${f.name}`} className="p-1.5 text-ink-soft hover:text-[#C62828]"><Trash2 size={15} /></button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canAdd && items.length < MAX_FILES_PER_REPORT && (
        <div className="mt-4">
          <input ref={input} id="more-files" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => add(e.target.files)} disabled={busy} />
          <label htmlFor="more-files" className={`btn-outline inline-flex items-center gap-2 cursor-pointer ${busy ? "opacity-60 pointer-events-none" : ""}`}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Paperclip size={15} />} Add more photos or a PDF
          </label>
        </div>
      )}
    </section>
  );
}
