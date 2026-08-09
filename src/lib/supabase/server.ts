import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isDemoMode, DEMO_COOKIE } from "@/lib/demo/config";
import { createMockClient } from "@/lib/demo/mock-client";
import { decodeDemoProfile } from "@/lib/demo/session";

export async function createClient() {
  const cookieStore = await cookies();

  if (isDemoMode()) {
    const mock = createMockClient({
      readSession: () => {
        const profile = decodeDemoProfile(cookieStore.get(DEMO_COOKIE)?.value);
        if (!profile) return null;
        return {
          access_token: "demo-access-token",
          user: {
            id: profile.id,
            email: profile.email,
            user_metadata: { role: profile.role },
          },
        };
      },
      writeSession: () => {
        // Demo sessions are handled through the demo cookie.
      },
    });
    return mock as unknown as ReturnType<typeof createServerClient>;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
