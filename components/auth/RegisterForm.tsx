"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-mist flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={26} className="stroke-green" />
        </div>
        <h3 className="text-base font-extrabold mb-1.5">Check your email</h3>
        <p className="text-sm text-ink-soft mb-6">
          We&apos;ve sent a confirmation link to <b>{email}</b>. Confirm your address, then log in.
        </p>
        <Link href="/login" className="link-arrow justify-center">Go to Log In</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="flex items-center gap-2.5 bg-[#FDECEA] border border-[#F5C6C6] rounded-md px-4 py-3 mb-5">
          <AlertCircle size={16} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div className="mb-4.5">
        <label className="text-xs font-bold block mb-1.5">Full Name</label>
        <div className="relative">
          <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 stroke-ink-soft" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full border border-border rounded-lg pl-10 pr-3.5 py-3 text-sm focus:outline-none focus:border-green"
          />
        </div>
      </div>

      <div className="mb-4.5">
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

      <div className="mb-6">
        <label className="text-xs font-bold block mb-1.5">Password</label>
        <div className="relative">
          <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 stroke-ink-soft" />
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full border border-border rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-green"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} className="stroke-ink-soft" /> : <Eye size={17} className="stroke-ink-soft" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-solid w-full justify-center disabled:opacity-70">
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Creating account...
          </>
        ) : (
          <>
            Create Account <ArrowRight size={15} />
          </>
        )}
      </button>

      <p className="text-center text-xs text-ink-soft mt-6">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-green">Log in</Link>
      </p>
    </form>
  );
}
