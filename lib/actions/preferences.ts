"use server";

import { createClient } from "@/lib/supabase/server";
import { LIVE_HREFS, GROUP_TITLES } from "@/lib/navigation";

type Result = { success: true } | { success: false; error: string };
type Patch = { favourites?: string[]; collapsedGroups?: string[]; showPlanned?: boolean };

// Saves the signed-in person's own dashboard preferences. Only real dashboard
// pages and real group names are accepted; the database repeats the shape
// checks (and row-level security means nobody can touch anyone else's row).
export async function savePreferences(patch: Patch): Promise<Result> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in." };

  const row: { user_id: string; favourites?: string[]; collapsed_groups?: string[]; show_planned?: boolean } = { user_id: user.id };
  if (patch.favourites) {
    const f = Array.from(new Set(patch.favourites)).filter((h) => LIVE_HREFS.has(h));
    if (f.length > 12) return { success: false, error: "You can pin up to 12 favourites." };
    row.favourites = f;
  }
  if (patch.collapsedGroups) row.collapsed_groups = patch.collapsedGroups.filter((g) => GROUP_TITLES.includes(g));
  if (typeof patch.showPlanned === "boolean") row.show_planned = patch.showPlanned;

  const { error } = await supabase.from("user_preferences").upsert(row, { onConflict: "user_id" });
  if (error) return { success: false, error: "Couldn't save that. Please try again." };
  return { success: true };
}
