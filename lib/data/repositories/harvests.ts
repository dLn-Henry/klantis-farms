import { createClient } from "@/lib/supabase/server";
import type { Harvest } from "@/lib/data/mock/harvests";

type HarvestRow = {
  id: string;
  code: string;
  crop_cycle_id: string | null;
  harvest_date: string;
  quantity: number;
  unit: string;
  quality_grade: string | null;
  destination: string | null;
  recorded_by: string | null;
  status: string;
};

async function getCropCycleInfoMap(cropCycleIds: string[]): Promise<Map<string, { crop: string; field: string }>> {
  const map = new Map<string, { crop: string; field: string }>();
  const ids = cropCycleIds.filter(Boolean);
  if (ids.length === 0) return map;

  const supabase = createClient();
  const { data: cycles } = await supabase.from("crop_cycles").select("id, field_id, crop_type_id").in("id", ids);
  if (!cycles || cycles.length === 0) return map;

  const fieldIds = Array.from(new Set(cycles.map((c) => c.field_id).filter((x): x is string => !!x)));
  const cropTypeIds = Array.from(new Set(cycles.map((c) => c.crop_type_id).filter((x): x is string => !!x)));

  const [{ data: fields }, { data: cropTypes }] = await Promise.all([
    fieldIds.length
      ? supabase.from("fields").select("id, name").in("id", fieldIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    cropTypeIds.length
      ? supabase.from("crop_types").select("id, name").in("id", cropTypeIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);
  const fieldMap = new Map((fields ?? []).map((f) => [f.id, f.name]));
  const cropTypeMap = new Map((cropTypes ?? []).map((c) => [c.id, c.name]));

  for (const cycle of cycles) {
    map.set(cycle.id, {
      crop: (cycle.crop_type_id && cropTypeMap.get(cycle.crop_type_id)) || "—",
      field: (cycle.field_id && fieldMap.get(cycle.field_id)) || "—",
    });
  }
  return map;
}

async function getProfileNameMap(userIds: (string | null)[]): Promise<Map<string, string>> {
  const ids = userIds.filter((x): x is string => !!x);
  if (ids.length === 0) return new Map();
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("id, display_name").in("id", ids);
  return new Map((data ?? []).map((p) => [p.id, p.display_name ?? "—"]));
}

function mapHarvestRow(
  row: HarvestRow,
  cycleInfoMap: Map<string, { crop: string; field: string }>,
  nameMap: Map<string, string>
): Harvest {
  const info = row.crop_cycle_id ? cycleInfoMap.get(row.crop_cycle_id) : undefined;
  return {
    id: row.id,
    code: row.code,
    crop: info?.crop ?? "—",
    field: info?.field ?? "—",
    cropCycleId: row.crop_cycle_id ?? "",
    date: row.harvest_date,
    quantity: `${row.quantity} ${row.unit}`,
    qualityGrade: row.quality_grade ?? "—",
    destination: row.destination ?? "—",
    recordedBy: (row.recorded_by && nameMap.get(row.recorded_by)) || "—",
    status: row.status as Harvest["status"],
  };
}

export async function getAllHarvests(): Promise<Harvest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("harvests")
    .select("id, code, crop_cycle_id, harvest_date, quantity, unit, quality_grade, destination, recorded_by, status")
    .order("harvest_date", { ascending: false });

  if (error) throw error;
  const rows = data ?? [];
  const [cycleInfoMap, nameMap] = await Promise.all([
    getCropCycleInfoMap(rows.map((r) => r.crop_cycle_id).filter((x): x is string => !!x)),
    getProfileNameMap(rows.map((r) => r.recorded_by)),
  ]);
  return rows.map((row) => mapHarvestRow(row, cycleInfoMap, nameMap));
}

export async function getHarvestById(id: string): Promise<Harvest | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("harvests")
    .select("id, code, crop_cycle_id, harvest_date, quantity, unit, quality_grade, destination, recorded_by, status")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  const [cycleInfoMap, nameMap] = await Promise.all([
    getCropCycleInfoMap(data.crop_cycle_id ? [data.crop_cycle_id] : []),
    getProfileNameMap([data.recorded_by]),
  ]);
  return mapHarvestRow(data, cycleInfoMap, nameMap);
}
