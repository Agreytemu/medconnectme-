"use client";

import { useState } from "react";
import { CalendarDays, Plus, Pencil, Trash2 } from "lucide-react";
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
import { PageLoader } from "@/components/ui/loader";
import { formatTime, DAYS_OF_WEEK } from "@/lib/utils";
import type { TimetableEntry, Course } from "@/lib/types";

const emptyForm = {
  title: "",
  day_of_week: 1,
  start_time: "08:00",
  end_time: "10:00",
  location: "",
  teacher: "",
  type: "lecture" as TimetableEntry["type"],
  course_id: "",
  program_id: "",
};

export default function AdminTimetablePage() {
  const { t } = useLang();
  const supabase = createClient();

  const { data, loading, refetch } = useAsync(async () => {
    const [entriesRes, coursesRes, programsRes] = await Promise.all([
      supabase.from("timetable_entries").select("*").order("day_of_week", { ascending: true }).order("start_time", { ascending: true }),
      supabase.from("courses").select("*").order("name", { ascending: true }),
      supabase.from("programs").select("*").order("name", { ascending: true }),
    ]);
    return {
      entries: (entriesRes.data ?? []) as TimetableEntry[],
      courses: (coursesRes.data ?? []) as Course[],
      programs: (programsRes.data ?? []) as { id: string; name: string }[],
    };
  }, []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TimetableEntry | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (e: TimetableEntry) => {
    setEditing(e);
    setForm({
      title: e.title,
      day_of_week: e.day_of_week,
      start_time: e.start_time,
      end_time: e.end_time,
      location: e.location ?? "",
      teacher: e.teacher ?? "",
      type: e.type,
      course_id: e.course_id ?? "",
      program_id: e.program_id ?? "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      location: form.location || null,
      teacher: form.teacher || null,
      course_id: form.course_id || null,
      program_id: form.program_id || null,
    };
    if (editing) {
      await supabase.from("timetable_entries").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("timetable_entries").insert(payload);
    }
    setSaving(false);
    setOpen(false);
    refetch();
  };

  const handleDelete = async (e: TimetableEntry) => {
    if (!confirm(t("common.confirmDelete"))) return;
    await supabase.from("timetable_entries").delete().eq("id", e.id);
    refetch();
  };

  if (loading) return <PageLoader />;

  const grouped = DAYS_OF_WEEK.map((day, idx) => ({
    day,
    entries: (data?.entries ?? []).filter((e) => e.day_of_week === idx),
  }));

  return (
    <AdminOnly>
      <PageHeader
        title={t("nav.timetable")}
        subtitle={t("admin.subtitle")}
        action={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" />
            {t("admin.addTimetable")}
          </Button>
        }
      />

      <div className="space-y-4">
        {grouped.map((g) => (
          <Card key={g.day}>
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-slate-800 mb-3">
                {t(`timetable.${g.day.toLowerCase()}`)}
              </p>
              {g.entries.length > 0 ? (
                <div className="space-y-2">
                  {g.entries.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                      <div className="h-10 w-16 shrink-0 rounded-lg bg-emerald-100 text-emerald-700 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold">{formatTime(e.start_time)}</span>
                        <span className="text-[8px] opacity-70">{formatTime(e.end_time)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{e.title}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {e.location || "-"} {e.teacher ? `• ${e.teacher}` : ""}
                        </p>
                      </div>
                      <Badge variant="blue">{t(`timetable.typeLabel.${e.type}`)}</Badge>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(e)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(e)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-2 text-center">
                  <CalendarDays className="h-4 w-4 inline mr-1" />
                  {t("timetable.noClasses")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t("admin.editExam") : t("admin.addTimetable")}>
        <div className="space-y-4">
          <Field label={t("timetable.course")}>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("timetable.day")}>
              <Select
                value={form.day_of_week}
                onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })}
              >
                {DAYS_OF_WEEK.map((d, idx) => (
                  <option key={d} value={idx}>
                    {t(`timetable.${d.toLowerCase()}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("timetable.type")}>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TimetableEntry["type"] })}>
                <option value="lecture">{t("timetable.typeLabel.lecture")}</option>
                <option value="practical">{t("timetable.typeLabel.practical")}</option>
                <option value="rotation">{t("timetable.typeLabel.rotation")}</option>
                <option value="seminar">{t("timetable.typeLabel.seminar")}</option>
                <option value="exam">{t("timetable.typeLabel.exam")}</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("timetable.time")}>
              <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </Field>
            <Field label={t("common.to")}>
              <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </Field>
          </div>
          <Field label={t("timetable.location")}>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label={t("timetable.teacher")}>
            <Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
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
          </div>
          <Button className="w-full" onClick={handleSave} loading={saving}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </AdminOnly>
  );
}
