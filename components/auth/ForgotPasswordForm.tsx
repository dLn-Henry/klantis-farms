"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-mist flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={26} className="stroke-green" />
        </div>
        <h3 className="text-base font-extrabold mb-1.5">Check your email</h3>
        <p className="text-sm text-ink-soft mb-6">
          If an account exists for <b>{email}</b>, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/login" className="link-arrow justify-center">Back to Log In</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm text-ink-soft mb-5">
        Enter the email address linked to your account and we&apos;ll send you a reset link.
      </p>

      {error && (
        <div className="flex items-center gap-2.5 bg-[#FDECEA] border border-[#F5C6C6] rounded-md px-4 py-3 mb-5">
          <AlertCircle size={16} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div className="mb-6">
        <label className="text-xs font-bold block mb-1.5">Email Address</label>
        <div className="relative">
          <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 stroke-ink-soft" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-border rounded-lg pl-10 pr-3.5 py-3 text-sm focus:outline-none focus:border-green"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-solid w-full justify-center disabled:opacity-70">
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Sending...
          </>
        ) : (
          <>
            Send Reset Link <ArrowRight size={15} />
          </>
        )}
      </button>

      <p className="text-center text-xs text-ink-soft mt-6">
        <Link href="/login" className="font-bold text-green">Back to Log In</Link>
      </p>
    </form>
  );
}
