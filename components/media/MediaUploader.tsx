"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerMedia } from "@/lib/actions/media";
import {
  ALLOWED_MIME, EXT_FOR_MIME, MAX_UPLOAD_BYTES, formatBytes, type MediaBucket,
} from "@/lib/media/constants";

type Line = { name: string; state: "uploading" | "done" | "error"; message?: string };

// Reusable: the media library uses it directly, and the blog / vet / settings
// editors will reuse it. Files go browser -> Storage directly (Vercel caps
// request bodies at ~4.5 MB, so routing 5 MB images through our server would
// break). The bucket rules confine each upload to this farm's own folder, and
// registerMedia() then re-checks the real bytes on the server.
export function MediaUploader({
  farmId,
  bucket,
  onUploaded,
  label = "Upload files",
}: {
  farmId: string;
  bucket: MediaBucket;
  onUploaded?: (mediaId: string) => void;
  label?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const busy = lines.some((l) => l.state === "uploading");

  const allowed = ALLOWED_MIME[bucket];
  const accept = allowed.join(",");

  async function uploadOne(file: File, idx: number) {
    const set = (patch: Partial<Line>) =>
      setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

    if (file.size > MAX_UPLOAD_BYTES) return set({ state: "error", message: `Larger than ${formatBytes(MAX_UPLOAD_BYTES)}.` });
    const ext = EXT_FOR_MIME[file.type];
    if (!ext || !allowed.includes(file.type)) return set({ state: "error", message: "Not an allowed file type." });

    const supabase = createClient();
    // Random name: the original filename is stored in the database, never in
    // the path, so odd characters or collisions can't matter.
    const path = `${farmId}/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
    if (error) return set({ state: "error", message: error.message });

    const res = await registerMedia({ bucket, path, fileName: file.name });
    if (!res.success) return set({ state: "error", message: res.error });
    set({ state: "done" });
    onUploaded?.(res.id);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).slice(0, 10);
    setLines(list.map((f) => ({ name: f.name, state: "uploading" })));
    await Promise.all(list.map((f, i) => uploadOne(f, i)));
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="sr-only"
        id={`upload-${bucket}`}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={busy}
      />
      <label
        htmlFor={`upload-${bucket}`}
        className={`btn-solid inline-flex cursor-pointer ${busy ? "opacity-60 pointer-events-none" : ""}`}
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} {label}
      </label>
      <p className="text-[11.5px] text-ink-soft mt-1.5">
        {bucket === "site-media" ? "JPG, PNG, WebP, GIF or ICO" : "JPG, PNG, WebP or PDF"} · up to {formatBytes(MAX_UPLOAD_BYTES)} each · 10 at a time
      </p>

      {lines.length > 0 && (
        <ul className="mt-3 space-y-1.5" aria-live="polite">
          {lines.map((l, i) => (
            <li key={i} className="flex items-center gap-2 text-xs">
              {l.state === "uploading" && <Loader2 size={14} className="animate-spin text-ink-soft" />}
              {l.state === "done" && <CheckCircle2 size={14} className="text-[#2E7D32]" />}
              {l.state === "error" && <AlertCircle size={14} className="text-[#C62828]" />}
              <span className="font-semibold truncate max-w-[220px]">{l.name}</span>
              {l.message && <span className="text-[#C62828]">{l.message}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
