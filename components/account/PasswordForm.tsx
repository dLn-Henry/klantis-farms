"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const input = "w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-green bg-white";
const label = "block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5";

export function PasswordForm() {
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 8) return setMsg({ ok: false, text: "Use at least 8 characters." });
    if (pw !== again) return setMsg({ ok: false, text: "The two passwords don't match." });
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setPw(""); setAgain("");
    setMsg({ ok: true, text: "Password updated." });
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-[420px]">
      {msg && (
        <div className={`flex items-center gap-2.5 rounded-md px-4 py-3 border text-sm font-semibold ${msg.ok ? "bg-mist border-border text-green" : "bg-[#FDEDED] border-[#F3C6C6] text-[#C62828]"}`} role="status">
          {msg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {msg.text}
        </div>
      )}
      <div><label htmlFor="pw" className={label}>New password</label><input id="pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={input} /></div>
      <div><label htmlFor="pw2" className={label}>Repeat new password</label><input id="pw2" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} className={input} /></div>
      <button type="submit" disabled={busy} className="btn-solid disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : "Update password"}</button>
    </form>
  );
}
