import { createClient } from "@/lib/supabase/server";
import type { CropCycle, CropEvent } from "@/lib/data/mock/crop-cycles";

type CropCycleRow = {
  id: string;
  code: string;
  variety: string | null;
  season: string | null;
  planting_date: string | null;
  expected_harvest_date: string | null;
  area: string | null;
  status: string;
  field_id: string | null;
  crop_type_id: string | null;
};

async function getLookupMaps() {
  const supabase = createClient();
  const [{ data: fields }, { data: cropTypes }] = await Promise.all([
    supabase.from("fields").select("id, name"),
    supabase.from("crop_types").select("id, name"),
  ]);
  return {
    fieldMap: new Map((fields ?? []).map((f) => [f.id, f.name])),
    cropTypeMap: new Map((cropTypes ?? []).map((c) => [c.id, c.name])),
  };
}

function mapCropCycleRow(
  row: CropCycleRow,
  fieldMap: Map<string, string>,
  cropTypeMap: Map<string, string>
): CropCycle {
  return {
    id: row.id,
    code: row.code,
    crop: (row.crop_type_id && cropTypeMap.get(row.crop_type_id)) || "—",
    variety: row.variety ?? "—",
    field: (row.field_id && fieldMap.get(row.field_id)) || "—",
    season: row.season ?? "—",
    plantingDate: row.planting_date ?? "—",
    expectedHarvest: row.expected_harvest_date ?? "—",
    area: row.area ?? "—",
    status: row.status as CropCycle["status"],
    events: [],
  };
}

export async function getAllCropCycles(): Promise<CropCycle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("crop_cycles")
    .select("id, code, variety, season, planting_date, expected_harvest_date, area, status, field_id, crop_type_id")
    .order("code");

  if (error) throw error;
  const { fieldMap, cropTypeMap } = await getLookupMaps();
  return (data ?? []).map((row) => mapCropCycleRow(row, fieldMap, cropTypeMap));
}

export async function getCropCycleById(id: string): Promise<CropCycle | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("crop_cycles")
    .select("id, code, variety, season, planting_date, expected_harvest_date, area, status, field_id, crop_type_id")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  const { fieldMap, cropTypeMap } = await getLookupMaps();

  const { data: activityRows } = await supabase
    .from("crop_activities")
    .select("activity_date, activity_type, detail")
    .eq("crop_cycle_id", id)
    .order("activity_date", { ascending: false });

  const events: CropEvent[] = (activityRows ?? []).map((a) => ({
    date: a.activity_date,
    type: a.activity_type,
    detail: a.detail ?? "",
  }));

  return { ...mapCropCycleRow(data, fieldMap, cropTypeMap), events };
}
