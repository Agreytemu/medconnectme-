"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  FlaskConical,
  Pill,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loader";

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
}

export default function DrugDetailPage() {
  const { t } = useLang();
  const { id } = useParams<{ id: string }>();

  const { data: drug, loading } = useAsync(async () => {
    const res = await fetch(`/api/drugs/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return (await res.json()) as DrugDetail;
  }, [id]);

  if (loading) return <PageLoader />;

  if (!drug) {
    return (
      <div>
        <PageHeader
          title={t("formulary.drugDetails")}
          action={
            <Link href="/formulary" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700">
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
          <Link href="/formulary" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Link>
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
      </div>
    </div>
  );
}