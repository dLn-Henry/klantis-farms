"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import { friendlyDbError } from "@/lib/actions/errors";

export type CreateAnimalResult = { success: false; error: string };

export async function createAnimal(formData: FormData): Promise<CreateAnimalResult> {
  const tag = String(formData.get("tag") ?? "").trim();
  const speciesId = String(formData.get("speciesId") ?? "").trim();
  const breedId = String(formData.get("breedId") ?? "").trim();
  const sex = String(formData.get("sex") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const weightRaw = String(formData.get("weight") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!tag) return { success: false, error: "Every animal needs a tag." };
  if (!speciesId) return { success: false, error: "Choose the species." };
  if (sex !== "Male" && sex !== "Female") return { success: false, error: "Choose the animal's sex." };

  const weight = weightRaw === "" ? null : Number(weightRaw);
  if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
    return { success: false, error: "Weight must be a number, zero or more." };
  }

  const supabase = createClient();
  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const { data, error } = await supabase
    .from("animals")
    .insert({
      farm_id: farmId,
      tag,
      species_id: speciesId,
      breed_id: breedId || null,
      sex,
      date_of_birth: dateOfBirth || null,
      current_weight: weight,
      location: location || null,
      status: "Active",
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error ? friendlyDbError(error, { unique: `The tag "${tag}" is already in use on this farm.` }) : "Could not add the animal.",
    };
  }

  revalidatePath("/dashboard/livestock");
  redirect(`/dashboard/livestock/${data.id}`);
}
