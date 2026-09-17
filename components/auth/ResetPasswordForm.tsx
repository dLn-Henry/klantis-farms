"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Supabase reads the recovery token from the URL fragment automatically
    // (handled by the auth client on page load) and exchanges it for a
    // session, so this just needs to update the password on that session.
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm text-ink-soft mb-5">Choose a new password for your account.</p>

      {error && (
        <div className="flex items-center gap-2.5 bg-[#FDECEA] border border-[#F5C6C6] rounded-md px-4 py-3 mb-5">
          <AlertCircle size={16} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

      <div className="mb-6">
        <label className="text-xs font-bold block mb-1.5">New Password</label>
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
            <Loader2 size={15} className="animate-spin" /> Updating...
          </>
        ) : (
          <>
            Update Password <ArrowRight size={15} />
          </>
        )}
      </button>
    </form>
  );
}
