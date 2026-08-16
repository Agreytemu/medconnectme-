"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Pill, Search } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface DrugResult {
  id: string;
  brand: string;
  generic: string;
  manufacturer: string | null;
  route: string;
  productType: string | null;
}

export default function FormularyPage() {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<DrugResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqRef = useRef(0);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = search.trim();
    const reqId = ++reqRef.current;
    timerRef.current = setTimeout(
      async () => {
        if (q.length < 2) {
          setResults([]);
          setLoading(false);
          setSearched(false);
          return;
        }
        setSearched(true);
        setLoading(true);
        try {
          const res = await fetch(`/api/drugs?q=${encodeURIComponent(q)}`);
          const data = (await res.json()) as { results: DrugResult[] };
          if (reqId !== reqRef.current) return;
          setResults(data.results ?? []);
        } catch {
          if (reqId !== reqRef.current) return;
          setResults([]);
        } finally {
          if (reqId === reqRef.current) setLoading(false);
        }
      },
      q.length < 2 ? 0 : 450
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search]);

  return (
    <div>
      <PageHeader title={t("formulary.title")} subtitle={t("formulary.subtitle")} />

      <div className="relative mb-5 max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder={t("formulary.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          autoFocus
        />
      </div>

      <div className="max-w-2xl space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))
        ) : results.length > 0 ? (
          results.map((d) => (
            <Link
              key={d.id}
              href={`/formulary/${d.id}`}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Pill className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{d.brand}</p>
                <p className="truncate text-xs text-slate-400">
                  {d.generic}
                  {d.route ? ` \u00b7 ${d.route}` : ""}
                </p>
              </div>
              {d.productType === "HUMAN PRESCRIPTION DRUG" ? (
                <Badge variant="amber" className="shrink-0">
                  Rx
                </Badge>
              ) : (
                <Badge className="shrink-0">OTC</Badge>
              )}
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
            </Link>
          ))
        ) : (
          <Card>
            {searched ? (
              <EmptyState
                title={t("formulary.noDrugs")}
                subtitle={t("formulary.tryDifferent")}
                icon={<Pill className="h-6 w-6" />}
              />
            ) : (
              <EmptyState
                title={t("formulary.searchHint")}
                icon={<Search className="h-6 w-6" />}
              />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}