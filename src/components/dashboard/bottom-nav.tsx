"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNav } from "./nav-items";
import { useLang } from "@/lib/i18n/LanguageContext";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const { t } = useLang();
  const nav = getNav(role).slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-emerald-600" : "text-slate-400"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate max-w-full px-1">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
