"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  UserCheck,
  Stethoscope,
  ClipboardList,
  Megaphone,
  BellRing,
  ArrowRight,
} from "lucide-react";
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
import { formatDate, formatTime } from "@/lib/utils";
import type {
  ResultWithExam,
  AttendanceRecord,
  ClinicalRotation,
  RotationHour,
  Notice,
  Reminder,
  TimetableEntry,
} from "@/lib/types";

export default function DashboardPage() {
  const { t } = useLang();
  const profile = useProfile();
  const supabase = createClient();

  const { data, loading } = useAsync(async () => {
    const now = new Date().toISOString().slice(0, 10);
    const todayIdx = (new Date().getDay() + 6) % 7;

    const [
      resultsRes,
      attendanceRes,
      rotationsRes,
      noticesRes,
      remindersRes,
      timetableRes,
      casesRes,
    ] = await Promise.all([
      supabase
        .from("results")
        .select("*, exam:exams(*, course:courses(*))")
        .eq("student_id", profile.id)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("attendance")
        .select("*")
        .eq("student_id", profile.id)
        .gte("date", now),
      supabase
        .from("clinical_rotations")
        .select("*")
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("notices")
        .select("*")
        .in("audience", ["all", "students"])
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("reminders")
        .select("*")
        .eq("student_id", profile.id)
        .eq("done", false)
        .order("due_date", { ascending: true })
        .limit(5),
      supabase
        .from("timetable_entries")
        .select("*")
        .eq("day_of_week", todayIdx)
        .order("start_time", { ascending: true }),
      supabase
        .from("case_logs")
        .select("id", { count: "exact" })
        .eq("student_id", profile.id),
    ]);

    const rotations = (rotationsRes.data ?? []) as ClinicalRotation[];
    const rotationIds = rotations.map((r) => r.id);
    let rotationHours: RotationHour[] = [];
    if (rotationIds.length > 0) {
      const hoursRes = await supabase
        .from("rotation_hours")
        .select("*")
        .in("rotation_id", rotationIds);
      rotationHours = (hoursRes.data ?? []) as RotationHour[];
    }

    return {
      results: (resultsRes.data ?? []) as ResultWithExam[],
      attendance: (attendanceRes.data ?? []) as AttendanceRecord[],
      rotations,
      rotationHours,
      notices: (noticesRes.data ?? []) as Notice[],
      reminders: (remindersRes.data ?? []) as Reminder[],
      timetable: (timetableRes.data ?? []) as TimetableEntry[],
      caseCount: casesRes.count ?? 0,
    };
  }, []);

  const stats = useMemo(() => {
    if (!data) return null;
    const scores = data.results.map((r) => Number(r.score));
    const gpa = scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length / 100) * 4
      : 0;
    const present = data.attendance.filter((a) => a.status === "present" || a.status === "late").length;
    const attendanceRate = data.attendance.length
      ? Math.round((present / data.attendance.length) * 100)
      : 0;
    const totalHours = data.rotationHours.reduce((a, h) => a + Number(h.hours), 0);
    const activeRotation = data.rotations.find((r) => r.status === "active");
    return { gpa, attendanceRate, totalHours, activeRotation };
  }, [data]);

  if (loading) return <PageLoader />;

  const firstName = profile.full_name.split(" ")[0] || "";

  return (
    <div>
      <PageHeader
        title={`${t("dashboard.subtitle")}, ${firstName}`}
        subtitle={formatDate(new Date())}
      />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label={t("dashboard.yourGPA")}
            value={stats.gpa.toFixed(2)}
            icon={<GraduationCap className="h-5 w-5" />}
          />
          <StatCard
            label={t("dashboard.attendanceRate")}
            value={`${stats.attendanceRate}%`}
            icon={<UserCheck className="h-5 w-5" />}
          />
          <StatCard
            label={t("dashboard.totalClinicalHours")}
            value={stats.totalHours.toFixed(0)}
            icon={<Stethoscope className="h-5 w-5" />}
          />
          <StatCard
            label={t("dashboard.caseLogs")}
            value={data?.caseCount ?? 0}
            icon={<ClipboardList className="h-5 w-5" />}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mt-5">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.todaySchedule")}</CardTitle>
            <Link href="/timetable" className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
              {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {data && data.timetable.length > 0 ? (
              data.timetable.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50"
                >
                  <div className="h-10 w-12 shrink-0 rounded-lg bg-emerald-100 text-emerald-700 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold leading-none">
                      {formatTime(entry.start_time)}
                    </span>
                    <span className="text-[8px] opacity-70">
                      {formatTime(entry.end_time)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {entry.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {entry.location || t("common.notSet")}
                    </p>
                  </div>
                  <Badge variant="blue">{t(`timetable.typeLabel.${entry.type}`)}</Badge>
                </div>
              ))
            ) : (
              <EmptyState title={t("timetable.noClasses")} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.latestNotices")}</CardTitle>
            <Link href="/notices" className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
              {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {data && data.notices.length > 0 ? (
              data.notices.slice(0, 4).map((n) => (
                <div key={n.id} className="flex gap-3 p-2.5 rounded-xl bg-slate-50">
                  <Megaphone className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                    <p className="text-xs text-slate-400 truncate">{formatDate(n.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title={t("notices.noNotices")} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentResults")}</CardTitle>
            <Link href="/grades" className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
              {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {data && data.results.length > 0 ? (
              data.results.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {r.exam.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(r.exam.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      {r.score}/{r.exam.max_score}
                    </span>
                    <Badge variant={Number(r.score) >= 50 ? "green" : "red"}>
                      {r.grade}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title={t("grades.noResults")} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.reminders")}</CardTitle>
            <Link href="/reminders" className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
              {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {data && data.reminders.length > 0 ? (
              data.reminders.map((r) => {
                const overdue = new Date(r.due_date) < new Date();
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50"
                  >
                    <BellRing className="h-4 w-4 text-amber-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {r.title}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(r.due_date)}</p>
                    </div>
                    {overdue && <Badge variant="red">{t("reminders.overdue")}</Badge>}
                  </div>
                );
              })
            ) : (
              <EmptyState title={t("dashboard.noReminders")} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
