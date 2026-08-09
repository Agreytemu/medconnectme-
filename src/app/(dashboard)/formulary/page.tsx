"use client";

import { useMemo, useState } from "react";
import { Pill, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import type { Drug } from "@/lib/types";

export default function FormularyPage() {
  const { t } = useLang();
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Drug | null>(null);

  const { data: drugs, loading } = useAsync(async () => {
    const { data } = await supabase.from("drugs").select("*").order("name", { ascending: true });
    return (data ?? []) as Drug[];
  }, []);

  const filtered = useMemo(() => {
    if (!drugs) return [];
    const q = search.toLowerCase();
    return drugs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.generic_name ?? "").toLowerCase().includes(q) ||
        (d.drug_class ?? "").toLowerCase().includes(q)
    );
  }, [drugs, search]);

  if (loading) return <PageLoader />;

  const detailRow = (label: string, value: string | null | undefined) =>
    value ? (
      <div className="mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-1">
          {label}
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
      </div>
    ) : null;

  return (
    <div>
      <PageHeader title={t("formulary.title")} subtitle={t("formulary.subtitle")} />

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder={t("formulary.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {filtered.length > 0 ? (
            filtered.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                  selected?.id === d.id
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-slate-200 bg-white hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{d.name}</p>
                    {d.generic_name && (
                      <p className="text-xs text-slate-400 truncate">{d.generic_name}</p>
                    )}
                  </div>
                  {d.drug_class && (
                    <Badge variant="blue" className="shrink-0">
                      {d.drug_class}
                    </Badge>
                  )}
                </div>
              </button>
            ))
          ) : (
            <Card>
              <EmptyState title={t("formulary.noDrugs")} icon={<Pill className="h-6 w-6" />} />
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-5">
              {selected ? (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-800">{selected.name}</h2>
                      {selected.generic_name && (
                        <p className="text-xs text-slate-400">{selected.generic_name}</p>
                      )}
                    </div>
                  </div>
                  {detailRow(t("formulary.class"), selected.drug_class)}
                  {detailRow(t("formulary.indications"), selected.indications)}
                  {detailRow(t("formulary.dosage"), selected.dosage)}
                  {detailRow(t("formulary.sideEffects"), selected.side_effects)}
                  {detailRow(t("formulary.contraindications"), selected.contraindications)}
                </div>
              ) : (
                <EmptyState
                  title={t("formulary.selectDrug")}
                  icon={<Pill className="h-6 w-6" />}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
