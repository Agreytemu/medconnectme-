import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";
import { isDemoMode, DEMO_COOKIE } from "@/lib/demo/config";
import { decodeDemoProfile } from "@/lib/demo/session";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    const profile = decodeDemoProfile(cookieStore.get(DEMO_COOKIE)?.value);
    if (!profile) {
      redirect("/login");
    }
    return <DashboardShell profile={profile}>{children}</DashboardShell>;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <DashboardShell profile={profile as Profile}>
      {children}
    </DashboardShell>
  );
}
