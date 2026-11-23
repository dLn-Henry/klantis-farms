import { createClient } from "@/lib/supabase/client";
import { registerVetAttachment } from "@/lib/actions/vet-reports";
import { ALLOWED_MIME, EXT_FOR_MIME, MAX_UPLOAD_BYTES, formatBytes } from "@/lib/media/constants";

export const MAX_FILES_PER_REPORT = 10;

/** Friendly pre-check so the vet learns about a bad file before submitting. */
export function checkVetFile(f: File): string | null {
  if (!ALLOWED_MIME["private-media"].includes(f.type)) return `${f.name}: use a JPG, PNG, WebP or PDF.`;
  if (f.size > MAX_UPLOAD_BYTES) return `${f.name}: larger than ${formatBytes(MAX_UPLOAD_BYTES)}.`;
  return null;
}

// Browser -> private `vet-reports` bucket (only this report's author can write
// there, while the report is open), then the server re-checks the real bytes.
export async function uploadVetFiles(files: File[], farmId: string, reportId: string): Promise<string[]> {
  const supabase = createClient();
  const failures: string[] = [];
  for (const f of files) {
    const problem = checkVetFile(f);
    if (problem) { failures.push(problem); continue; }
    const path = `${farmId}/${reportId}/${crypto.randomUUID()}.${EXT_FOR_MIME[f.type]}`;
    const { error } = await supabase.storage.from("vet-reports").upload(path, f, { contentType: f.type, upsert: false });
    if (error) { failures.push(`${f.name}: ${error.message}`); continue; }
    const res = await registerVetAttachment({ reportId, path, fileName: f.name });
    if (!res.success) failures.push(`${f.name}: ${res.error}`);
  }
  return failures;
}
