"use client";

import { useState } from "react";
import { ClipboardList, Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Field, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { CaseLog } from "@/lib/types";

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  department: "",
  diagnosis: "",
  procedure: "",
  patient_age: "",
  patient_gender: "",
  brief: "",
  reflection: "",
};

export default function CaseLogsPage() {
  const { t } = useLang();
  const profile = useProfile();
  const supabase = createClient();

  const { data: cases, loading, refetch } = useAsync(async () => {
    const { data } = await supabase
      .from("case_logs")
      .select("*")
      .eq("student_id", profile.id)
      .order("date", { ascending: false });
    return (data ?? []) as CaseLog[];
  }, []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CaseLog | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (c: CaseLog) => {
    setEditing(c);
    setForm({
      date: c.date,
      department: c.department,
      diagnosis: c.diagnosis,
      procedure: c.procedure ?? "",
      patient_age: c.patient_age ? String(c.patient_age) : "",
      patient_gender: c.patient_gender ?? "",
      brief: c.brief ?? "",
      reflection: c.reflection ?? "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      patient_age: form.patient_age ? Number(form.patient_age) : null,
    };
    if (editing) {
      await supabase.from("case_logs").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("case_logs").insert({ ...payload, student_id: profile.id });
    }
    setSaving(false);
    setOpen(false);
    refetch();
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("caseLogs.title")}
        subtitle={t("caseLogs.subtitle")}
        action={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" />
            {t("caseLogs.newCase")}
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <StatCard label={t("caseLogs.totalCases")} value={cases?.length ?? 0} icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard label={t("caseLogs.approved")} value={cases?.filter((c) => c.status === "approved").length ?? 0} />
      </div>

      <div className="space-y-3">
        {cases && cases.length > 0 ? (
          cases.map((c) => {
            const badge = statusBadge(c.status, () => t(`caseLogs.statusLabel.${c.status}`));
            return (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{c.diagnosis}</p>
                        <Badge variant="blue">{c.department}</Badge>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(c.date)}
                        {c.patient_age ? ` • Age ${c.patient_age}` : ""}
                        {c.patient_gender ? ` • ${c.patient_gender}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => openEdit(c)}
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                  {c.procedure && (
                    <p className="text-xs text-slate-500 mt-2">
                      <b className="text-slate-600">{t("caseLogs.procedure")}:</b> {c.procedure}
                    </p>
                  )}
                  {c.brief && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.brief}</p>}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <EmptyState title={t("caseLogs.noLogs")} icon={<ClipboardList className="h-6 w-6" />} />
          </Card>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? t("caseLogs.editCase") : t("caseLogs.newCase")}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("caseLogs.date")}>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label={t("caseLogs.department")}>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Internal Medicine" />
            </Field>
          </div>
          <Field label={t("caseLogs.diagnosis")}>
            <Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder={t("caseLogs.diagnosisPlaceholder")} />
          </Field>
          <Field label={t("caseLogs.procedure")}>
            <Input value={form.procedure} onChange={(e) => setForm({ ...form, procedure: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("caseLogs.patientAge")}>
              <Input type="number" min={0} value={form.patient_age} onChange={(e) => setForm({ ...form, patient_age: e.target.value })} />
            </Field>
            <Field label={t("caseLogs.patientGender")}>
              <Select value={form.patient_gender} onChange={(e) => setForm({ ...form, patient_gender: e.target.value })}>
                <option value="">{t("common.none")}</option>
                <option value="male">{t("caseLogs.male")}</option>
                <option value="female">{t("caseLogs.female")}</option>
                <option value="other">{t("caseLogs.other")}</option>
              </Select>
            </Field>
          </div>
          <Field label={t("caseLogs.brief")}>
            <Textarea rows={3} value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })} placeholder={t("caseLogs.briefPlaceholder")} />
          </Field>
          <Field label={t("caseLogs.reflection")}>
            <Textarea rows={3} value={form.reflection} onChange={(e) => setForm({ ...form, reflection: e.target.value })} placeholder={t("caseLogs.reflectionPlaceholder")} />
          </Field>
          <Button className="w-full" onClick={handleSave} loading={saving}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
