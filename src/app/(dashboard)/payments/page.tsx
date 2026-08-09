"use client";

import { useMemo } from "react";
import { Wallet, CheckCircle2, AlertTriangle, Hourglass } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Payment } from "@/lib/types";

export default function PaymentsPage() {
  const { t } = useLang();
  const profile = useProfile();
  const supabase = createClient();

  const { data: payments, loading } = useAsync(async () => {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false });
    return (data ?? []) as Payment[];
  }, []);

  const stats = useMemo(() => {
    if (!payments) return null;
    const totalPaid = payments.reduce((a, p) => a + Number(p.paid_amount), 0);
    const totalDue = payments.reduce((a, p) => a + Number(p.amount), 0);
    return {
      totalPaid,
      totalDue,
      outstanding: totalDue - totalPaid,
      paidCount: payments.filter((p) => p.status === "paid").length,
    };
  }, [payments]);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title={t("payments.title")} subtitle={t("payments.subtitle")} />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label={t("payments.totalPaid")} value={formatCurrency(stats.totalPaid)} icon={<CheckCircle2 className="h-5 w-5" />} />
          <StatCard label={t("payments.totalDue")} value={formatCurrency(stats.totalDue)} icon={<Wallet className="h-5 w-5" />} />
          <StatCard label={t("payments.outstanding")} value={formatCurrency(stats.outstanding)} icon={<AlertTriangle className="h-5 w-5" />} />
          <StatCard label={t("payments.statusLabel.paid")} value={stats.paidCount} icon={<Hourglass className="h-5 w-5" />} />
        </div>
      )}

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>{t("payments.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 font-medium">{t("payments.feeType")}</th>
                    <th className="py-2.5 font-medium text-right">{t("payments.amount")}</th>
                    <th className="py-2.5 font-medium text-right">{t("payments.paid")}</th>
                    <th className="py-2.5 font-medium text-right">{t("payments.balance")}</th>
                    <th className="py-2.5 font-medium">{t("payments.dueDate")}</th>
                    <th className="py-2.5 font-medium">{t("payments.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const badge = statusBadge(p.status, () => t(`payments.statusLabel.${p.status}`));
                    const balance = Number(p.amount) - Number(p.paid_amount);
                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 font-medium text-slate-800">{p.fee_type}</td>
                        <td className="py-3 text-right text-slate-600">{formatCurrency(Number(p.amount))}</td>
                        <td className="py-3 text-right text-emerald-600 font-medium">
                          {formatCurrency(Number(p.paid_amount))}
                        </td>
                        <td className="py-3 text-right font-medium text-slate-800">{formatCurrency(balance)}</td>
                        <td className="py-3 text-slate-500">{p.due_date ? formatDate(p.due_date) : "-"}</td>
                        <td className="py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title={t("payments.noPayments")} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
