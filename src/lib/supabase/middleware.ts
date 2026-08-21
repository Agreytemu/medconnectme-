import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode, DEMO_COOKIE } from "@/lib/demo/config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/api");

  let user: { id: string; role?: string } | null = null;
  let demoUser: { id: string; role: string } | null = null;

  if (isDemoMode()) {
    const raw = request.cookies.get(DEMO_COOKIE)?.value;
    if (raw) {
      try {
        const profile = JSON.parse(decodeURIComponent(raw)) as {
          id: string;
          role: string;
        };
        if (profile?.id && profile?.role) {
          demoUser = { id: profile.id, role: profile.role };
        }
      } catch {
        // Ignore malformed demo cookie.
      }
    }
  } else {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    user = supabaseUser as { id: string; role?: string } | null;
  }

  const loggedIn = Boolean(user || demoUser);

  if (!loggedIn && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirected", "true");
    return NextResponse.redirect(url);
  }

  if (loggedIn && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    const url = request.nextUrl.clone();
    if (demoUser?.role === "admin" || user?.role === "admin") {
      url.pathname = "/admin";
    } else if (demoUser?.role === "student") {
      url.pathname = "/dashboard";
    } else {
      url.pathname = "/";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
