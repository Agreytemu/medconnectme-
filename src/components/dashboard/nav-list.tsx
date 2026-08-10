"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNav } from "./nav-items";
import { useLang } from "@/lib/i18n/LanguageContext";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NavList({ role }: { role: Role }) {
  const pathname = usePathname();
  const { t } = useLang();
  const nav = getNav(role);

  return (
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
  );
}
