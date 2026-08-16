"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, Heart, Pill, Search } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getFavorites,
  getRecent,
  type StoredDrug,
} from "@/lib/drug-storage";

interface DrugResult {
  id: string;
  brand: string;
  generic: string;
  manufacturer: string | null;
  route: string;
  productType: string | null;
}

interface DrugCardData {
  id: string;
  brand: string;
  generic: string;
  route: string;
  productType: string | null;
}

function DrugCard({ drug }: { drug: DrugCardData }) {
  return (
    <Link
      href={`/formulary/${drug.id}`}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
    >
      <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
        <Pill className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{drug.brand}</p>
        <p className="truncate text-xs text-slate-400">
          {drug.generic}
          {drug.route ? ` \u00b7 ${drug.route}` : ""}
        </p>
      </div>
      {drug.productType === "HUMAN PRESCRIPTION DRUG" ? (
        <Badge variant="amber" className="shrink-0">
          Rx
        </Badge>
      ) : (
        <Badge className="shrink-0">OTC</Badge>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </Link>
  );
}

export default function FormularyPage() {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<DrugResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [favorites, setFavorites] = useState<StoredDrug[]>([]);
  const [recent, setRecent] = useState<StoredDrug[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqRef = useRef(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setFavorites(getFavorites());
      setRecent(getRecent());
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const runSearch = async (q: string, offset: number, reqId: number) => {
    try {
      const res = await fetch(`/api/drugs?q=${encodeURIComponent(q)}&skip=${offset}`);
      const data = (await res.json()) as {
        results: DrugResult[];
        hasMore: boolean;
      };
      if (reqId !== reqRef.current) return;
      setResults((prev) => (offset === 0 ? data.results : [...prev, ...data.results]));
      setHasMore(data.hasMore);
    } catch {
      if (reqId !== reqRef.current) return;
      setResults([]);
      setHasMore(false);
    } finally {
      if (reqId === reqRef.current) setLoading(false);
    }
  };

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
          setHasMore(false);
          return;
        }
        setSearched(true);
        setLoading(true);
        await runSearch(q, 0, reqId);
      },
      q.length < 2 ? 0 : 450
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    const q = search.trim();
    const reqId = ++reqRef.current;
    setLoading(true);
    runSearch(q, results.length, reqId);
  };

  const searching = search.trim().length >= 2;
  const showEmpty = favorites.length === 0 && recent.length === 0;

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
        />
      </div>

      {!searching ? (
        <div className="max-w-2xl space-y-6">
          {favorites.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Heart className="h-4 w-4 text-emerald-500" />
                {t("formulary.favorites")}
              </h2>
              <div className="space-y-2">
                {favorites.map((d) => (
                  <DrugCard key={d.id} drug={d} />
                ))}
              </div>
            </section>
          )}
          {recent.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Clock className="h-4 w-4 text-slate-400" />
                {t("formulary.recentlyViewed")}
              </h2>
              <div className="space-y-2">
                {recent.map((d) => (
                  <DrugCard key={d.id} drug={d} />
                ))}
              </div>
            </section>
          )}
          {showEmpty && (
            <Card>
              <EmptyState
                title={t("formulary.searchHint")}
                subtitle={t("formulary.noFavorites")}
                icon={<Search className="h-6 w-6" />}
              />
            </Card>
          )}
        </div>
      ) : (
        <div className="max-w-2xl space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </Card>
            ))
          ) : results.length > 0 ? (
            <>
              {results.map((d) => (
                <DrugCard key={d.id} drug={d} />
              ))}
              {hasMore && (
                <div className="pt-1 text-center">
                  <Button variant="outline" onClick={handleLoadMore} loading={loading}>
                    {t("formulary.loadMore")}
                  </Button>
                </div>
              )}
            </>
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
      )}
    </div>
  );
}