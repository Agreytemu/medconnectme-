"use client";

import { useState } from "react";
import { BookOpenCheck, Plus, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { AdminOnly } from "@/components/admin/admin-only";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Field } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { Exam, Course } from "@/lib/types";

const emptyForm = {
  title: "",
  type: "exam" as Exam["type"],
  course_id: "",
  program_id: "",
  date: new Date().toISOString().slice(0, 10),
  max_score: 100,
};

export default function AdminExamsPage() {
  const { t } = useLang();
  const supabase = createClient();

  const { data, loading, refetch } = useAsync(async () => {
    const [examsRes, coursesRes, programsRes] = await Promise.all([
      supabase.from("exams").select("*, course:courses(*)").order("date", { ascending: false }),
      supabase.from("courses").select("*").order("name", { ascending: true }),
      supabase.from("programs").select("*").order("name", { ascending: true }),
    ]);
    return {
      exams: (examsRes.data ?? []) as (Exam & { course?: Course | null })[],
      courses: (coursesRes.data ?? []) as Course[],
      programs: (programsRes.data ?? []) as { id: string; name: string }[],
    };
  }, []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (e: Exam) => {
    setEditing(e);
    setForm({
      title: e.title,
      type: e.type,
      course_id: e.course_id ?? "",
      program_id: e.program_id ?? "",
      date: e.date,
      max_score: Number(e.max_score),
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      course_id: form.course_id || null,
      program_id: form.program_id || null,
    };
    if (editing) {
      await supabase.from("exams").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("exams").insert(payload);
    }
    setSaving(false);
    setOpen(false);
    refetch();
  };

  const handleDelete = async (e: Exam) => {
    if (!confirm(t("common.confirmDelete"))) return;
    await supabase.from("exams").delete().eq("id", e.id);
    refetch();
  };

  if (loading) return <PageLoader />;

  return (
    <AdminOnly>
      <PageHeader
        title={t("nav.exams")}
        subtitle={t("admin.subtitle")}
        action={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" />
            {t("admin.addExam")}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {data && data.exams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-3 pl-4 font-medium">{t("grades.examName")}</th>
                    <th className="py-3 font-medium">{t("grades.assessmentType")}</th>
                    <th className="py-3 font-medium">{t("grades.course")}</th>
                    <th className="py-3 font-medium">{t("grades.date")}</th>
                    <th className="py-3 font-medium">{t("grades.score")}</th>
                    <th className="py-3 pr-4 font-medium text-right">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.exams.map((e) => (
                    <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 pl-4 font-medium text-slate-800">{e.title}</td>
                      <td className="py-3">
                        <Badge variant="blue">{t(`grades.examType.${e.type}`)}</Badge>
                      </td>
                      <td className="py-3 text-slate-500">{e.course?.name ?? "-"}</td>
                      <td className="py-3 text-slate-500">{formatDate(e.date)}</td>
                      <td className="py-3 text-slate-600">{e.max_score}</td>
                      <td className="py-3 pr-4">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(e)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(e)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title={t("grades.noResults")} icon={<BookOpenCheck className="h-6 w-6" />} />
          )}
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t("admin.editExam") : t("admin.addExam")}>
        <div className="space-y-4">
          <Field label={t("grades.examName")}>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("grades.assessmentType")}>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Exam["type"] })}>
                <option value="exam">{t("grades.examType.exam")}</option>
                <option value="assignment">{t("grades.examType.assignment")}</option>
                <option value="quiz">{t("grades.examType.quiz")}</option>
                <option value="assessment">{t("grades.examType.assessment")}</option>
                <option value="practical">{t("grades.examType.practical")}</option>
              </Select>
            </Field>
            <Field label={t("grades.date")}>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
          </div>
          <Field label={t("grades.course")}>
            <Select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value="">{t("common.none")}</option>
              {(data?.courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("profile.program")}>
              <Select value={form.program_id} onChange={(e) => setForm({ ...form, program_id: e.target.value })}>
                <option value="">{t("common.none")}</option>
                {(data?.programs ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("grades.score")}>
              <Input
                type="number"
                min={1}
                value={form.max_score}
                onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Button className="w-full" onClick={handleSave} loading={saving}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </AdminOnly>
  );
}
