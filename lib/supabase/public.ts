import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Cookie-less, always-anonymous client for the PUBLIC website.
//
// Public pages must not use the cookie-based server client: a signed-in
// staff member would otherwise see their own drafts mixed into the public
// journal, and reading cookies() forces every public page to be dynamic.
// This client never carries a session, so it sees exactly what an anonymous
// visitor sees -- which is exactly what Row Level Security allows, and no more.
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );
}
