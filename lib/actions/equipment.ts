"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import { friendlyDbError } from "@/lib/actions/errors";

export type EquipmentActionResult = { success: false; error: string };

export async function createEquipment(formData: FormData): Promise<EquipmentActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const manufacturer = String(formData.get("manufacturer") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const purchaseDate = String(formData.get("purchaseDate") ?? "").trim();
  const condition = String(formData.get("condition") ?? "Good").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!name) return { success: false, error: "Enter the equipment's name." };

  const supabase = createClient();
  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const { data: code, error: codeError } = await supabase.rpc("next_farm_code", {
    p_farm_id: farmId,
    p_prefix: "EQP",
  });
  if (codeError || !code) return { success: false, error: codeError?.message ?? "Could not generate an equipment number." };

  const { data, error } = await supabase
    .from("equipment")
    .insert({
      farm_id: farmId,
      code,
      name,
      category: category || null,
      manufacturer: manufacturer || null,
      model: model || null,
      purchase_date: purchaseDate || null,
      condition,
      location: location || null,
      status: "Operational",
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error ? friendlyDbError(error) : "Could not add the equipment." };

  revalidatePath("/dashboard/equipment");
  redirect(`/dashboard/equipment/${data.id}`);
}

export async function logMaintenance(formData: FormData): Promise<EquipmentActionResult> {
  const equipmentId = String(formData.get("equipmentId") ?? "").trim();
  const maintenanceType = String(formData.get("maintenanceType") ?? "").trim();
  const maintenanceDate = String(formData.get("maintenanceDate") ?? "").trim();
  const costRaw = String(formData.get("cost") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!equipmentId) return { success: false, error: "Choose which equipment this is for." };
  if (!maintenanceType) return { success: false, error: "Describe the type of maintenance." };
  if (!maintenanceDate) return { success: false, error: "Enter the date." };

  const cost = costRaw === "" ? null : Number(costRaw);
  if (cost !== null && (!Number.isFinite(cost) || cost < 0)) {
    return { success: false, error: "Cost must be zero or more." };
  }

  const supabase = createClient();
  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const { error } = await supabase.from("maintenance_records").insert({
    farm_id: farmId,
    equipment_id: equipmentId,
    maintenance_type: maintenanceType,
    maintenance_date: maintenanceDate,
    cost,
    notes: notes || null,
  });

  if (error) return { success: false, error: friendlyDbError(error) };

  revalidatePath(`/dashboard/equipment/${equipmentId}`);
  redirect(`/dashboard/equipment/${equipmentId}`);
}
