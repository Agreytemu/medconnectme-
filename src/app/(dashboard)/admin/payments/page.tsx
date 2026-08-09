"use client";

import { useState } from "react";
import { Wallet, Plus, Trash2 } from "lucide-react";
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
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Payment, Profile } from "@/lib/types";

const emptyForm = {
  student_id: "",
  fee_type: "Tuition Fee",
  amount: 1000000,
  paid_amount: 0,
  due_date: new Date().toISOString().slice(0, 10),
  status: "unpaid" as Payment["status"],
  method: "",
};

export default function AdminPaymentsPage() {
  const { t } = useLang();
  const supabase = createClient();

  const { data, loading, refetch } = useAsync(async () => {
    const [paymentsRes, studentsRes] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("role", "student").order("full_name", { ascending: true }),
    ]);
    return {
      payments: (paymentsRes.data ?? []) as Payment[],
      students: (studentsRes.data ?? []) as Profile[],
    };
  }, []);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const paid = Number(form.paid_amount);
    const total = Number(form.amount);
    const status: Payment["status"] =
      paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid";
    await supabase.from("payments").insert({
      ...form,
      amount: total,
      paid_amount: paid,
      status,
      method: form.method || null,
      date_paid: paid > 0 ? new Date().toISOString().slice(0, 10) : null,
      receipt_no: paid > 0 ? `RC-${Math.floor(Math.random() * 90000) + 10000}` : null,
    });
    setSaving(false);
    setOpen(false);
    setForm({ ...emptyForm, student_id: data?.students[0]?.id ?? "" });
    refetch();
  };

  const handleDelete = async (p: Payment) => {
    if (!confirm(t("common.confirmDelete"))) return;
    await supabase.from("payments").delete().eq("id", p.id);
    refetch();
  };

  if (loading) return <PageLoader />;

  const studentName = (id: string) =>
    (data?.students ?? []).find((s) => s.id === id)?.full_name ?? "-";

  return (
    <AdminOnly>
      <PageHeader
        title={t("nav.payments")}
        subtitle={t("admin.subtitle")}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("admin.addPayment")}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {data && data.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-3 pl-4 font-medium">{t("nav.students")}</th>
                    <th className="py-3 font-medium">{t("payments.feeType")}</th>
                    <th className="py-3 font-medium text-right">{t("payments.amount")}</th>
                    <th className="py-3 font-medium text-right">{t("payments.paid")}</th>
                    <th className="py-3 font-medium">{t("payments.dueDate")}</th>
                    <th className="py-3 font-medium">{t("payments.status")}</th>
                    <th className="py-3 pr-4 font-medium text-right">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => {
                    const badge = statusBadge(p.status, () => t(`payments.statusLabel.${p.status}`));
                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 pl-4 font-medium text-slate-800">{studentName(p.student_id)}</td>
                        <td className="py-3 text-slate-600">{p.fee_type}</td>
                        <td className="py-3 text-right text-slate-600">{formatCurrency(Number(p.amount))}</td>
                        <td className="py-3 text-right text-emerald-600">{formatCurrency(Number(p.paid_amount))}</td>
                        <td className="py-3 text-slate-500">{p.due_date ? formatDate(p.due_date) : "-"}</td>
                        <td className="py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex justify-end">
                            <button onClick={() => handleDelete(p)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
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
            <EmptyState title={t("payments.noPayments")} icon={<Wallet className="h-6 w-6" />} />
          )}
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={t("admin.addPayment")}>
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
          <Field label={t("payments.feeType")}>
            <Input value={form.fee_type} onChange={(e) => setForm({ ...form, fee_type: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("payments.amount")}>
              <Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </Field>
            <Field label={t("payments.paid")}>
              <Input type="number" min={0} value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("payments.dueDate")}>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </Field>
            <Field label={t("payments.method")}>
              <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="">{t("common.none")}</option>
                <option value="Bank">Bank</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Cash">Cash</option>
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
