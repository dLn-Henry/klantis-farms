"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import { friendlyDbError } from "@/lib/actions/errors";
import {
  ALLOWED_MIME, MAX_UPLOAD_BYTES, MEDIA_BUCKETS, type MediaBucket,
} from "@/lib/media/constants";
import { mimeMatches, sniffMime } from "@/lib/media/sniff";

export type MediaResult =
  | { success: true; id: string }
  | { success: false; error: string };
type Result = { success: true } | { success: false; error: string };

// Step 2 of an upload. The browser has already put the file in Storage (the
// bucket rules confine it to this farm's folder). Here -- server side, where
// the client can't lie -- we look at the real bytes, and only then record it.
// A file that fails any check is deleted again so nothing orphaned is left.
export async function registerMedia(input: {
  bucket: string;
  path: string;
  fileName: string;
  altText?: string;
}): Promise<MediaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in." };

  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const bucket = input.bucket as MediaBucket;
  if (!MEDIA_BUCKETS.includes(bucket)) return { success: false, error: "Unknown storage area." };

  // The path must be exactly "<this farm>/<something>" -- never trust a
  // client-supplied farm. (RLS would refuse anyway; this gives a clear error.)
  if (!input.path.startsWith(`${farmId}/`) || input.path.includes("..")) {
    return { success: false, error: "That file isn't in your farm's folder." };
  }

  const reject = async (error: string): Promise<MediaResult> => {
    await supabase.storage.from(bucket).remove([input.path]);
    return { success: false, error };
  };

  const { data: blob, error: dlError } = await supabase.storage.from(bucket).download(input.path);
  if (dlError || !blob) return { success: false, error: "The upload didn't complete. Please try again." };

  if (blob.size > MAX_UPLOAD_BYTES) return reject("That file is larger than 5 MB.");

  const head = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  const real = sniffMime(head);
  if (!real || !ALLOWED_MIME[bucket].includes(real)) {
    return reject("That file type isn't allowed. Use a JPG, PNG, WebP or GIF image.");
  }
  if (blob.type && !mimeMatches(blob.type, real)) {
    return reject("The file's contents don't match its type.");
  }

  const fileName = input.fileName.replace(/[\u0000-\u001f<>:"\\|?*]/g, "").slice(0, 200) || "file";
  const { data, error } = await supabase
    .from("media")
    .insert({
      farm_id: farmId,
      bucket,
      path: input.path,
      file_name: fileName,
      mime_type: real,
      size_bytes: blob.size,
      alt_text: (input.altText ?? "").trim().slice(0, 300) || null,
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return reject(error ? friendlyDbError(error) : "Could not save the file.");
  }

  revalidatePath("/dashboard/media");
  return { success: true, id: data.id };
}

export async function updateMediaAlt(id: string, altText: string): Promise<Result> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in." };

  const { error } = await supabase
    .from("media")
    .update({ alt_text: altText.trim().slice(0, 300) || null })
    .eq("id", id);
  if (error) return { success: false, error: friendlyDbError(error) };

  revalidatePath("/dashboard/media");
  return { success: true };
}

export async function deleteMedia(id: string): Promise<Result> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in." };

  const { data: row } = await supabase.from("media").select("bucket, path").eq("id", id).maybeSingle();
  if (!row) return { success: false, error: "That file no longer exists." };

  // Row first: its RLS decides who may delete. Only if that succeeds do we
  // remove the bytes, so a refused delete can never strand a record pointing
  // at nothing.
  const { data: deleted, error } = await supabase.from("media").delete().eq("id", id).select("id");
  if (error) return { success: false, error: friendlyDbError(error) };
  if (!deleted || deleted.length === 0) {
    return { success: false, error: "Only the person who uploaded this, or a Farm Owner/Manager, can delete it." };
  }

  await supabase.storage.from(row.bucket as MediaBucket).remove([row.path]);
  revalidatePath("/dashboard/media");
  return { success: true };
}
