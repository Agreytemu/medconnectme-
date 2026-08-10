"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNav } from "./nav-items";
import { useLang } from "@/lib/i18n/LanguageContext";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const excludedByRole: Record<Role, string[]> = {
  student: ["/dashboard", "/timetable", "/id-card", "/profile"],
  admin: ["/admin", "/admin/students", "/admin/timetable", "/profile"],
};

export function HubSheet({
  role,
  open,
  onClose,
}: {
  role: Role;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLang();
  const nav = getNav(role).filter((n) => !excludedByRole[role].includes(n.href));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto bg-white rounded-t-3xl p-5 pb-8 shadow-xl">
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-slate-200" />
        <p className="mb-4 text-sm font-semibold text-slate-900">
          {t("nav.more")}
        </p>
        <div className="grid grid-cols-3 gap-3">
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
                  "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors",
                  active
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-100 text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-medium leading-tight">
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
