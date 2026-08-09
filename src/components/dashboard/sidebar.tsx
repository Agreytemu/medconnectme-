"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, HeartPulse } from "lucide-react";
import { getNav } from "./nav-items";
import { useLang } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "./language-toggle";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
  onLogout,
}: {
  role: Role;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLang();
  const nav = getNav(role);

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100">
        <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-slate-800 leading-tight">{t("appName")}</p>
          <p className="text-[10px] text-slate-400 leading-tight">
            {role === "admin" ? "Admin" : "Student"}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/admin" &&
              pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

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
