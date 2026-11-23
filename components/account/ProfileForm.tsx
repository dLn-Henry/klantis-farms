"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { updateProfile } from "@/lib/actions/account";

const input = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const label = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";

export function ProfileForm({ email, firstName, lastName, phone }: { email: string; firstName: string; lastName: string; phone: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form
      action={(fd) => {
        setMsg(null);
        start(async () => {
          const r = await updateProfile(fd);
          setMsg(r.success ? { ok: true, text: "Your details were saved." } : { ok: false, text: r.error });
        });
      }}
      className="space-y-5 max-w-[520px]"
    >
      {msg && (
        <div className={`flex items-center gap-2.5 rounded-md px-4 py-3 border text-sm font-semibold ${msg.ok ? "bg-mist border-border text-green" : "bg-[#FDEDED] border-[#F3C6C6] text-[#C62828]"}`} role="status">
          {msg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {msg.text}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label htmlFor="firstName" className={label}>First name</label><input id="firstName" name="firstName" defaultValue={firstName} required className={input} /></div>
        <div><label htmlFor="lastName" className={label}>Last name</label><input id="lastName" name="lastName" defaultValue={lastName} className={input} /></div>
      </div>
      <div><label htmlFor="email" className={label}>Email</label><input id="email" value={email} disabled className={`${input} bg-surface text-ink-soft`} /></div>
      <div><label htmlFor="phone" className={label}>Phone</label><input id="phone" name="phone" type="tel" defaultValue={phone} placeholder="e.g. 024 000 0000" className={input} /></div>
      <button type="submit" disabled={pending} className="btn-solid disabled:opacity-60">{pending ? <Loader2 size={15} className="animate-spin" /> : "Save changes"}</button>
    </form>
  );
}
