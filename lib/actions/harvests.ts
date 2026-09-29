"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import { friendlyDbError } from "@/lib/actions/errors";

export type RecordHarvestResult = { success: false; error: string };

// Records a harvest as "Recorded". Approval (which is what should add to
// stock) is a separate step by someone else -- the database refuses a
// harvest that starts out approved or is attributed to anyone but the
// caller (migration 0011), and refuses a non-positive quantity (0013).
export async function recordHarvest(formData: FormData): Promise<RecordHarvestResult> {
  const cropCycleId = String(formData.get("cropCycleId") ?? "").trim();
  const harvestDate = String(formData.get("harvestDate") ?? "").trim();
  const quantity = Number(String(formData.get("quantity") ?? "").trim());
  const unit = String(formData.get("unit") ?? "").trim();
  const qualityGrade = String(formData.get("qualityGrade") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();

  if (!cropCycleId) return { success: false, error: "Choose the crop this harvest came from." };
  if (!harvestDate) return { success: false, error: "Enter the harvest date." };
  if (!Number.isFinite(quantity) || quantity <= 0) return { success: false, error: "Quantity must be greater than zero." };
  if (!unit) return { success: false, error: "Choose a unit." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in to record a harvest." };

  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const { data: code, error: codeError } = await supabase.rpc("next_farm_code", {
    p_farm_id: farmId,
    p_prefix: "HAR",
  });
  if (codeError || !code) return { success: false, error: codeError?.message ?? "Could not generate a harvest number." };

  const { data, error } = await supabase
    .from("harvests")
    .insert({
      farm_id: farmId,
      crop_cycle_id: cropCycleId,
      code,
      harvest_date: harvestDate,
      quantity,
      unit,
      quality_grade: qualityGrade || null,
      destination: destination || null,
      recorded_by: user.id,
      status: "Recorded",
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error ? friendlyDbError(error) : "Could not record the harvest." };

  revalidatePath("/dashboard/harvests");
  redirect(`/dashboard/harvests/${data.id}`);
}
