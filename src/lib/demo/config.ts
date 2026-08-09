export const DEMO_COOKIE = "medconnectme_demo";
export const DEMO_SESSION_STORAGE = "medconnectme_demo_session";

export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project-ref") || key.includes("your-anon-key")) {
    return true;
  }
  return false;
}

export interface DemoCredentials {
  student: { email: string; password: string };
  admin: { email: string; password: string };
}

export function demoCredentials(): DemoCredentials {
  return {
    student: {
      email: process.env.NEXT_PUBLIC_DEMO_STUDENT_EMAIL ?? "student@med.local",
      password: process.env.NEXT_PUBLIC_DEMO_STUDENT_PASSWORD ?? "student123",
    },
    admin: {
      email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "admin@med.local",
      password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? "admin123",
    },
  };
}
