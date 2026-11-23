"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";

export type ReviewDecision = "Approved" | "Rejected" | "Changes Requested";

export type ReviewVetReportResult =
  | { success: true }
  | { success: false; error: string };

// Persists a review decision on a veterinary report.
//
// Deliberately thin: no self-review or role check happens here. That logic
// lives once, in the database (guard_vet_report_review trigger, migration
// 0008), which is what actually enforces it no matter which client calls
// it. This action just performs the write and turns whatever the database
// says into a message the UI can show directly -- the trigger's exception
// text is already written to be shown to a real user, so no re-wording is
// done here that could drift out of sync with the actual rule.
export async function reviewVetReport(
  reportId: string,
  decision: ReviewDecision
): Promise<ReviewVetReportResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to review a report." };
  }

  const { error } = await supabase
    .from("veterinary_reports")
    .update({
      status: decision,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/veterinary/${reportId}`);
  revalidatePath("/dashboard/veterinary");

  return { success: true };
}

export type SubmitVetReportResult = { success: true; reportId: string } | { success: false; error: string };

// Creates a new veterinary report in the Submitted state. As with the
// review action, the real rules live in the database (migration 0011):
// the report must start Draft/Submitted, be attributed to the caller, and
// reference an animal on the caller's own farm. This action only gathers
// input, asks the database for the next report code, and passes on
// whatever the database says if it refuses. It returns the new report's id
// so the form can upload the vet's photos straight into that report.
export async function submitVetReport(formData: FormData): Promise<SubmitVetReportResult> {
  const animalId = String(formData.get("animalId") ?? "").trim();
  const visitDate = String(formData.get("visitDate") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const findings = String(formData.get("findings") ?? "").trim();
  const diagnosis = String(formData.get("diagnosis") ?? "").trim();
  const treatmentPlan = String(formData.get("treatmentPlan") ?? "").trim();

  if (!animalId) return { success: false, error: "Choose the animal this report is about." };
  if (!visitDate) return { success: false, error: "Enter the date of the visit." };
  if (!reason) return { success: false, error: "Describe the reason for the visit." };
  if (!findings) return { success: false, error: "Record your findings." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in to submit a report." };

  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const { data: code, error: codeError } = await supabase.rpc("next_farm_code", {
    p_farm_id: farmId,
    p_prefix: "VET",
  });
  if (codeError || !code) {
    return { success: false, error: codeError?.message ?? "Could not generate a report number." };
  }

  const { data, error } = await supabase
    .from("veterinary_reports")
    .insert({
      farm_id: farmId,
      animal_id: animalId,
      code,
      submitted_by: user.id,
      visit_date: visitDate,
      reason,
      findings,
      diagnosis: diagnosis || null,
      treatment_plan: treatmentPlan || null,
      status: "Submitted",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Could not submit the report." };
  }

  revalidatePath("/dashboard/veterinary");
  return { success: true, reportId: data.id };
}


// ---------------------------------------------------------------------------
// Report attachments: photos/PDFs that are PART OF a report (not the media
// library, which is for Owners/Managers only). The browser uploads straight to
// the private `vet-reports` bucket; storage rules only allow the report's
// author, while it is still editable, and reviewers can read. This second step
// re-checks the real bytes and records the file.
// ---------------------------------------------------------------------------
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from "@/lib/media/constants";
import { mimeMatches, sniffMime } from "@/lib/media/sniff";

type SimpleResult = { success: true } | { success: false; error: string };

export async function registerVetAttachment(input: { reportId: string; path: string; fileName: string }): Promise<SimpleResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in." };

  const { data: report } = await supabase
    .from("veterinary_reports").select("id, farm_id").eq("id", input.reportId).maybeSingle();
  if (!report) return { success: false, error: "That report wasn't found." };

  if (!input.path.startsWith(`${report.farm_id}/${report.id}/`) || input.path.includes("..")) {
    return { success: false, error: "That file isn't in this report's folder." };
  }

  const reject = async (error: string): Promise<SimpleResult> => {
    await supabase.storage.from("vet-reports").remove([input.path]);
    return { success: false, error };
  };

  const { data: blob, error: dl } = await supabase.storage.from("vet-reports").download(input.path);
  if (dl || !blob) return { success: false, error: "The upload didn't complete. Please try again." };
  if (blob.size > MAX_UPLOAD_BYTES) return reject("That file is larger than 5 MB.");

  const real = sniffMime(new Uint8Array(await blob.slice(0, 16).arrayBuffer()));
  if (!real || !ALLOWED_MIME["private-media"].includes(real)) return reject("Use a JPG, PNG, WebP or PDF file.");
  if (blob.type && !mimeMatches(blob.type, real)) return reject("The file's contents don't match its type.");

  const fileName = input.fileName.replace(/[\u0000-\u001f<>:"\\|?*]/g, "").slice(0, 200) || "file";
  const { error } = await supabase.from("vet_report_attachments").insert({
    farm_id: report.farm_id, report_id: report.id, path: input.path,
    file_name: fileName, mime_type: real, size_bytes: blob.size, uploaded_by: user.id,
  });
  if (error) return reject(error.message);

  revalidatePath(`/dashboard/veterinary/${report.id}`);
  return { success: true };
}

export async function deleteVetAttachment(attachmentId: string): Promise<SimpleResult> {
  const supabase = createClient();
  const { data: row } = await supabase
    .from("vet_report_attachments").select("path, report_id").eq("id", attachmentId).maybeSingle();
  if (!row) return { success: false, error: "That file no longer exists." };

  const { data: deleted, error } = await supabase
    .from("vet_report_attachments").delete().eq("id", attachmentId).select("id");
  if (error) return { success: false, error: error.message };
  if (!deleted || deleted.length === 0) {
    return { success: false, error: "You can only remove files from your own report while it is still open." };
  }
  await supabase.storage.from("vet-reports").remove([row.path]);
  revalidatePath(`/dashboard/veterinary/${row.report_id}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Vet assignments: a manager chooses which animals a vet may see. The rules
// (assignee must be a vet on this farm, animal on this farm, only managers)
// live in the database (migration 0019).
// ---------------------------------------------------------------------------
export async function assignVetVisit(formData: FormData): Promise<SimpleResult> {
  const vetId = String(formData.get("vetId") ?? "");
  const animalId = String(formData.get("animalId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  if (!vetId) return { success: false, error: "Choose a veterinarian." };
  if (!animalId) return { success: false, error: "Choose an animal." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in." };
  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const { error } = await supabase.from("vet_assignments").insert({
    farm_id: farmId, vet_user_id: vetId, animal_id: animalId,
    reason: reason || null, due_date: dueDate || null, assigned_by: user.id,
  });
  if (error) {
    if (error.code === "42501") return { success: false, error: "You don't have permission to assign a veterinarian." };
    return { success: false, error: error.message };
  }
  revalidatePath("/dashboard/veterinary");
  return { success: true };
}

export async function cancelVetAssignment(id: string): Promise<SimpleResult> {
  const supabase = createClient();
  const { data, error } = await supabase.from("vet_assignments").update({ status: "Cancelled" }).eq("id", id).select("id");
  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) return { success: false, error: "That assignment can't be cancelled." };
  revalidatePath("/dashboard/veterinary");
  return { success: true };
}
