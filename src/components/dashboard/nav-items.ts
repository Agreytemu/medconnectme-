import {
  LayoutDashboard,
  GraduationCap,
  BookOpenCheck,
  CalendarDays,
  UserCheck,
  Stethoscope,
  ClipboardList,
  FolderOpen,
  Pill,
  Megaphone,
  BellRing,
  Wallet,
  CreditCard,
  User,
  Users,
  ChartPie,
  History,
  MessagesSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

export const studentNav: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/timetable", labelKey: "nav.timetable", icon: CalendarDays },
  { href: "/grades", labelKey: "nav.grades", icon: GraduationCap },
  { href: "/attendance", labelKey: "nav.attendance", icon: UserCheck },
  { href: "/rotations", labelKey: "nav.rotations", icon: Stethoscope },
  { href: "/case-logs", labelKey: "nav.caseLogs", icon: ClipboardList },
  { href: "/materials", labelKey: "nav.materials", icon: FolderOpen },
  { href: "/formulary", labelKey: "nav.formulary", icon: Pill },
  { href: "/notices", labelKey: "nav.notices", icon: Megaphone },
  { href: "/reminders", labelKey: "nav.reminders", icon: BellRing },
  { href: "/payments", labelKey: "nav.payments", icon: Wallet },
  { href: "/id-card", labelKey: "nav.idCard", icon: CreditCard },
  { href: "/profile", labelKey: "nav.profile", icon: User },
];

export const adminNav: NavItem[] = [
  { href: "/admin", labelKey: "nav.admin", icon: LayoutDashboard },
  { href: "/admin/students", labelKey: "nav.students", icon: Users },
  { href: "/admin/exams", labelKey: "nav.exams", icon: BookOpenCheck },
  { href: "/admin/results", labelKey: "nav.results", icon: GraduationCap },
  { href: "/admin/timetable", labelKey: "nav.timetable", icon: CalendarDays },
  { href: "/admin/rotations", labelKey: "nav.rotations", icon: Stethoscope },
  { href: "/admin/materials", labelKey: "nav.materials", icon: FolderOpen },
  { href: "/admin/notices", labelKey: "nav.notices", icon: Megaphone },
  { href: "/admin/payments", labelKey: "nav.payments", icon: Wallet },
  { href: "/admin/sms", labelKey: "nav.sms", icon: MessagesSquare },
  { href: "/admin/reports", labelKey: "nav.reports", icon: ChartPie },
  { href: "/admin/activity", labelKey: "nav.activity", icon: History },
  { href: "/profile", labelKey: "nav.profile", icon: User },
];

export function getNav(role: Role): NavItem[] {
  return role === "admin" ? adminNav : studentNav;
}

export { Settings };
