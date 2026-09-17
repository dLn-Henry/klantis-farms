"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh(); // re-renders Server Components with the new session
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-mist border border-border rounded-md px-4 py-3 mb-5">
        <p className="text-xs text-ink-soft">
          Sign in with an account created via <Link href="/register" className="font-bold text-green">Register</Link>,
          or one added directly in your Supabase project.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-[#FDECEA] border border-[#F5C6C6] rounded-md px-4 py-3 mb-5">
          <AlertCircle size={16} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

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

      <div className="mb-2">
        <label className="text-xs font-bold block mb-1.5">Password</label>
        <div className="relative">
          <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 stroke-ink-soft" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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

      <div className="text-right mb-6">
        <Link href="/forgot-password" className="text-xs font-semibold text-green">
          Forgot password?
        </Link>
      </div>

      <button type="submit" disabled={loading} className="btn-solid w-full justify-center disabled:opacity-70">
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Logging in...
          </>
        ) : (
          <>
            Log In <ArrowRight size={15} />
          </>
        )}
      </button>

      <p className="text-center text-xs text-ink-soft mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-green">Create one</Link>
      </p>
    </form>
  );
}
