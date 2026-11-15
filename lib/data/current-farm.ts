import { createClient } from "@/lib/supabase/server";

// Resolves the signed-in user's farm_id server-side, never trusting a
// client-supplied value for it. Takes their first active farm membership.
//
// This is intentionally the single farm they belong to for now -- the
// whole platform is single-farm-first per the project roadmap, and there
// is no "current farm" switcher UI yet. Once someone can genuinely belong
// to more than one farm, this needs to read a selected-farm preference
// (session/cookie) instead of just taking the first membership; leaving
// that TODO here rather than silently picking the wrong farm for a
// multi-farm user once that day comes.
export async function getCurrentFarmId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("farm_members")
    .select("farm_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return data?.farm_id ?? null;
}
