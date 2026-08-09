"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Save, Send, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { AdminOnly } from "@/components/admin/admin-only";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Field } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { getGrade } from "@/lib/utils";
import type { Exam, Profile, Result } from "@/lib/types";

export default function AdminResultsPage() {
  const { t } = useLang();
  const supabase = createClient();
  const [examId, setExamId] = useState("");
  const [scores, setScores] = useState<Record<string, string>>({});

  const { data, loading } = useAsync(async () => {
    const [examsRes, studentsRes] = await Promise.all([
      supabase.from("exams").select("*").order("date", { ascending: false }),
      supabase.from("profiles").select("*").eq("role", "student").order("full_name", { ascending: true }),
    ]);
    return {
      exams: (examsRes.data ?? []) as Exam[],
      students: (studentsRes.data ?? []) as Profile[],
    };
  }, []);

  const { data: existing, loading: resultsLoading, refetch } = useAsync(
    async () => {
      if (!examId) return [];
      const { data } = await supabase
        .from("results")
        .select("*")
        .eq("exam_id", examId);
      return (data ?? []) as Result[];
    },
    [examId]
  );

  const selectedExam = useMemo(
    () => (data?.exams ?? []).find((e) => e.id === examId),
    [data, examId]
  );

  const loadScores = () => {
    const map: Record<string, string> = {};
    (existing ?? []).forEach((r) => {
      map[r.student_id] = String(r.score);
    });
    setScores(map);
  };

  const setScore = (studentId: string, value: string) =>
    setScores((s) => ({ ...s, [studentId]: value }));

  const saveAll = async () => {
    const max = selectedExam?.max_score ?? 100;
    const entries = Object.entries(scores)
      .filter(([, v]) => v !== "")
      .map(([studentId, v]) => {
        const score = Number(v);
        return {
          student_id: studentId,
          exam_id: examId,
          score,
          grade: getGrade((score / max) * 100),
          remarks: null,
        };
      });
    if (entries.length === 0) return;
    await supabase
      .from("results")
      .upsert(entries, { onConflict: "student_id,exam_id" });
    refetch();
  };

  const togglePublish = async () => {
    const published = !(selectedExam && existing?.some((r) => r.published));
    await supabase
      .from("results")
      .update({ published })
      .eq("exam_id", examId);
    refetch();
  };

  if (loading) return <PageLoader />;

  const isPublished = existing?.some((r) => r.published);

  return (
    <AdminOnly>
      <PageHeader title={t("nav.results")} subtitle={t("admin.subtitle")} />

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Field label={t("grades.examName")}>
                <Select value={examId} onChange={(e) => setExamId(e.target.value)}>
                  <option value="">{t("common.none")}</option>
                  {(data?.exams ?? []).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            {selectedExam && (
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={loadScores}>
                  <RotateCcw className="h-4 w-4" />
                  {t("common.refresh")}
                </Button>
                <Button
                  variant={isPublished ? "secondary" : "success"}
                  onClick={togglePublish}
                  disabled={resultsLoading}
                >
                  <Send className="h-4 w-4" />
                  {isPublished ? t("admin.unpublishResults") : t("admin.publishResults")}
                </Button>
              </div>
            )}
          </div>
          {selectedExam && (
            <p className="text-xs text-slate-400 mt-2">
              Max score: <b>{selectedExam.max_score}</b> •{" "}
              {t("grades.assessmentType")}: {t(`grades.examType.${selectedExam.type}`)}
            </p>
          )}
        </CardContent>
      </Card>

      {examId && selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.studentList")}</CardTitle>
            <Button size="sm" onClick={saveAll}>
              <Save className="h-4 w-4" />
              {t("common.save")}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-3 pl-4 font-medium">{t("common.name")}</th>
                    <th className="py-3 font-medium">{t("profile.regNo")}</th>
                    <th className="py-3 font-medium text-right">{t("grades.score")}</th>
                    <th className="py-3 font-medium text-center">{t("grades.grade")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.students ?? []).map((s) => {
                    const raw = scores[s.id] ?? "";
                    const max = selectedExam.max_score ?? 100;
                    const grade = raw !== "" ? getGrade((Number(raw) / max) * 100) : "-";
                    return (
                      <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-2.5 pl-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {s.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800">{s.full_name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-500">{s.reg_no ?? "-"}</td>
                        <td className="py-2.5 text-right">
                          <Input
                            type="number"
                            min={0}
                            max={selectedExam.max_score}
                            value={raw}
                            onChange={(e) => setScore(s.id, e.target.value)}
                            className="h-9 w-24 ml-auto text-right"
                          />
                        </td>
                        <td className="py-2.5 text-center">
                          <Badge variant={grade === "F" ? "red" : grade === "-" ? "slate" : "green"}>
                            {grade}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!examId && (
        <Card>
          <EmptyState title={t("admin.addResult")} icon={<GraduationCap className="h-6 w-6" />} />
        </Card>
      )}
    </AdminOnly>
  );
}
