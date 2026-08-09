"use client";

import { useState } from "react";
import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { AdminOnly } from "@/components/admin/admin-only";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Field, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { StudyMaterial, Course } from "@/lib/types";

const emptyForm = {
  title: "",
  type: "notes" as StudyMaterial["type"],
  course_id: "",
  program_id: "",
  description: "",
  file_url: "",
};

export default function AdminMaterialsPage() {
  const { t } = useLang();
  const supabase = createClient();

  const { data, loading, refetch } = useAsync(async () => {
    const [materialsRes, coursesRes] = await Promise.all([
      supabase.from("study_materials").select("*").order("created_at", { ascending: false }),
      supabase.from("courses").select("*").order("name", { ascending: true }),
    ]);
    return {
      materials: (materialsRes.data ?? []) as StudyMaterial[],
      courses: (coursesRes.data ?? []) as Course[],
    };
  }, []);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("study_materials").insert({
      ...form,
      course_id: form.course_id || null,
      program_id: form.program_id || null,
      file_url: form.file_url || null,
      description: form.description || null,
    });
    setSaving(false);
    setOpen(false);
    setForm({ ...emptyForm });
    refetch();
  };

  const handleDelete = async (m: StudyMaterial) => {
    if (!confirm(t("common.confirmDelete"))) return;
    await supabase.from("study_materials").delete().eq("id", m.id);
    refetch();
  };

  if (loading) return <PageLoader />;

  return (
    <AdminOnly>
      <PageHeader
        title={t("nav.materials")}
        subtitle={t("admin.subtitle")}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("admin.addMaterial")}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {data && data.materials.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-3 pl-4 font-medium">{t("materials.type")}</th>
                    <th className="py-3 font-medium">{t("common.name")}</th>
                    <th className="py-3 font-medium">{t("materials.course")}</th>
                    <th className="py-3 font-medium">{t("materials.date")}</th>
                    <th className="py-3 pr-4 font-medium text-right">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.materials.map((m) => (
                    <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 pl-4">
                        <Badge variant="sky">{t(`materials.typeLabel.${m.type}`)}</Badge>
                      </td>
                      <td className="py-3 font-medium text-slate-800">{m.title}</td>
                      <td className="py-3 text-slate-500">
                        {(data.courses ?? []).find((c) => c.id === m.course_id)?.name ?? "-"}
                      </td>
                      <td className="py-3 text-slate-500">{formatDate(m.created_at)}</td>
                      <td className="py-3 pr-4">
                        <div className="flex justify-end">
                          <button onClick={() => handleDelete(m)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
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
            <EmptyState title={t("materials.noMaterials")} icon={<FolderOpen className="h-6 w-6" />} />
          )}
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={t("admin.addMaterial")}>
        <div className="space-y-4">
          <Field label={t("common.name")}>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label={t("materials.type")}>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as StudyMaterial["type"] })}>
              <option value="notes">{t("materials.typeLabel.notes")}</option>
              <option value="pdf">{t("materials.typeLabel.pdf")}</option>
              <option value="video">{t("materials.typeLabel.video")}</option>
              <option value="link">{t("materials.typeLabel.link")}</option>
              <option value="slides">{t("materials.typeLabel.slides")}</option>
            </Select>
          </Field>
          <Field label={t("materials.course")}>
            <Select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value="">{t("common.none")}</option>
              {(data?.courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("materials.typeLabel.link")}>
            <Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label={t("common.details")}>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Button className="w-full" onClick={handleSave} loading={saving}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </AdminOnly>
  );
}
