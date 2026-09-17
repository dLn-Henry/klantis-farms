"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { SITE_CONTENT } from "@/lib/site-config";

function Field({
  label, value, onChange, textarea = false,
}: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean;
}) {
  return (
    <div className="mb-4.5">
      <label className="text-xs font-bold block mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full border border-border rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-green"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-border rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-green"
        />
      )}
    </div>
  );
}

export function SettingsForm() {
const [name, setName] = useState<string>(SITE_CONTENT.name);
const [tagline, setTagline] = useState<string>(SITE_CONTENT.tagline);
const [announcementBar, setAnnouncementBar] = useState<string>(SITE_CONTENT.announcementBar);
const [deliveryRegionNote, setDeliveryRegionNote] = useState<string>(SITE_CONTENT.deliveryRegionNote);
const [phone, setPhone] = useState<string>(SITE_CONTENT.phone);
const [email, setEmail] = useState<string>(SITE_CONTENT.email);
const [address, setAddress] = useState<string>(SITE_CONTENT.address);
const [hours, setHours] = useState<string>(SITE_CONTENT.hours);
const [footerBlurb, setFooterBlurb] = useState<string>(SITE_CONTENT.footerBlurb);
const [facebook, setFacebook] = useState<string>(SITE_CONTENT.social.facebook);
const [instagram, setInstagram] = useState<string>(SITE_CONTENT.social.instagram);
const [twitter, setTwitter] = useState<string>(SITE_CONTENT.social.twitter);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // This is exactly the settings screen described in the comment at the
    // top of lib/site-config.ts — but there's no backend yet to persist to,
    // so this updates local state only. Once Supabase exists, this becomes
    // a real update to the `settings` table, and every public page that
    // imports SITE_CONTENT picks up the change automatically.
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="max-w-[640px]">
      {saved && (
        <div className="flex items-center gap-2.5 bg-mist border border-border rounded-md px-4 py-3 mb-6">
          <CheckCircle2 size={16} className="stroke-green flex-shrink-0" />
          <span className="text-sm font-semibold">
            Saved locally. This won&apos;t persist across a page refresh yet — there&apos;s no backend to save to.
          </span>
        </div>
      )}

      <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4">General</h3>
      <Field label="Farm Name" value={name} onChange={setName} />
      <Field label="Tagline" value={tagline} onChange={setTagline} />

      <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4 mt-8">Contact Information</h3>
      <div className="grid sm:grid-cols-2 gap-4.5">
        <Field label="Phone" value={phone} onChange={setPhone} />
        <Field label="Email" value={email} onChange={setEmail} />
      </div>
      <Field label="Address" value={address} onChange={setAddress} />
      <Field label="Business Hours" value={hours} onChange={setHours} />

      <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4 mt-8">Site Content</h3>
      <Field label="Announcement Bar" value={announcementBar} onChange={setAnnouncementBar} />
      <Field label="Delivery Region Note" value={deliveryRegionNote} onChange={setDeliveryRegionNote} />
      <Field label="Footer Description" value={footerBlurb} onChange={setFooterBlurb} textarea />

      <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4 mt-8">Social Links</h3>
      <Field label="Facebook" value={facebook} onChange={setFacebook} />
      <Field label="Instagram" value={instagram} onChange={setInstagram} />
      <Field label="Twitter" value={twitter} onChange={setTwitter} />

      <button type="submit" className="btn-solid mt-4">
        <Save size={15} /> Save Settings
      </button>
    </form>
  );
}
