"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  ClipboardList,
  FlaskConical,
  Heart,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import {
  addRecent,
  getNote,
  isFavorite,
  saveNote,
  toggleFavorite,
  type StoredDrug,
} from "@/lib/drug-storage";

interface DrugDetail {
  id: string;
  brand: string | null;
  generic: string | null;
  manufacturer: string | null;
  route: string;
  productType: string | null;
  indications: string | null;
  mechanismOfAction: string | null;
  dosage: string | null;
  sideEffects: string | null;
  warnings: string | null;
  contraindications: string | null;
  interactions: string | null;
}

export default function DrugDetailPage() {
  const { t } = useLang();
  const { id } = useParams<{ id: string }>();
  const [isFav, setIsFav] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const { data: drug, loading } = useAsync(async () => {
    const res = await fetch(`/api/drugs/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return (await res.json()) as DrugDetail;
  }, [id]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsFav(isFavorite(id));
      setNote(getNote(id));
      setNoteSaved(false);
    });
    return () => cancelAnimationFrame(raf);
  }, [id]);

  useEffect(() => {
    if (!drug) return;
    const stored: StoredDrug = {
      id: drug.id,
      brand: drug.brand ?? drug.generic ?? "Drug",
      generic: drug.generic ?? "",
      route: drug.route,
      manufacturer: drug.manufacturer,
      productType: drug.productType,
    };
    addRecent(stored);
  }, [drug]);

  if (loading) return <PageLoader />;

  if (!drug) {
    return (
      <div>
        <PageHeader
          title={t("formulary.drugDetails")}
          action={
            <Link
              href="/formulary"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common.back")}
            </Link>
          }
        />
        <Card>
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Pill className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">{t("formulary.notFound")}</p>
          </div>
        </Card>
      </div>
    );
  }

  const handleFav = () => {
    const stored: StoredDrug = {
      id: drug.id,
      brand: drug.brand ?? drug.generic ?? "Drug",
      generic: drug.generic ?? "",
      route: drug.route,
      manufacturer: drug.manufacturer,
      productType: drug.productType,
    };
    setIsFav(toggleFavorite(stored));
  };

  const handleSaveNote = () => {
    saveNote(id, note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const sections: Array<{ icon: React.ReactNode; label: string; value: string | null; tone: string }> = [
    {
      icon: <Sparkles className="h-4 w-4" />,
      label: t("formulary.indications"),
      value: drug.indications,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <FlaskConical className="h-4 w-4" />,
      label: t("formulary.mechanismOfAction"),
      value: drug.mechanismOfAction,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      icon: <ClipboardList className="h-4 w-4" />,
      label: t("formulary.dosageAdmin"),
      value: drug.dosage,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: t("formulary.interactions"),
      value: drug.interactions,
      tone: "bg-cyan-50 text-cyan-600",
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: t("formulary.sideEffects"),
      value: drug.sideEffects,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: t("formulary.warnings"),
      value: drug.warnings,
      tone: "bg-red-50 text-red-600",
    },
    {
      icon: <ShieldAlert className="h-4 w-4" />,
      label: t("formulary.contraindications"),
      value: drug.contraindications,
      tone: "bg-slate-100 text-slate-600",
    },
  ];

  return (
    <div>
      <PageHeader
        title={drug.brand ?? drug.generic ?? t("formulary.drugDetails")}
        subtitle={
          drug.generic && drug.generic !== drug.brand
            ? `${drug.generic}${drug.route ? ` \u00b7 ${drug.route}` : ""}`
            : drug.route || undefined
        }
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleFav}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                isFav
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border-slate-200 bg-white text-slate-400 hover:text-rose-500"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFav ? "fill-emerald-500 text-emerald-500" : ""}`} />
            </button>
            <Link
              href="/formulary"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common.back")}
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {drug.productType === "HUMAN PRESCRIPTION DRUG" && (
          <Badge variant="amber">Rx</Badge>
        )}
        {drug.route && <Badge variant="blue">{drug.route}</Badge>}
        {drug.manufacturer && <Badge variant="slate">{drug.manufacturer}</Badge>}
      </div>

      <div className="space-y-4">
        {sections.map(
          (s) =>
            s.value && (
              <Card key={s.label}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.tone}`}>
                      {s.icon}
                    </span>
                    <h2 className="text-sm font-bold text-slate-800">{s.label}</h2>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {s.value}
                  </p>
                </CardContent>
              </Card>
            )
        )}
        {sections.every((s) => !s.value) && (
          <Card>
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <p className="text-sm text-slate-500">{t("formulary.limitedInfo")}</p>
            </div>
          </Card>
        )}

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <StickyNote className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-800">{t("formulary.myNotes")}</h2>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={t("formulary.notesPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <div className="mt-2 flex items-center gap-2">
              <Button size="sm" onClick={handleSaveNote}>
                <Check className="h-4 w-4" />
                {t("formulary.saveNote")}
              </Button>
              {noteSaved && (
                <span className="text-xs font-medium text-emerald-600">
                  {t("formulary.noteSaved")}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}