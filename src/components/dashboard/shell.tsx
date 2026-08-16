"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearDemoCookie } from "@/lib/demo/session";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { TopBar } from "./top-bar";
import { ProfileProvider, useProfile } from "@/lib/profile-context";
import type { Profile } from "@/lib/types";
import { PageLoader } from "@/components/ui/loader";

function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const profile = useProfile();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    clearDemoCookie();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role={profile.role} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl w-full mx-auto lg:p-6 px-4 pb-24 lg:pb-6 pt-4">
            {loggingOut ? <PageLoader /> : children}
          </div>
        </main>
      </div>
      <BottomNav role={profile.role} />
    </div>
  );
}

export function DashboardShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider profile={profile}>
      <Shell>{children}</Shell>
    </ProfileProvider>
  );
}
