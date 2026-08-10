"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { getNav, type NavItem } from "./nav-items";
import { useLang } from "@/lib/i18n/LanguageContext";
import { HubSheet } from "./hub-sheet";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const fixedByRole: Record<Role, string[]> = {
  student: ["/dashboard", "/timetable", "/id-card", "/profile"],
  admin: ["/admin", "/admin/students", "/admin/timetable", "/profile"],
};

function BottomLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const { t } = useLang();
  const active =
    pathname === item.href ||
    (item.href !== "/dashboard" &&
      item.href !== "/admin" &&
      pathname.startsWith(item.href));
  const Icon = item.icon;
  return (
    <Link
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
}

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const { t } = useLang();
  const [hubOpen, setHubOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setHubOpen(false);
  }

  const nav = getNav(role);
  const fixed = fixedByRole[role]
    .map((href) => nav.find((n) => n.href === href))
    .filter((n): n is NavItem => Boolean(n));

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {fixed.map((item) => (
            <BottomLink key={item.href} item={item} />
          ))}
          <button
            type="button"
            onClick={() => setHubOpen(true)}
            className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-slate-400 transition-colors"
            aria-label="Open hub"
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="truncate max-w-full px-1">{t("nav.more")}</span>
          </button>
        </div>
      </nav>
      <HubSheet role={role} open={hubOpen} onClose={() => setHubOpen(false)} />
    </>
  );
}
