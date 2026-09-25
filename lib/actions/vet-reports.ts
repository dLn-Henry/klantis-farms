"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
