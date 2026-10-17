"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import { friendlyDbError } from "@/lib/actions/errors";

export type CreateCropCycleResult = { success: false; error: string };

export async function createCropCycle(formData: FormData): Promise<CreateCropCycleResult> {
  const fieldId = String(formData.get("fieldId") ?? "").trim();
  const cropTypeId = String(formData.get("cropTypeId") ?? "").trim();
  const variety = String(formData.get("variety") ?? "").trim();
  const season = String(formData.get("season") ?? "").trim();
  const plantingDate = String(formData.get("plantingDate") ?? "").trim();
  const expectedHarvestDate = String(formData.get("expectedHarvestDate") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();

  if (!fieldId) return { success: false, error: "Choose which field this is." };
  if (!cropTypeId) return { success: false, error: "Choose a crop." };

  const supabase = createClient();
  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const { data: code, error: codeError } = await supabase.rpc("next_farm_code", {
    p_farm_id: farmId,
    p_prefix: "CC",
  });
  if (codeError || !code) return { success: false, error: codeError?.message ?? "Could not generate a crop cycle number." };

  const { data, error } = await supabase
    .from("crop_cycles")
    .insert({
      farm_id: farmId,
      field_id: fieldId,
      crop_type_id: cropTypeId,
      code,
      variety: variety || null,
      season: season || null,
      planting_date: plantingDate || null,
      expected_harvest_date: expectedHarvestDate || null,
      area: area || null,
      status: "Planned",
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error ? friendlyDbError(error) : "Could not create the crop cycle." };

  revalidatePath("/dashboard/crops");
  redirect(`/dashboard/crops/${data.id}`);
}
