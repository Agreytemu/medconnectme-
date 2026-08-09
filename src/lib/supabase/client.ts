import { createBrowserClient } from "@supabase/ssr";
import { isDemoMode } from "@/lib/demo/config";
import { createMockClient } from "@/lib/demo/mock-client";

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (cachedClient) return cachedClient;

  if (isDemoMode()) {
    cachedClient = createMockClient() as unknown as ReturnType<
      typeof createBrowserClient
    >;
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes("your-project-ref")) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  cachedClient = createBrowserClient(url, anonKey);
  return cachedClient;
}
