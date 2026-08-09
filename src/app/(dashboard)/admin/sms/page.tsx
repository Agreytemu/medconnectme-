"use client";

import { useState } from "react";
import { MessagesSquare, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { AdminOnly } from "@/components/admin/admin-only";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Field, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { SmsMessage, Profile } from "@/lib/types";

const emptyForm = {
  student_id: "",
  phone: "",
  message: "",
  type: "general" as SmsMessage["type"],
};

export default function AdminSmsPage() {
  const { t } = useLang();
  const supabase = createClient();

  const { data, loading, refetch } = useAsync(async () => {
    const [smsRes, studentsRes] = await Promise.all([
      supabase.from("sms_messages").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("*").eq("role", "student").order("full_name", { ascending: true }),
    ]);
    return {
      messages: (smsRes.data ?? []) as SmsMessage[],
      students: (studentsRes.data ?? []) as Profile[],
    };
  }, []);

  const [form, setForm] = useState({ ...emptyForm });
  const [sending, setSending] = useState(false);

  const selectStudent = (id: string) => {
    const student = (data?.students ?? []).find((s) => s.id === id);
    setForm((f) => ({ ...f, student_id: id, phone: student?.phone ?? f.phone }));
  };

  const handleSend = async () => {
    setSending(true);
    await supabase.from("sms_messages").insert({
      student_id: form.student_id || null,
      phone: form.phone,
      message: form.message,
      type: form.type,
      status: "pending",
    });
    setSending(false);
    setForm({ ...emptyForm });
    refetch();
  };

  if (loading) return <PageLoader />;

  return (
    <AdminOnly>
      <PageHeader title={t("sms.title")} subtitle={t("sms.subtitle")} />

      <Card className="mb-5">
        <CardContent className="p-4">
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={t("nav.students")}>
                <Select value={form.student_id} onChange={(e) => selectStudent(e.target.value)}>
                  <option value="">{t("common.none")}</option>
                  {(data?.students ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("sms.phone")}>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+255..." />
              </Field>
            </div>
            <Field label={t("sms.message")}>
              <Textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                maxLength={160}
              />
              <p className="text-[11px] text-slate-400 mt-1 text-right">
                {160 - form.message.length} {t("sms.charactersLeft")}
              </p>
            </Field>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="sm:w-48">
                <Field label={t("sms.type")}>
                  <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SmsMessage["type"] })}>
                    <option value="general">{t("sms.typeLabel.general")}</option>
                    <option value="result">{t("sms.typeLabel.result")}</option>
                    <option value="notice">{t("sms.typeLabel.notice")}</option>
                    <option value="payment">{t("sms.typeLabel.payment")}</option>
                  </Select>
                </Field>
              </div>
              <Button onClick={handleSend} loading={sending} disabled={!form.message || !form.phone}>
                <Send className="h-4 w-4" />
                {t("sms.send")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("nav.sms")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data && data.messages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-3 pl-4 font-medium">{t("sms.phone")}</th>
                    <th className="py-3 font-medium">{t("sms.message")}</th>
                    <th className="py-3 font-medium">{t("sms.type")}</th>
                    <th className="py-3 font-medium">{t("sms.status")}</th>
                    <th className="py-3 font-medium">{t("activity.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.messages.map((m) => {
                    const badge = statusBadge(m.status, () => t(`sms.statusLabel.${m.status}`));
                    return (
                      <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 pl-4 text-slate-600">{m.phone}</td>
                        <td className="py-3 text-slate-500 max-w-[260px] truncate">{m.message}</td>
                        <td className="py-3">
                          <Badge variant="blue">{t(`sms.typeLabel.${m.type}`)}</Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="py-3 text-slate-500">{formatDate(m.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title={t("sms.noMessages")} icon={<MessagesSquare className="h-6 w-6" />} />
          )}
        </CardContent>
      </Card>
    </AdminOnly>
  );
}
