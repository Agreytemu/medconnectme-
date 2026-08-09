"use client";

import { History } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { AdminOnly } from "@/components/admin/admin-only";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { ActivityLog } from "@/lib/types";

export default function AdminActivityPage() {
  const { t } = useLang();
  const supabase = createClient();

  const { data: logs, loading } = useAsync(async () => {
    const { data } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return (data ?? []) as ActivityLog[];
  }, []);

  if (loading) return <PageLoader />;

  return (
    <AdminOnly>
      <PageHeader title={t("activity.title")} subtitle={t("activity.subtitle")} />

      <Card>
        <CardContent className="p-0">
          {logs && logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-3 pl-4 font-medium">{t("activity.user")}</th>
                    <th className="py-3 font-medium">{t("activity.action")}</th>
                    <th className="py-3 font-medium">{t("activity.entity")}</th>
                    <th className="py-3 font-medium">{t("activity.details")}</th>
                    <th className="py-3 font-medium">{t("activity.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {(log.user_name ?? "S").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{log.user_name ?? "System"}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 capitalize">{log.action}</td>
                      <td className="py-3 text-slate-500 capitalize">{log.entity}</td>
                      <td className="py-3 text-slate-500 max-w-[240px] truncate">{log.details ?? "-"}</td>
                      <td className="py-3 text-slate-500">{formatDate(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title={t("activity.noActivity")} icon={<History className="h-6 w-6" />} />
          )}
        </CardContent>
      </Card>
    </AdminOnly>
  );
}
