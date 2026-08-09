"use client";

import { Megaphone, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { Notice } from "@/lib/types";

export default function NoticesPage() {
  const { t } = useLang();
  const supabase = createClient();

  const { data: notices, loading } = useAsync(async () => {
    const { data } = await supabase
      .from("notices")
      .select("*")
      .in("audience", ["all", "students"])
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    return (data ?? []) as Notice[];
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title={t("notices.title")} subtitle={t("notices.subtitle")} />

      <div className="space-y-3">
        {notices && notices.length > 0 ? (
          notices.map((n) => (
            <Card key={n.id} className={n.pinned ? "border-emerald-200 bg-emerald-50/30" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      {n.pinned && (
                        <Badge variant="amber" className="gap-1">
                          <Pin className="h-3 w-3" />
                          {t("notices.pinned")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(n.created_at)}</p>
                    <p className="text-sm text-slate-600 mt-2 whitespace-pre-line leading-relaxed">
                      {n.body}
                    </p>
                  </div>
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
    </div>
  );
}
