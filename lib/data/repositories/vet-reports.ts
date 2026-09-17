import { createClient } from "@/lib/supabase/server";
import type { VetReport } from "@/lib/data/mock/vet-reports";

// ============================================================================
// Real queries replacing the mock array. Same separate-query-plus-JS-join
// approach as animals.ts and orders.ts.
//
// IMPORTANT: components/dashboard/VetReportReview.tsx's Approve/Reject/
// Request Changes buttons still only update LOCAL React state — they do
// NOT call Supabase to persist the decision. That's the next piece of work
// (likely a Server Action calling `.update()` on veterinary_reports, which
// the audit_log trigger in migration 0006 is already set up to react to).
// Flagging this clearly rather than let it look done when it isn't.
// ============================================================================

type VetReportRow = {
  id: string;
  code: string;
  animal_id: string;
  submitted_by: string | null;
  visit_date: string;
  reason: string | null;
  findings: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
};

async function getAnimalTagMap(animalIds: string[]): Promise<Map<string, string>> {
  if (animalIds.length === 0) return new Map();
  const supabase = createClient();
  const { data } = await supabase.from("animals").select("id, tag").in("id", animalIds);
  return new Map((data ?? []).map((a) => [a.id, a.tag]));
}

async function getProfileNameMap(userIds: (string | null)[]): Promise<Map<string, string>> {
  const ids = userIds.filter((id): id is string => !!id);
  if (ids.length === 0) return new Map();
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("id, display_name").in("id", ids);
  return new Map((data ?? []).map((p) => [p.id, p.display_name ?? "—"]));
}

function mapReport(row: VetReportRow, tagMap: Map<string, string>, nameMap: Map<string, string>): VetReport {
  return {
    id: row.id,
    code: row.code,
    animalId: row.animal_id,
    animalTag: tagMap.get(row.animal_id) ?? "—",
    submittedBy: (row.submitted_by && nameMap.get(row.submitted_by)) || "—",
    visitDate: row.visit_date,
    reason: row.reason ?? "",
    findings: row.findings ?? "",
    diagnosis: row.diagnosis ?? "",
    treatmentPlan: row.treatment_plan ?? "",
    status: row.status as VetReport["status"],
    reviewedBy: (row.reviewed_by && nameMap.get(row.reviewed_by)) || undefined,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

export async function getAllVetReports(): Promise<VetReport[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("veterinary_reports")
    .select(
      "id, code, animal_id, submitted_by, visit_date, reason, findings, diagnosis, treatment_plan, status, reviewed_by, reviewed_at"
    )
    .order("visit_date", { ascending: false });

  if (error) throw error;
  const rows = data ?? [];
  const tagMap = await getAnimalTagMap(rows.map((r) => r.animal_id));
  const nameMap = await getProfileNameMap(rows.flatMap((r) => [r.submitted_by, r.reviewed_by]));
  return rows.map((row) => mapReport(row, tagMap, nameMap));
}

export async function getVetReportById(id: string): Promise<VetReport | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("veterinary_reports")
    .select(
      "id, code, animal_id, submitted_by, visit_date, reason, findings, diagnosis, treatment_plan, status, reviewed_by, reviewed_at"
    )
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  const tagMap = await getAnimalTagMap([data.animal_id]);
  const nameMap = await getProfileNameMap([data.submitted_by, data.reviewed_by]);
  return mapReport(data, tagMap, nameMap);
}
