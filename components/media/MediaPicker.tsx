"use client";

import { useEffect, useRef, useState } from "react";
import { X, ImageIcon, Check } from "lucide-react";
import { MediaUploader } from "@/components/media/MediaUploader";

export type PickerImage = { id: string; path: string; url: string; alt: string; name: string };

// A modal to choose a picture from the farm's PUBLIC media library, or upload a
// new one on the spot. Used by site settings (logo, favicon, share image) and
// the blog editor (featured + inline images). Only Owner/Manager can open the
// library at all -- the media rules (0019) decide that, not this component.
export function MediaPicker({
  open, onClose, onPick, images, farmId, title = "Choose an image",
}: {
  open: boolean; onClose: () => void; onPick: (img: PickerImage) => void;
  images: PickerImage[]; farmId: string; title?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const chosen = images.find((i) => i.id === selected);

  return (
    <dialog ref={ref} onClose={onClose} onCancel={onClose} className="rounded-lg p-0 w-[min(860px,94vw)] backdrop:bg-black/50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-base font-extrabold">{title}</h3>
        <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 hover:bg-surface rounded-md"><X size={18} /></button>
      </div>

      <div className="p-5 max-h-[60vh] overflow-y-auto">
        <div className="mb-5"><MediaUploader farmId={farmId} bucket="site-media" label="Upload a new image" /></div>
        {images.length === 0 ? (
          <p className="text-sm text-ink-soft py-8 text-center"><ImageIcon className="inline mr-1.5" size={15} /> No images yet. Upload one above, then reopen this window.</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" role="listbox" aria-label="Images">
            {images.map((i) => (
              <li key={i.id}>
                <button
                  type="button" role="option" aria-selected={selected === i.id}
                  onClick={() => setSelected(i.id)}
                  className={`relative block w-full aspect-square rounded-md overflow-hidden border-2 ${selected === i.id ? "border-green" : "border-border hover:border-ink-soft"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.url} alt={i.alt || i.name} loading="lazy" className="w-full h-full object-cover" />
                  {selected === i.id && <span className="absolute top-1.5 right-1.5 bg-green text-white rounded-full p-1"><Check size={12} /></span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
        <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        <button type="button" disabled={!chosen} onClick={() => { if (chosen) { onPick(chosen); setSelected(null); onClose(); } }} className="btn-solid disabled:opacity-60">Use this image</button>
      </div>
    </dialog>
  );
}
