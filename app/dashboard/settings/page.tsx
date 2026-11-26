import type { Metadata } from "next";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { getSavedSettings } from "@/lib/data/repositories/site-settings-admin";
import { defaultSiteContent } from "@/lib/site-settings";
import { listMedia } from "@/lib/data/repositories/media";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import { getAccess, can } from "@/lib/auth/access";
import { publicMediaBase } from "@/lib/content/images";
import { NoAccess } from "@/components/dashboard/NoAccess";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [saved, media, farmId, access] = await Promise.all([getSavedSettings(), listMedia(), getCurrentFarmId(), getAccess()]);
  if (!farmId) return <NoAccess section="Settings" roles={access.roles} />;
  const canEdit = can(access, "settings.edit");

  // Start from what's live: saved values, else the public defaults.
  const d = defaultSiteContent();
  const initial: Record<string, string> = {
    "site.name": d.name, "site.tagline": d.tagline, "site.announcement": d.announcementBar,
    "site.delivery_note": d.deliveryRegionNote, "site.footer_blurb": d.footerBlurb, "site.seo_description": d.seoDescription,
    "contact.phone": d.phone, "contact.email": d.email, "contact.address": d.address, "contact.hours": d.hours,
    "social.facebook": d.social.facebook, "social.instagram": d.social.instagram, "social.twitter": d.social.twitter,
    "site.logo": "", "site.favicon": "", "site.og_image": "",
    ...saved,
  };

  const base = publicMediaBase();
  const images = media
    .filter((m) => m.bucket === "site-media" && m.mimeType.startsWith("image/") && m.url)
    .map((m) => ({ id: m.id, path: m.path, url: m.url!, alt: m.altText, name: m.fileName }));

  return (
    <>
      <DashboardTopbar title="Settings" />
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold">Site settings</h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Everything here feeds the public website: the header, footer, browser tab icon, contact page and how links to your site look when shared.
          </p>
        </div>
        {canEdit
          ? <SettingsForm initial={initial} images={images} farmId={farmId} mediaBase={base} />
          : <p className="text-sm text-ink-soft bg-white border border-border rounded-md p-6 max-w-[560px]">You can view these settings but only a Farm Owner or Farm Manager can change them.</p>}
      </div>
    </>
  );
}
