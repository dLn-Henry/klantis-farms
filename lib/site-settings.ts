import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_CONTENT } from "@/lib/site-config";
import { publicMediaUrl } from "@/lib/content/images";

// What the public website shows about the farm. Values come from the
// `settings` table (edited at Dashboard -> Settings); lib/site-config.ts holds
// the defaults used until something has been saved, or if the database can't be
// reached -- so the public site never breaks because of a settings problem.

export type SiteContent = {
  name: string;
  tagline: string;
  pageTitleSuffix: string;
  announcementBar: string;
  deliveryRegionNote: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  footerBlurb: string;
  copyright: string;
  seoDescription: string;
  social: { facebook: string; instagram: string; twitter: string };
  logoUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
};

// setting key -> where it lives. `optional` fields are hidden when saved empty;
// required ones fall back to the default instead.
export const SETTING_KEYS = {
  "site.name": { field: "name", optional: false },
  "site.tagline": { field: "tagline", optional: false },
  "site.announcement": { field: "announcementBar", optional: true },
  "site.delivery_note": { field: "deliveryRegionNote", optional: true },
  "site.footer_blurb": { field: "footerBlurb", optional: false },
  "site.seo_description": { field: "seoDescription", optional: false },
  "contact.phone": { field: "phone", optional: false },
  "contact.email": { field: "email", optional: false },
  "contact.address": { field: "address", optional: false },
  "contact.hours": { field: "hours", optional: false },
  "social.facebook": { field: "social.facebook", optional: true },
  "social.instagram": { field: "social.instagram", optional: true },
  "social.twitter": { field: "social.twitter", optional: true },
} as const;

const DEFAULT_SEO =
  "Klantis Farms raises cattle and cultivates mangoes, cashew, yam and maize on one working farm in Ghana's Eastern Region.";

export function defaultSiteContent(): SiteContent {
  return {
    name: SITE_CONTENT.name,
    tagline: SITE_CONTENT.tagline,
    pageTitleSuffix: SITE_CONTENT.name,
    announcementBar: SITE_CONTENT.announcementBar,
    deliveryRegionNote: SITE_CONTENT.deliveryRegionNote,
    phone: SITE_CONTENT.phone,
    email: SITE_CONTENT.email,
    address: SITE_CONTENT.address,
    hours: SITE_CONTENT.hours,
    footerBlurb: SITE_CONTENT.footerBlurb,
    copyright: SITE_CONTENT.copyright,
    seoDescription: DEFAULT_SEO,
    social: { ...SITE_CONTENT.social },
    logoUrl: null,
    faviconUrl: null,
    ogImageUrl: null,
  };
}

type Row = { farm_id: string; key: string; value: string | null; updated_at: string };

export function buildSiteContent(rows: { key: string; value: string | null }[]): SiteContent {
  const site = defaultSiteContent();
  const byKey = new Map(rows.map((r) => [r.key, (r.value ?? "").trim()]));

  for (const [key, meta] of Object.entries(SETTING_KEYS)) {
    if (!byKey.has(key)) continue;
    const v = byKey.get(key)!;
    if (v === "" && !meta.optional) continue; // required: empty means "use the default"
    if (meta.field.startsWith("social.")) {
      site.social[meta.field.slice(7) as keyof SiteContent["social"]] = v;
    } else {
      (site as Record<string, unknown>)[meta.field] = v;
    }
  }
  site.pageTitleSuffix = site.name;
  site.copyright = `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`;
  site.logoUrl = publicMediaUrl(byKey.get("site.logo"));
  site.faviconUrl = publicMediaUrl(byKey.get("site.favicon"));
  site.ogImageUrl = publicMediaUrl(byKey.get("site.og_image"));
  return site;
}

async function load(): Promise<SiteContent> {
  try {
    const { data, error } = await createPublicClient()
      .from("settings")
      .select("farm_id, key, value, updated_at")
      .eq("is_public", true);
    if (error || !data || data.length === 0) return defaultSiteContent();

    // One public site for now: use the farm whose site name was saved first.
    // (Several farms each get their own storefront later; that is Phase 7.)
    const rows = data as Row[];
    const primary =
      rows.filter((r) => r.key === "site.name").sort((a, b) => a.updated_at.localeCompare(b.updated_at))[0]?.farm_id ??
      rows[0].farm_id;
    return buildSiteContent(rows.filter((r) => r.farm_id === primary));
  } catch {
    return defaultSiteContent();
  }
}

// Cached; saving settings calls revalidateTag("site-settings") so a change
// shows up straight away. The short TTL is a safety net.
export const getSiteContent = unstable_cache(load, ["site-content"], { tags: ["site-settings"], revalidate: 120 });
