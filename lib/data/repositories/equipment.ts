import { createClient } from "@/lib/supabase/server";
import type { Equipment, EquipmentStatus } from "@/lib/data/mock/equipment";

const COLUMNS = "id, code, name, category, manufacturer, model, purchase_date, condition, location, status";

function mapRow(r: {
  id: string; code: string; name: string; category: string | null; manufacturer: string | null;
  model: string | null; purchase_date: string | null; condition: string | null; location: string | null; status: string;
}, maintenance: Equipment["maintenance"] = []): Equipment {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category ?? "",
    manufacturer: r.manufacturer ?? "",
    model: r.model ?? "",
    purchaseDate: r.purchase_date ?? "",
    condition: (r.condition ?? "Good") as Equipment["condition"],
    location: r.location ?? "",
    status: r.status as EquipmentStatus,
    maintenance,
  };
}

export async function getAllEquipment(): Promise<Equipment[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("equipment").select(COLUMNS).order("name");
  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r));
}

export async function getEquipmentById(id: string): Promise<Equipment | undefined> {
  const supabase = createClient();
  const [{ data, error }, { data: records }] = await Promise.all([
    supabase.from("equipment").select(COLUMNS).eq("id", id).single(),
    supabase
      .from("maintenance_records")
      .select("maintenance_date, maintenance_type, cost, notes")
      .eq("equipment_id", id)
      .order("maintenance_date", { ascending: false }),
  ]);
  if (error || !data) return undefined;
  return mapRow(
    data,
    (records ?? []).map((m) => ({ date: m.maintenance_date, type: m.maintenance_type, cost: m.cost ?? 0, notes: m.notes ?? "" }))
  );
}
