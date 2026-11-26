import { createClient } from "@/lib/supabase/server";

export type Preferences = { favourites: string[]; collapsedGroups: string[]; showPlanned: boolean };
export const DEFAULT_PREFERENCES: Preferences = { favourites: [], collapsedGroups: [], showPlanned: true };

export async function getMyPreferences(): Promise<Preferences> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULT_PREFERENCES;
  const { data } = await supabase.from("user_preferences")
    .select("favourites, collapsed_groups, show_planned").eq("user_id", user.id).maybeSingle();
  if (!data) return DEFAULT_PREFERENCES;
  return { favourites: data.favourites ?? [], collapsedGroups: data.collapsed_groups ?? [], showPlanned: data.show_planned };
}
