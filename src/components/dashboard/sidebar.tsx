"use client";

import { LogOut } from "lucide-react";
import { NavList } from "./nav-list";
import { useLang } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "./language-toggle";
import type { Role } from "@/lib/types";
import { Logo } from "@/components/ui/logo";

export function Sidebar({
  role,
  onLogout,
}: {
  role: Role;
  onLogout: () => void;
}) {
  const { t } = useLang();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100">
        <Logo className="h-9 w-9 rounded-xl" />
        <div>
          <p className="font-bold text-slate-800 leading-tight">{t("appName")}</p>
          <p className="text-[10px] text-slate-400 leading-tight">
            {role === "admin" ? "Admin" : "Student"}
          </p>
        </div>
      </div>

      <NavList role={role} />

      <div className="p-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between px-1">
          <LanguageToggle />
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-red-600 hover:bg-red-50 text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            {t("nav.logout")}
          </button>
        </div>
      </div>
    </aside>
  );
}
