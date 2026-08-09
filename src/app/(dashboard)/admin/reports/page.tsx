"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ChartPie, Wallet, UserCheck, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { AdminOnly } from "@/components/admin/admin-only";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { Payment, AttendanceRecord, Result } from "@/lib/types";

const COLORS = ["#059669", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminReportsPage() {
  const { t } = useLang();
  const supabase = createClient();

  const { data, loading } = useAsync(async () => {
    const [paymentsRes, attendanceRes, resultsRes, studentsRes] = await Promise.all([
      supabase.from("payments").select("fee_type, paid_amount, date_paid"),
      supabase.from("attendance").select("status, course_id"),
      supabase.from("results").select("score, exam:exams(*, course:courses(*))"),
      supabase.from("profiles").select("id", { count: "exact" }).eq("role", "student"),
    ]);

    const payments = (paymentsRes.data ?? []) as Payment[];
    const attendance = (attendanceRes.data ?? []) as AttendanceRecord[];
    const results = (resultsRes.data ?? []) as unknown as (Result & {
      exam: { course?: { name: string } | null };
    })[];

    const totalCollected = payments.reduce((a, p) => a + Number(p.paid_amount), 0);
    const present = attendance.filter((a) => a.status === "present" || a.status === "late").length;
    const avgAttendance = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

    const passRate = results.length
      ? Math.round((results.filter((r) => Number(r.score) >= 50).length / results.length) * 100)
      : 0;

    const gradeDist = ["A", "B+", "B", "C", "D", "F"].map((g) => ({
      name: g,
      count: results.filter((r) => r.grade === g).length,
    }));

    const incomeByType = Object.values(
      payments.reduce<Record<string, number>>((acc, p) => {
        acc[p.fee_type] = (acc[p.fee_type] ?? 0) + Number(p.paid_amount);
        return acc;
      }, {})
    ).map((value, i) => ({
      name: Object.keys(
        payments.reduce<Record<string, number>>((acc, p) => {
          acc[p.fee_type] = (acc[p.fee_type] ?? 0) + Number(p.paid_amount);
          return acc;
        }, {})
      )[i] ?? "Fee",
      value: Number(value.toFixed(0)),
    }));

    const monthlyIncome = [
      { month: "Jul", value: 0 },
      { month: "Aug", value: 0 },
      { month: "Sep", value: 0 },
      { month: "Oct", value: 0 },
      { month: "Nov", value: 0 },
      { month: "Dec", value: 0 },
    ];
    payments.forEach((p) => {
      if (!p.date_paid) return;
      const d = new Date(p.date_paid);
      const idx = monthlyIncome.findIndex((m) => m.month === d.toLocaleString("en", { month: "short" }));
      if (idx >= 0) monthlyIncome[idx].value += Number(p.paid_amount);
    });

    return {
      totalCollected,
      avgAttendance,
      passRate,
      students: studentsRes.count ?? 0,
      gradeDist,
      incomeByType,
      monthlyIncome,
    };
  }, []);

  if (loading) return <PageLoader />;

  return (
    <AdminOnly>
      <PageHeader title={t("reports.title")} subtitle={t("reports.subtitle")} />

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label={t("reports.totalCollected")} value={data.totalCollected.toLocaleString()} icon={<Wallet className="h-5 w-5" />} />
            <StatCard label={t("reports.averageAttendance")} value={`${data.avgAttendance}%`} icon={<UserCheck className="h-5 w-5" />} />
            <StatCard label={t("reports.passRate")} value={`${data.passRate}%`} icon={<GraduationCap className="h-5 w-5" />} />
            <StatCard label={t("reports.totalStudents")} value={data.students} icon={<ChartPie className="h-5 w-5" />} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mt-5">
            <Card>
              <CardHeader>
                <CardTitle>{t("reports.monthlyIncome")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyIncome} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("reports.gradeDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.gradeDist}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name }) => name}
                      >
                        {data.gradeDist.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <p className="text-xs text-slate-400 mt-4">
        {t("common.noData")} — {formatDate(new Date())}
      </p>
    </AdminOnly>
  );
}
