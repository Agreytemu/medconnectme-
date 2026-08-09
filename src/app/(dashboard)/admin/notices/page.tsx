"use client";

import { useState } from "react";
import { Megaphone, Plus, Trash2, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";
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
import type { Notice } from "@/lib/types";

const emptyForm = {
  title: "",
  body: "",
  audience: "all" as Notice["audience"],
  pinned: false,
};

export default function AdminNoticesPage() {
  const { t } = useLang();
  const profile = useProfile();
  const supabase = createClient();

  const { data: notices, loading, refetch } = useAsync(async () => {
    const { data } = await supabase
      .from("notices")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    return (data ?? []) as Notice[];
  }, []);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("notices").insert({
      ...form,
      created_by: profile.id,
    });
    setSaving(false);
    setOpen(false);
    setForm({ ...emptyForm });
    refetch();
  };

  const handleDelete = async (n: Notice) => {
    if (!confirm(t("common.confirmDelete"))) return;
    await supabase.from("notices").delete().eq("id", n.id);
    refetch();
  };

  if (loading) return <PageLoader />;

  return (
    <AdminOnly>
      <PageHeader
        title={t("nav.notices")}
        subtitle={t("admin.subtitle")}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("admin.addNotice")}
          </Button>
        }
      />

      <div className="space-y-3">
        {notices && notices.length > 0 ? (
          notices.map((n) => (
            <Card key={n.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      {n.pinned && (
                        <Badge variant="amber" className="gap-1">
                          <Pin className="h-3 w-3" />
                          {t("notices.pinned")}
                        </Badge>
                      )}
                      <Badge variant="blue">{t(`notices.audienceLabel.${n.audience}`)}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(n.created_at)}</p>
                    <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{n.body}</p>
                  </div>
                  <button onClick={() => handleDelete(n)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <EmptyState title={t("notices.noNotices")} icon={<Megaphone className="h-6 w-6" />} />
          </Card>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t("admin.addNotice")}>
        <div className="space-y-4">
          <Field label={t("common.name")}>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label={t("notices.audience")}>
            <Select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as Notice["audience"] })}>
              <option value="all">{t("notices.audienceLabel.all")}</option>
              <option value="students">{t("notices.audienceLabel.students")}</option>
              <option value="admin">{t("notices.audienceLabel.admin")}</option>
            </Select>
          </Field>
          <Field label={t("common.details")}>
            <Textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600"
            />
            {t("notices.pinned")}
          </label>
          <Button className="w-full" onClick={handleSave} loading={saving}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </AdminOnly>
  );
}
