"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import { friendlyDbError } from "@/lib/actions/errors";

export type SettingsResult = { success: true } | { success: false; error: string };

// Plain text fields: key -> max length. Required ones may not be saved empty.
const TEXT: Record<string, { max: number; required?: boolean; label: string }> = {
  "site.name": { max: 80, required: true, label: "Farm name" },
  "site.tagline": { max: 120, label: "Tagline" },
  "site.announcement": { max: 160, label: "Announcement bar" },
  "site.delivery_note": { max: 160, label: "Delivery note" },
  "site.footer_blurb": { max: 400, label: "Footer text" },
  "site.seo_description": { max: 300, label: "Search description" },
  "contact.phone": { max: 40, label: "Phone" },
  "contact.email": { max: 120, label: "Email" },
  "contact.address": { max: 200, label: "Address" },
  "contact.hours": { max: 120, label: "Business hours" },
  "social.facebook": { max: 300, label: "Facebook link" },
  "social.instagram": { max: 300, label: "Instagram link" },
  "social.twitter": { max: 300, label: "X / Twitter link" },
};
const IMAGE_KEYS = ["site.logo", "site.favicon", "site.og_image"] as const;

// Saves every site setting in one go. Shape checks live here for friendly
// messages; the rules that matter (who may edit, only known keys public,
// https-only social links, images must be from this farm's library) are
// enforced again by the database, so a forged request can't get around them.
export async function saveSiteSettings(formData: FormData): Promise<SettingsResult> {
  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const rows: { farm_id: string; key: string; value: string; is_public: boolean }[] = [];

  for (const [key, meta] of Object.entries(TEXT)) {
    const v = String(formData.get(key) ?? "").trim();
    if (meta.required && !v) return { success: false, error: `${meta.label} can't be empty.` };
    if (v.length > meta.max) return { success: false, error: `${meta.label} is too long (${meta.max} characters at most).` };
    if (key.startsWith("social.") && v && !/^https:\/\/\S+$/i.test(v)) {
      return { success: false, error: `${meta.label} must be a full link starting with https://` };
    }
    if (key === "contact.email" && v && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v)) {
      return { success: false, error: "That email address doesn't look right." };
    }
    rows.push({ farm_id: farmId, key, value: v, is_public: true });
  }
  for (const key of IMAGE_KEYS) {
    rows.push({ farm_id: farmId, key, value: String(formData.get(key) ?? "").trim(), is_public: true });
  }

  const supabase = createClient();
  const { error } = await supabase.from("settings").upsert(rows, { onConflict: "farm_id,key" });
  if (error) {
    if (error.code === "42501") return { success: false, error: "You don't have permission to change the site settings." };
    return { success: false, error: friendlyDbError(error) };
  }

  revalidateTag("site-settings");
  revalidatePath("/", "layout");
  return { success: true };
}
