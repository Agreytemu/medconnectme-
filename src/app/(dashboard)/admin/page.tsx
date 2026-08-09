"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Users,
  BookOpenCheck,
  Wallet,
  UserCheck,
  History,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { AdminOnly } from "@/components/admin/admin-only";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { ActivityLog } from "@/lib/types";

export default function AdminDashboardPage() {
  const { t } = useLang();
  const supabase = createClient();

  const { data, loading } = useAsync(async () => {
    const [studentsRes, examsRes, paymentsRes, attendanceRes, activityRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact" }).eq("role", "student"),
      supabase.from("exams").select("id", { count: "exact" }),
      supabase.from("payments").select("paid_amount, amount"),
      supabase.from("attendance").select("status"),
      supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const income = (paymentsRes.data ?? []).reduce(
      (a: number, p: { paid_amount: number }) => a + Number(p.paid_amount),
      0
    );
    const attendance = (attendanceRes.data ?? []) as { status: string }[];
    const present = attendance.filter(
      (a) => a.status === "present" || a.status === "late"
    ).length;
    const avgAttendance = attendance.length
      ? Math.round((present / attendance.length) * 100)
      : 0;

    return {
      students: studentsRes.count ?? 0,
      exams: examsRes.count ?? 0,
      income,
      avgAttendance,
      activity: (activityRes.data ?? []) as ActivityLog[],
    };
  }, []);

  const quickLinks = useMemo(
    () => [
      { href: "/admin/students", label: t("admin.studentList"), icon: Users },
      { href: "/admin/exams", label: t("admin.addExam"), icon: BookOpenCheck },
      { href: "/admin/payments", label: t("admin.addPayment"), icon: Wallet },
      { href: "/admin/reports", label: t("admin.reports"), icon: History },
    ],
    [t]
  );

  if (loading) return <PageLoader />;

  return (
    <AdminOnly>
      <PageHeader title={t("admin.title")} subtitle={t("admin.subtitle")} />

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label={t("admin.totalStudents")} value={data.students} icon={<Users className="h-5 w-5" />} />
            <StatCard label={t("admin.totalExams")} value={data.exams} icon={<BookOpenCheck className="h-5 w-5" />} />
            <StatCard label={t("admin.totalIncome")} value={data.income.toLocaleString()} icon={<Wallet className="h-5 w-5" />} />
            <StatCard label={t("admin.avgAttendance")} value={`${data.avgAttendance}%`} icon={<UserCheck className="h-5 w-5" />} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            {quickLinks.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.href}
                  href={q.href}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-colors"
                >
                  <span className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-700">
                    <span className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </span>
                    {q.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                </Link>
              );
            })}
          </div>

          <Card className="mt-5">
            <CardHeader>
              <CardTitle>{t("admin.recentActivity")}</CardTitle>
              <Link href="/admin/activity" className="text-xs text-emerald-600 font-medium">
                {t("common.viewAll")}
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.activity.length > 0 ? (
                data.activity.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                      {(a.user_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 truncate">
                        <b>{a.user_name ?? "System"}</b> {a.action} {a.entity}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(a.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title={t("admin.noActivity")} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AdminOnly>
  );
}
