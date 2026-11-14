"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Trash2, FileText, Loader2, Lock } from "lucide-react";
import { deleteMedia, updateMediaAlt } from "@/lib/actions/media";
import { formatBytes } from "@/lib/media/constants";
import type { MediaItem } from "@/lib/data/repositories/media";

function MediaCard({ item }: { item: MediaItem }) {
  const router = useRouter();
  const [alt, setAlt] = useState(item.altText);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const isImage = item.mimeType.startsWith("image/");
  const dirty = alt.trim() !== item.altText;

  function saveAlt() {
    setMsg(null);
    start(async () => {
      const r = await updateMediaAlt(item.id, alt);
      setMsg(r.success ? { ok: true, text: "Saved" } : { ok: false, text: r.error });
      if (r.success) router.refresh();
    });
  }

  function remove() {
    if (!window.confirm(`Delete "${item.fileName}"? Pages that use it will lose the image.`)) return;
    setMsg(null);
    start(async () => {
      const r = await deleteMedia(item.id);
      if (!r.success) setMsg({ ok: false, text: r.error });
      else router.refresh();
    });
  }

  async function copy() {
    if (!item.url) return;
    await navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-white border border-border rounded-md overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-surface flex items-center justify-center overflow-hidden">
        {isImage && item.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.altText || item.fileName} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <FileText size={34} className="stroke-ink-soft" />
        )}
      </div>
      <div className="p-3.5 flex flex-col gap-2.5 flex-1">
        <div>
          <p className="text-[13px] font-bold truncate" title={item.fileName}>{item.fileName}</p>
          <p className="text-[11.5px] text-ink-soft">
            {formatBytes(item.sizeBytes)} · {item.uploadedBy} · {new Date(item.createdAt).toLocaleDateString("en-GB")}
          </p>
        </div>

        <div>
          <label htmlFor={`alt-${item.id}`} className="text-[11px] font-bold block mb-1">
            Alt text <span className="font-normal text-ink-soft">(for screen readers &amp; SEO)</span>
          </label>
          <input
            id={`alt-${item.id}`}
            value={alt}
            maxLength={300}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full border border-border rounded-md px-2.5 py-2 text-xs focus:outline-none focus:border-green"
            placeholder="Describe the image"
          />
        </div>

        {msg && (
          <p className={`text-[11.5px] font-semibold ${msg.ok ? "text-[#2E7D32]" : "text-[#C62828]"}`}>{msg.text}</p>
        )}

        <div className="flex items-center gap-2 mt-auto pt-1">
          {dirty && (
            <button onClick={saveAlt} disabled={pending} className="btn-solid !py-1.5 !px-3 !text-xs">
              {pending ? <Loader2 size={12} className="animate-spin" /> : "Save"}
            </button>
          )}
          {item.bucket === "site-media" && (
            <button onClick={copy} className="btn-outline !py-1.5 !px-3 !text-xs" title="Copy the image address">
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy URL"}
            </button>
          )}
          <button
            onClick={remove}
            disabled={pending}
            aria-label={`Delete ${item.fileName}`}
            className="ml-auto text-[#C62828] hover:bg-[#FDEDED] rounded-md p-2"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MediaLibrary({ items, emptyText }: { items: MediaItem[]; emptyText: string }) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-border rounded-md p-8 text-center">
        <p className="text-sm font-semibold text-ink-soft">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((m) => <MediaCard key={m.id} item={m} />)}
    </div>
  );
}

export function PrivateNote() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-ink-soft">
      <Lock size={12} /> Only farm members can see these. Links expire after an hour.
    </p>
  );
}
