import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";

// Everything here relies on row-level security for WHO sees WHAT (migration
// 0019): a vet only ever gets the animals assigned to them and their own
// reports; managers get the whole picture. Nothing below filters by role.

export type Assignment = {
  id: string; animalId: string; animalTag: string; species: string; breed: string;
  animalStatus: string; reason: string; dueDate: string | null; createdAt: string; vetId: string; vetName: string;
};

async function lookups(animalIds: string[], vetIds: string[]) {
  const supabase = createClient();
  const [{ data: animals }, { data: profiles }, { data: species }, { data: breeds }] = await Promise.all([
    animalIds.length ? supabase.from("animals").select("id, tag, status, species_id, breed_id").in("id", animalIds) : Promise.resolve({ data: [] as { id: string; tag: string; status: string; species_id: string | null; breed_id: string | null }[] }),
    vetIds.length ? supabase.from("profiles").select("id, display_name").in("id", vetIds) : Promise.resolve({ data: [] as { id: string; display_name: string | null }[] }),
    supabase.from("species").select("id, name"),
    supabase.from("breeds").select("id, name"),
  ]);
  return {
    animals: new Map((animals ?? []).map((a) => [a.id, a])),
    names: new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? "—"])),
    species: new Map((species ?? []).map((s) => [s.id, s.name])),
    breeds: new Map((breeds ?? []).map((b) => [b.id, b.name])),
  };
}

async function mapAssignments(rows: { id: string; animal_id: string; vet_user_id: string; reason: string | null; due_date: string | null; created_at: string }[]): Promise<Assignment[]> {
  const l = await lookups(rows.map((r) => r.animal_id), rows.map((r) => r.vet_user_id));
  return rows.map((r) => {
    const a = l.animals.get(r.animal_id);
    return {
      id: r.id, animalId: r.animal_id, animalTag: a?.tag ?? "—",
      species: (a?.species_id && l.species.get(a.species_id)) || "", breed: (a?.breed_id && l.breeds.get(a.breed_id)) || "",
      animalStatus: a?.status ?? "", reason: r.reason ?? "", dueDate: r.due_date, createdAt: r.created_at,
      vetId: r.vet_user_id, vetName: l.names.get(r.vet_user_id) ?? "—",
    };
  });
}

const COLS = "id, animal_id, vet_user_id, reason, due_date, created_at";

/** Open assignments for the signed-in vet. */
export async function getMyOpenAssignments(): Promise<Assignment[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("vet_assignments").select(COLS)
    .eq("vet_user_id", user.id).eq("status", "Open").order("created_at", { ascending: false });
  return mapAssignments(data ?? []);
}

/** Every open assignment on the farm (managers). */
export async function getOpenAssignments(): Promise<Assignment[]> {
  const supabase = createClient();
  const { data } = await supabase.from("vet_assignments").select(COLS)
    .eq("status", "Open").order("created_at", { ascending: false });
  return mapAssignments(data ?? []);
}

/** Team members who hold a veterinary role (for the assign form). */
export async function getVetCandidates(): Promise<{ id: string; name: string }[]> {
  const farmId = await getCurrentFarmId();
  if (!farmId) return [];
  const supabase = createClient();
  const { data } = await supabase.rpc("list_farm_team", { p_farm_id: farmId });
  return (data ?? [])
    .filter((m) => m.status === "active" && m.role_names.includes("Veterinarian"))
    .map((m) => ({ id: m.user_id, name: m.display_name }));
}

export type AnimalHealth = {
  id: string; tag: string; species: string; breed: string; sex: string; status: string;
  ageLabel: string; weight: string; location: string;
  events: { id: string; date: string; type: string; detail: string }[];
};

/** Health-relevant view of ONE animal. Returns undefined if RLS hides it. */
export async function getAnimalHealth(id: string): Promise<AnimalHealth | undefined> {
  const supabase = createClient();
  const { data: a } = await supabase.from("animals")
    .select("id, tag, sex, date_of_birth, current_weight, weight_unit, location, status, species_id, breed_id")
    .eq("id", id).maybeSingle();
  if (!a) return undefined;
  const [{ data: sp }, { data: br }, { data: ev }] = await Promise.all([
    a.species_id ? supabase.from("species").select("name").eq("id", a.species_id).maybeSingle() : Promise.resolve({ data: null }),
    a.breed_id ? supabase.from("breeds").select("name").eq("id", a.breed_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("animal_events").select("id, event_date, event_type, detail").eq("animal_id", id).order("event_date", { ascending: false }).limit(30),
  ]);
  let ageLabel = "—";
  if (a.date_of_birth) {
    const months = Math.max(0, Math.floor((Date.now() - new Date(a.date_of_birth).getTime()) / (30.44 * 86400000)));
    ageLabel = months >= 24 ? `${Math.floor(months / 12)} years` : `${months} months`;
  }
  return {
    id: a.id, tag: a.tag, species: sp?.name ?? "", breed: br?.name ?? "", sex: a.sex ?? "—", status: a.status, ageLabel,
    weight: a.current_weight != null ? `${a.current_weight} ${a.weight_unit ?? "kg"}` : "—", location: a.location ?? "—",
    events: (ev ?? []).map((e) => ({ id: e.id, date: e.event_date, type: e.event_type, detail: e.detail ?? "" })),
  };
}

export type ReportFile = { id: string; name: string; mime: string; size: number; url: string | null };

/** Attachments of a report, plus what the viewer may do with them. */
export async function getVetReportFiles(reportId: string): Promise<{
  farmId: string; items: ReportFile[]; canAdd: boolean; isAuthor: boolean;
} | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: report } = await supabase.from("veterinary_reports")
    .select("id, farm_id, submitted_by, status").eq("id", reportId).maybeSingle();
  if (!report) return null;

  const { data: rows } = await supabase.from("vet_report_attachments")
    .select("id, path, file_name, mime_type, size_bytes").eq("report_id", reportId).order("created_at");
  const paths = (rows ?? []).map((r) => r.path);
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from("vet-reports").createSignedUrls(paths, 3600);
    (data ?? []).forEach((d) => d.path && d.signedUrl && signed.set(d.path, d.signedUrl));
  }
  const isAuthor = !!user && report.submitted_by === user.id;
  return {
    farmId: report.farm_id,
    isAuthor,
    canAdd: isAuthor && ["Submitted", "Changes Requested"].includes(report.status),
    items: (rows ?? []).map((r) => ({ id: r.id, name: r.file_name, mime: r.mime_type, size: Number(r.size_bytes), url: signed.get(r.path) ?? null })),
  };
}
