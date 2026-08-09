"use client";

import { useMemo, useState } from "react";
import { UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { AttendanceRecord } from "@/lib/types";

export default function AttendancePage() {
  const { t } = useLang();
  const profile = useProfile();
  const supabase = createClient();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: records, loading } = useAsync(async () => {
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", profile.id)
      .like("date", `${month}%`)
      .order("date", { ascending: false });
    return (data ?? []) as AttendanceRecord[];
  }, [month]);

  const stats = useMemo(() => {
    if (!records) return null;
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const leave = records.filter((r) => r.status === "leave").length;
    const rate = total ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, absent, late, leave, rate };
  }, [records]);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("attendance.title")}
        subtitle={t("attendance.subtitle")}
        action={
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-9 px-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-700"
          />
        }
      />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard label={t("attendance.rate")} value={`${stats.rate}%`} icon={<UserCheck className="h-5 w-5" />} />
          <StatCard label={t("attendance.present")} value={stats.present} />
          <StatCard label={t("attendance.absent")} value={stats.absent} />
          <StatCard label={t("attendance.late")} value={stats.late} />
          <StatCard label={t("attendance.leave")} value={stats.leave} />
        </div>
      )}

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>{t("attendance.monthlySummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          {records && records.length > 0 ? (
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 font-medium">{t("attendance.date")}</th>
                    <th className="py-2.5 font-medium">{t("attendance.course")}</th>
                    <th className="py-2.5 font-medium">{t("attendance.statusLabel")}</th>
                    <th className="py-2.5 font-medium">{t("attendance.lecture")}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => {
                    const badge = statusBadge(r.status, () => t(`attendance.status.${r.status}`));
                    return (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 text-slate-600">{formatDate(r.date)}</td>
                        <td className="py-3 font-medium text-slate-800">{r.course_id ? r.course_id : "-"}</td>
                        <td className="py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="py-3 text-slate-500">{r.lecturer ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title={t("attendance.noRecords")} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
