"use client";

import { useMemo, useState } from "react";
import {
  FolderOpen,
  FileText,
  Video,
  Link2,
  Presentation,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { StudyMaterial } from "@/lib/types";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  notes: BookOpen,
  pdf: FileText,
  video: Video,
  link: Link2,
  slides: Presentation,
};

export default function MaterialsPage() {
  const { t } = useLang();
  const supabase = createClient();
  const [search, setSearch] = useState("");

  const { data: materials, loading } = useAsync(async () => {
    const { data } = await supabase
      .from("study_materials")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []) as StudyMaterial[];
  }, []);

  const filtered = useMemo(() => {
    if (!materials) return [];
    const q = search.toLowerCase();
    return materials.filter(
      (m) => m.title.toLowerCase().includes(q) || (m.description ?? "").toLowerCase().includes(q)
    );
  }, [materials, search]);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title={t("materials.title")} subtitle={t("materials.subtitle")} />

      <Input
        placeholder={t("materials.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-5"
      />

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.length > 0 ? (
          filtered.map((m) => {
            const Icon = typeIcons[m.type] ?? FileText;
            const isExternal = m.type === "link" || m.type === "video";
            return (
              <Card key={m.id} className="hover:shadow transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.title}</p>
                        <Badge variant="sky">{t(`materials.typeLabel.${m.type}`)}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {m.description ?? t("common.notSet")}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-slate-400">
                          {formatDate(m.created_at)}
                        </span>
                        {isExternal && m.file_url && (
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600"
                          >
                            {t("materials.open")} <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="sm:col-span-2">
            <Card>
              <EmptyState title={t("materials.noMaterials")} icon={<FolderOpen className="h-6 w-6" />} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
