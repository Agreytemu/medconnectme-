"use client";

import { useState } from "react";
import { Stethoscope, Plus, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { AdminOnly } from "@/components/admin/admin-only";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Field } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { ClinicalRotation, Profile } from "@/lib/types";

const emptyForm = {
  student_id: "",
  department: "",
  hospital: "",
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date().toISOString().slice(0, 10),
  supervisor: "",
  hours_required: 200,
  status: "upcoming" as ClinicalRotation["status"],
};

export default function AdminRotationsPage() {
  const { t } = useLang();
  const supabase = createClient();

  const { data, loading, refetch } = useAsync(async () => {
    const [rotationsRes, studentsRes] = await Promise.all([
      supabase.from("clinical_rotations").select("*").order("start_date", { ascending: false }),
      supabase.from("profiles").select("*").eq("role", "student").order("full_name", { ascending: true }),
    ]);
    return {
      rotations: (rotationsRes.data ?? []) as ClinicalRotation[],
      students: (studentsRes.data ?? []) as Profile[],
    };
  }, []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicalRotation | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, student_id: data?.students[0]?.id ?? "" });
    setOpen(true);
  };

  const openEdit = (r: ClinicalRotation) => {
    setEditing(r);
    setForm({
      student_id: r.student_id,
      department: r.department,
      hospital: r.hospital ?? "",
      start_date: r.start_date,
      end_date: r.end_date,
      supervisor: r.supervisor ?? "",
      hours_required: r.hours_required ?? 200,
      status: r.status,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      hospital: form.hospital || null,
      supervisor: form.supervisor || null,
      hours_required: form.hours_required || null,
    };
    if (editing) {
      await supabase.from("clinical_rotations").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("clinical_rotations").insert(payload);
    }
    setSaving(false);
    setOpen(false);
    refetch();
  };

  const handleDelete = async (r: ClinicalRotation) => {
    if (!confirm(t("common.confirmDelete"))) return;
    await supabase.from("clinical_rotations").delete().eq("id", r.id);
    refetch();
  };

  if (loading) return <PageLoader />;

  const studentName = (id: string) =>
    (data?.students ?? []).find((s) => s.id === id)?.full_name ?? "-";

  return (
    <AdminOnly>
      <PageHeader
        title={t("nav.rotations")}
        subtitle={t("admin.subtitle")}
        action={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" />
            {t("admin.addRotation")}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {data && data.rotations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-3 pl-4 font-medium">{t("nav.students")}</th>
                    <th className="py-3 font-medium">{t("rotations.department")}</th>
                    <th className="py-3 font-medium">{t("rotations.hospital")}</th>
                    <th className="py-3 font-medium">{t("rotations.startDate")}</th>
                    <th className="py-3 font-medium">{t("rotations.endDate")}</th>
                    <th className="py-3 font-medium">{t("rotations.status")}</th>
                    <th className="py-3 pr-4 font-medium text-right">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rotations.map((r) => {
                    const badge = statusBadge(r.status, () => t(`rotations.statusLabel.${r.status}`));
                    return (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 pl-4 font-medium text-slate-800">{studentName(r.student_id)}</td>
                        <td className="py-3 text-slate-600">{r.department}</td>
                        <td className="py-3 text-slate-500">{r.hospital ?? "-"}</td>
                        <td className="py-3 text-slate-500">{formatDate(r.start_date)}</td>
                        <td className="py-3 text-slate-500">{formatDate(r.end_date)}</td>
                        <td className="py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(r)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title={t("rotations.noRotations")} icon={<Stethoscope className="h-6 w-6" />} />
          )}
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t("admin.editExam") : t("admin.addRotation")}>
        <div className="space-y-4">
          <Field label={t("nav.students")}>
            <Select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
              {(data?.students ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("rotations.department")}>
            <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </Field>
          <Field label={t("rotations.hospital")}>
            <Input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("rotations.startDate")}>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </Field>
            <Field label={t("rotations.endDate")}>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </Field>
          </div>
          <Field label={t("rotations.supervisor")}>
            <Input value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("rotations.hoursRequired")}>
              <Input
                type="number"
                min={1}
                value={form.hours_required}
                onChange={(e) => setForm({ ...form, hours_required: Number(e.target.value) })}
              />
            </Field>
            <Field label={t("rotations.status")}>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClinicalRotation["status"] })}>
                <option value="upcoming">{t("rotations.statusLabel.upcoming")}</option>
                <option value="active">{t("rotations.statusLabel.active")}</option>
                <option value="completed">{t("rotations.statusLabel.completed")}</option>
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
