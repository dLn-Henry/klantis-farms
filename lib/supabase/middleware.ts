import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Apply to the incoming request first so the same middleware
          // invocation sees the refreshed session if it reads cookies again.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Rebuild the response once against the updated request, then
          // write every cookie onto that single response. Doing this in one
          // pass (rather than per cookie) avoids overwriting earlier cookies
          // when Supabase sets more than one (e.g. on token refresh).
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const toLogin = () => NextResponse.redirect(new URL("/login", request.url));
  const to = (dest: string) => {
    const r = NextResponse.redirect(new URL(dest, request.url));
    // keep any refreshed session cookies on the redirect
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  // Everyone has one login. Where they land depends on who they are:
  //   farm members (active)  -> /dashboard  (the farm workspace)
  //   everyone else          -> /account    (the customer workspace)
  // Customers never reach the farm dashboard. (The database also gives them
  // no farm data -- this is the front door, not the lock.)
  if (!user && (path.startsWith("/dashboard") || path.startsWith("/account"))) return toLogin();

  const needsWorkspace = user && (path.startsWith("/dashboard") || path === "/login" || path === "/register");
  if (needsWorkspace) {
    const { data: membership } = await supabase
      .from("farm_members").select("id").eq("user_id", user.id).eq("status", "active").limit(1);
    const isMember = (membership ?? []).length > 0;
    if (path.startsWith("/dashboard") && !isMember) return to("/account");
    if ((path === "/login" || path === "/register")) return to(isMember ? "/dashboard" : "/account");
  }

  return response;
}
