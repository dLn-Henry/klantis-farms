import { createClient } from "@/lib/supabase/server";
import type { Field, FieldHistoryEntry } from "@/lib/data/mock/fields";

// ============================================================================
// Real queries replacing the mock array. "currentCrop" isn't a stored
// column — it's derived from whichever crop_cycle on this field currently
// has a non-completed status, matching how the UI describes it.
// ============================================================================

type FieldRow = {
  id: string;
  code: string;
  name: string;
  area: number | null;
  area_unit: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  status: string;
};

async function getCurrentCropMap(fieldIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (fieldIds.length === 0) return map;

  const supabase = createClient();
  const { data: cycles } = await supabase
    .from("crop_cycles")
    .select("field_id, crop_type_id, variety, status")
    .in("field_id", fieldIds)
    .in("status", ["Planted", "Growing", "Harvesting"]);

  if (!cycles || cycles.length === 0) return map;

  const cropTypeIds = Array.from(new Set(cycles.map((c) => c.crop_type_id).filter((x): x is string => !!x)));
  const { data: cropTypes } = cropTypeIds.length
    ? await supabase.from("crop_types").select("id, name").in("id", cropTypeIds)
    : { data: [] as { id: string; name: string }[] };
  const cropTypeMap = new Map((cropTypes ?? []).map((c) => [c.id, c.name]));

  for (const cycle of cycles) {
    if (!cycle.field_id || map.has(cycle.field_id)) continue; // first active cycle wins
    const cropName = cycle.crop_type_id ? cropTypeMap.get(cycle.crop_type_id) : undefined;
    map.set(cycle.field_id, cropName ? `${cropName} (${cycle.variety ?? "—"})` : "—");
  }
  return map;
}

async function getFieldHistoryMap(fieldIds: string[]): Promise<Map<string, FieldHistoryEntry[]>> {
  const map = new Map<string, FieldHistoryEntry[]>();
  if (fieldIds.length === 0) return map;

  const supabase = createClient();
  const { data } = await supabase
    .from("field_history")
    .select("field_id, season, crop, outcome")
    .in("field_id", fieldIds)
    .order("season", { ascending: false });

  for (const row of data ?? []) {
    const list = map.get(row.field_id) ?? [];
    list.push({ season: row.season, crop: row.crop, outcome: row.outcome ?? "" });
    map.set(row.field_id, list);
  }
  return map;
}

function mapFieldRow(row: FieldRow, currentCrop: string, history: FieldHistoryEntry[]): Field {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    area: row.area != null ? `${row.area} ${row.area_unit ?? "acres"}` : "—",
    soilType: row.soil_type ?? "—",
    irrigationType: row.irrigation_type ?? "—",
    currentCrop,
    status: row.status as Field["status"],
    history,
  };
}

export async function getAllFields(): Promise<Field[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fields")
    .select("id, code, name, area, area_unit, soil_type, irrigation_type, status")
    .order("code");

  if (error) throw error;
  const rows = data ?? [];
  const ids = rows.map((r) => r.id);
  const [cropMap, historyMap] = await Promise.all([getCurrentCropMap(ids), getFieldHistoryMap(ids)]);
  return rows.map((row) => mapFieldRow(row, cropMap.get(row.id) ?? "—", historyMap.get(row.id) ?? []));
}

export async function getFieldById(id: string): Promise<Field | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fields")
    .select("id, code, name, area, area_unit, soil_type, irrigation_type, status")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  const [cropMap, historyMap] = await Promise.all([getCurrentCropMap([id]), getFieldHistoryMap([id])]);
  return mapFieldRow(data, cropMap.get(id) ?? "—", historyMap.get(id) ?? []);
}
