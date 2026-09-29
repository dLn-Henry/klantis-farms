"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export type SubmitVetReportResult = { success: false; error: string };

// Creates a new veterinary report in the Submitted state. As with the
// review action, the real rules live in the database (migration 0011):
// the report must start Draft/Submitted, be attributed to the caller, and
// reference an animal on the caller's own farm. This action only gathers
// input, asks the database for the next report code, and passes on
// whatever the database says if it refuses.
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
  redirect(`/dashboard/veterinary/${data.id}`);
}
