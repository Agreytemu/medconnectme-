import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "green"
  | "red"
  | "amber"
  | "blue"
  | "slate"
  | "sky"
  | "purple";

const badgeColors: Record<BadgeVariant, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
};

export function Badge({
  children,
  variant = "slate",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        badgeColors[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusBadge(
  status: string,
  t?: (k: string) => string
): { variant: BadgeVariant; label: string } {
  const key = `status.${status}`;
  const label = t ? t(key) : status;
  switch (status) {
    case "present":
    case "paid":
    case "completed":
    case "approved":
    case "sent":
    case "active":
    case "published":
      return { variant: "green", label };
    case "absent":
    case "failed":
    case "unpaid":
    case "draft":
    case "unpublished":
    case "overdue":
      return { variant: "red", label };
    case "late":
    case "partial":
    case "pending":
    case "submitted":
    case "upcoming":
      return { variant: "amber", label };
    default:
      return { variant: "slate", label: t ? t(`nav.${status}`) : status };
  }
}
