"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { LanguageToggle } from "./language-toggle";
import { useProfile } from "@/lib/profile-context";
import { initials } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

export function TopBar() {
  const profile = useProfile();

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 shrink-0 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
          {initials(profile.full_name || "M")}
        </div>
        <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
          {profile.full_name}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Link
          href="/notices"
          className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Link>
        <LanguageToggle />
        <Logo className="h-5 w-5 rounded-md" />
      </div>
    </header>
  );
}
