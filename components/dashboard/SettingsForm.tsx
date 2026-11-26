"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2, AlertCircle, Loader2, ImageIcon, X, ExternalLink } from "lucide-react";
import { saveSiteSettings } from "@/lib/actions/site-settings";
import { MediaPicker, type PickerImage } from "@/components/media/MediaPicker";

type Values = Record<string, string>;

const input = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white disabled:bg-surface";
const labelCls = "text-xs font-bold block mb-1.5";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-border rounded-md p-6 mb-6">
      <h3 className="text-sm font-extrabold uppercase tracking-wide">{title}</h3>
      {hint && <p className="text-xs text-ink-soft mt-1">{hint}</p>}
      <div className="mt-5 space-y-4.5">{children}</div>
    </section>
  );
}

function ImageField({
  label, hint, value, urlFor, onChoose, onClear, shape,
}: { label: string; hint: string; value: string; urlFor: (path: string) => string | null; onChoose: () => void; onClear: () => void; shape: "square" | "wide" }) {
  const url = value ? urlFor(value) : null;
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="flex items-center gap-4">
        <div className={`${shape === "square" ? "w-16 h-16" : "w-40 h-20"} rounded-md border border-border bg-surface flex items-center justify-center overflow-hidden flex-shrink-0`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url ? <img src={url} alt="" className="w-full h-full object-contain" /> : <ImageIcon size={22} className="stroke-ink-soft" />}
        </div>
        <div>
          <div className="flex gap-2">
            <button type="button" onClick={onChoose} className="btn-outline !py-1.5 !px-3 !text-xs">{value ? "Change" : "Choose image"}</button>
            {value && <button type="button" onClick={onClear} className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-[#C62828]"><X size={13} /> Remove</button>}
          </div>
          <p className="text-[11.5px] text-ink-soft mt-1.5 max-w-[320px]">{hint}</p>
        </div>
      </div>
    </div>
  );
}

export function SettingsForm({
  initial, images, farmId, mediaBase,
}: { initial: Values; images: PickerImage[]; farmId: string; mediaBase: string | null }) {
  const router = useRouter();
  const [v, setV] = useState<Values>(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [picking, setPicking] = useState<null | "site.logo" | "site.favicon" | "site.og_image">(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((p) => ({ ...p, [k]: e.target.value }));
  const urlFor = (path: string) => (mediaBase ? `${mediaBase}${path.split("/").map(encodeURIComponent).join("/")}` : null);

  function text(key: string, label: string, opts: { textarea?: boolean; max?: number; placeholder?: string; type?: string } = {}) {
    return (
      <div>
        <label htmlFor={key} className={labelCls}>{label}</label>
        {opts.textarea
          ? <textarea id={key} name={key} rows={3} maxLength={opts.max} value={v[key] ?? ""} onChange={set(key)} placeholder={opts.placeholder} className={input} />
          : <input id={key} name={key} type={opts.type ?? "text"} maxLength={opts.max} value={v[key] ?? ""} onChange={set(key)} placeholder={opts.placeholder} className={input} />}
      </div>
    );
  }

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await saveSiteSettings(fd);
      setMsg(r.success ? { ok: true, text: "Saved. The public website now shows these details." } : { ok: false, text: r.error });
      if (r.success) router.refresh();
    });
  }

  return (
    <form onSubmit={save} className="max-w-[760px]">
      {msg && (
        <div role="status" className={`flex items-center gap-2.5 rounded-md px-4 py-3 mb-6 border text-sm font-semibold ${msg.ok ? "bg-mist border-border text-green" : "bg-[#FDEDED] border-[#F3C6C6] text-[#C62828]"}`}>
          {msg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {msg.text}
        </div>
      )}

      <Section title="Site identity" hint="Shown in the header, footer, browser tab and when your site is shared.">
        {text("site.name", "Farm name", { max: 80 })}
        {text("site.tagline", "Tagline", { max: 120 })}
        <div className="grid sm:grid-cols-2 gap-6">
          <ImageField label="Logo" shape="square" hint="Square works best. JPG, PNG or WebP." value={v["site.logo"] ?? ""} urlFor={urlFor} onChoose={() => setPicking("site.logo")} onClear={() => setV((p) => ({ ...p, "site.logo": "" }))} />
          <ImageField label="Favicon (browser tab icon)" shape="square" hint="A small square image, ideally 64×64 or larger. PNG or ICO." value={v["site.favicon"] ?? ""} urlFor={urlFor} onChoose={() => setPicking("site.favicon")} onClear={() => setV((p) => ({ ...p, "site.favicon": "" }))} />
        </div>
        {(["site.logo", "site.favicon", "site.og_image"] as const).map((k) => <input key={k} type="hidden" name={k} value={v[k] ?? ""} />)}
      </Section>

      <Section title="Announcement" hint="The thin bar at the very top of every page. Leave a field empty to hide it.">
        {text("site.announcement", "Announcement bar", { max: 160, placeholder: "e.g. Harvest notice — mango season now underway" })}
        {text("site.delivery_note", "Delivery note", { max: 160, placeholder: "e.g. Delivering across the Eastern Region, Ghana" })}
      </Section>

      <Section title="Contact details" hint="Shown in the footer and on the Contact page.">
        <div className="grid sm:grid-cols-2 gap-4.5">{text("contact.phone", "Phone", { max: 40 })}{text("contact.email", "Email", { max: 120, type: "email" })}</div>
        {text("contact.address", "Address", { max: 200 })}
        {text("contact.hours", "Business hours", { max: 120 })}
        {text("site.footer_blurb", "Footer description", { textarea: true, max: 400 })}
      </Section>

      <Section title="Social links" hint="Full links starting with https://. Leave empty to hide the icon.">
        {text("social.facebook", "Facebook", { max: 300, placeholder: "https://facebook.com/yourfarm" })}
        {text("social.instagram", "Instagram", { max: 300, placeholder: "https://instagram.com/yourfarm" })}
        {text("social.twitter", "X / Twitter", { max: 300, placeholder: "https://x.com/yourfarm" })}
      </Section>

      <Section title="Search & sharing" hint="How the site appears in Google and when a link is shared on WhatsApp, Facebook or X.">
        {text("site.seo_description", "Description", { textarea: true, max: 300 })}
        <ImageField label="Share image" shape="wide" hint="Shown in link previews. Wide images (1200×630) look best. Falls back to your logo." value={v["site.og_image"] ?? ""} urlFor={urlFor} onChoose={() => setPicking("site.og_image")} onClear={() => setV((p) => ({ ...p, "site.og_image": "" }))} />
      </Section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-solid disabled:opacity-60">
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save settings
        </button>
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-green"><ExternalLink size={14} /> View site</a>
      </div>

      <MediaPicker
        open={picking !== null}
        onClose={() => setPicking(null)}
        farmId={farmId}
        images={images}
        title={picking === "site.favicon" ? "Choose a favicon" : picking === "site.og_image" ? "Choose a share image" : "Choose a logo"}
        onPick={(img) => { if (picking) setV((p) => ({ ...p, [picking]: img.path })); }}
      />
    </form>
  );
}
