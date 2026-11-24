import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";

// The settings as stored for THIS farm (the form's starting values). Anything
// not saved yet is simply absent, and the form shows the public defaults.
export async function getSavedSettings(): Promise<Record<string, string>> {
  const farmId = await getCurrentFarmId();
  if (!farmId) return {};
  const { data } = await createClient().from("settings").select("key, value").eq("farm_id", farmId);
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
}
