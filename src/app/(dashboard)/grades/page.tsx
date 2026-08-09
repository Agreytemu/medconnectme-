"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { GraduationCap, ClipboardCheck, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { ResultWithExam } from "@/lib/types";

export default function GradesPage() {
  const { t } = useLang();
  const profile = useProfile();
  const supabase = createClient();

  const { data: results, loading } = useAsync(async () => {
    const { data } = await supabase
      .from("results")
      .select("*, exam:exams(*, course:courses(*))")
      .eq("student_id", profile.id)
      .eq("published", true)
      .order("exam(date)", { ascending: true });
    return (data ?? []) as ResultWithExam[];
  }, []);

  const stats = useMemo(() => {
    if (!results) return null;
    const scores = results.map((r) => Number(r.score));
    const gpa = scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length / 100) * 4
      : 0;
    const passed = scores.filter((s) => s >= 50).length;
    return {
      gpa,
      passed,
      failed: scores.length - passed,
      avg: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      chartData: results.map((r) => ({
        name: r.exam.title.length > 18 ? r.exam.title.slice(0, 18) + "…" : r.exam.title,
        score: Number(r.score),
      })),
    };
  }, [results]);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title={t("grades.title")} subtitle={t("grades.subtitle")} />

      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label={t("grades.overallGPA")}
              value={stats.gpa.toFixed(2)}
              icon={<GraduationCap className="h-5 w-5" />}
            />
            <StatCard label={t("grades.totalExams")} value={results?.length ?? 0} icon={<ClipboardCheck className="h-5 w-5" />} />
            <StatCard label={t("grades.passed")} value={stats.passed} icon={<CheckCircle2 className="h-5 w-5" />} />
            <StatCard label={t("grades.failed")} value={stats.failed} icon={<XCircle className="h-5 w-5" />} />
          </div>

          {stats.chartData.length > 1 && (
            <Card className="mt-5">
              <CardHeader>
                <CardTitle>{t("grades.performanceChart")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>{t("grades.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {results && results.length > 0 ? (
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 font-medium">{t("grades.examName")}</th>
                    <th className="py-2.5 font-medium">{t("grades.course")}</th>
                    <th className="py-2.5 font-medium">{t("grades.assessmentType")}</th>
                    <th className="py-2.5 font-medium text-right">{t("grades.score")}</th>
                    <th className="py-2.5 font-medium text-center">{t("grades.grade")}</th>
                    <th className="py-2.5 font-medium">{t("grades.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-800">{r.exam.title}</td>
                      <td className="py-3 text-slate-500">{r.exam.course?.name ?? "-"}</td>
                      <td className="py-3">
                        <Badge variant="blue">{t(`grades.examType.${r.exam.type}`)}</Badge>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-800">
                        {r.score}/{r.exam.max_score}
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={Number(r.score) >= 50 ? "green" : "red"}>{r.grade}</Badge>
                      </td>
                      <td className="py-3 text-slate-500">{formatDate(r.exam.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title={t("grades.noResults")} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
