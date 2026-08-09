"use client";

import { useState } from "react";
import { BellRing, Plus, Check, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Field } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { Reminder } from "@/lib/types";

const badgeVariantByType: Record<string, "red" | "green" | "amber" | "blue" | "slate"> = {
  exam: "red",
  assignment: "amber",
  rotation: "blue",
  payment: "green",
  other: "slate",
};

export default function RemindersPage() {
  const { t } = useLang();
  const profile = useProfile();
  const supabase = createClient();

  const { data: reminders, loading, refetch } = useAsync(async () => {
    const { data } = await supabase
      .from("reminders")
      .select("*")
      .eq("student_id", profile.id)
      .order("done", { ascending: true })
      .order("due_date", { ascending: true });
    return (data ?? []) as Reminder[];
  }, []);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    due_date: new Date().toISOString().slice(0, 10),
    type: "exam",
  });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    await supabase
      .from("reminders")
      .insert({ ...form, student_id: profile.id });
    setSaving(false);
    setOpen(false);
    setForm({ title: "", due_date: new Date().toISOString().slice(0, 10), type: "exam" });
    refetch();
  };

  const toggleDone = async (r: Reminder) => {
    await supabase.from("reminders").update({ done: !r.done }).eq("id", r.id);
    refetch();
  };

  const remove = async (r: Reminder) => {
    await supabase.from("reminders").delete().eq("id", r.id);
    refetch();
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("reminders.title")}
        subtitle={t("reminders.subtitle")}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("reminders.newReminder")}
          </Button>
        }
      />

      <div className="space-y-2.5">
        {reminders && reminders.length > 0 ? (
          reminders.map((r) => {
            const overdue = !r.done && new Date(r.due_date) < new Date();
            return (
              <Card key={r.id} className={r.done ? "opacity-50" : ""}>
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleDone(r)}
                      className={`h-7 w-7 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                        r.done
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 hover:border-emerald-400"
                      }`}
                    >
                      {r.done && <Check className="h-4 w-4" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${r.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {r.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(r.due_date)}
                        {overdue && ` • ${t("reminders.overdue")}`}
                      </p>
                    </div>
                    <Badge variant={badgeVariantByType[r.type] ?? "slate"}>
                      {t(`reminders.typeLabel.${r.type}`)}
                    </Badge>
                    <button
                      onClick={() => remove(r)}
                      className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <EmptyState title={t("reminders.noReminders")} icon={<BellRing className="h-6 w-6" />} />
          </Card>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t("reminders.newReminder")}>
        <div className="space-y-4">
          <Field label={t("reminders.titleLabel")}>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label={t("reminders.dueDate")}>
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </Field>
          <Field label={t("reminders.type")}>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="exam">{t("reminders.typeLabel.exam")}</option>
              <option value="assignment">{t("reminders.typeLabel.assignment")}</option>
              <option value="rotation">{t("reminders.typeLabel.rotation")}</option>
              <option value="payment">{t("reminders.typeLabel.payment")}</option>
              <option value="other">{t("reminders.typeLabel.other")}</option>
            </Select>
          </Field>
          <Button className="w-full" onClick={handleAdd} loading={saving}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
