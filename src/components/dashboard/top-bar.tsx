"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { LanguageToggle } from "./language-toggle";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";
import { initials } from "@/lib/utils";

export function TopBar() {
  const { t } = useLang();
  const profile = useProfile();

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
          {initials(profile.full_name || "M")}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
            {profile.full_name}
          </p>
          <p className="text-[10px] text-slate-400 leading-tight">
            {t("appName")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/notices"
          className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500"
        >
          <Bell className="h-5 w-5" />
        </Link>
        <LanguageToggle />
      </div>
    </header>
  );
}
