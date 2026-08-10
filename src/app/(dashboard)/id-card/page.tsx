"use client";

import { Fragment, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, Repeat } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loader";
import { Logo } from "@/components/ui/logo";
import { COLLEGES } from "@/lib/constants/education";
import type { Program, Profile } from "@/lib/types";

function Barcode({
  value,
  className = "h-10",
}: {
  value: string;
  className?: string;
}) {
  const code = value || "MEDCONNECTME";
  const pairs = code.split("").map((c, i) => {
    const n = c.charCodeAt(0);
    const bar = 2 + (n % 3) + (i % 2);
    const gap = 1 + ((n >> 2) % 2) + (i % 2 ? 0 : 1);
    return { bar, gap };
  });
  return (
    <div
      className={`${className} mt-1 flex items-stretch overflow-hidden`}
      aria-hidden
    >
      {pairs.map((p, i) => (
        <Fragment key={i}>
          <div style={{ width: p.bar }} className="h-full shrink-0 bg-slate-800" />
          <div style={{ width: p.gap }} className="h-full shrink-0" />
        </Fragment>
      ))}
    </div>
  );
}

function CardFront({
  profile,
  program,
  qrUrl,
  t,
}: {
  profile: Profile;
  program: Program | null;
  qrUrl: string | null;
  t: (key: string) => string;
}) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white p-0.5">
          <Logo className="h-full w-full rounded" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-white">
            {t("appName")}
          </p>
          <p className="text-[9px] uppercase tracking-wider text-white/80">
            {t("idCard.cardholder")}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 py-3">
        <p className="truncate text-[15px] font-bold text-slate-800">
          {profile.full_name}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-wide text-slate-400">
              {t("idCard.regNo")}
            </p>
            <p className="truncate font-semibold text-slate-700">
              {profile.reg_no ?? "-"}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-wide text-slate-400">
              {t("idCard.yearOfStudy")}
            </p>
            <p className="truncate font-semibold text-slate-700">
              {profile.year_of_study ? `Year ${profile.year_of_study}` : "-"}
            </p>
          </div>
          <div className="col-span-2 min-w-0">
            <p className="text-[8px] uppercase tracking-wide text-slate-400">
              {t("idCard.program")}
            </p>
            <p className="truncate font-semibold text-slate-700">
              {program?.name ?? "-"}
            </p>
          </div>
        </div>
        <div className="mt-auto flex items-end justify-between pt-1">
          <div>
            <p className="text-[8px] uppercase tracking-wide text-slate-400">
              {t("idCard.expires")}
            </p>
            <p className="text-[11px] font-semibold text-slate-600">
              2027-07-31
            </p>
          </div>
          {qrUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrUrl}
              alt="QR"
              className="h-12 w-12 rounded-md border border-slate-200"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CardBack({
  profile,
  collegeName,
  t,
}: {
  profile: Profile;
  collegeName: string;
  t: (key: string) => string;
}) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="h-8 bg-slate-800" />
      <div className="flex flex-1 flex-col px-4 py-2.5">
        <p className="text-[8px] uppercase tracking-wide text-slate-400">
          {t("idCard.signature")}
        </p>
        <svg viewBox="0 0 220 30" className="mt-0.5 h-6 w-full max-w-[180px]">
          <path
            d="M6 24 C 28 4, 44 28, 70 18 S 104 6, 128 20 S 158 10, 176 18 S 202 24, 214 10"
            fill="none"
            stroke="#334155"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <p className="mt-1.5 text-[8px] uppercase tracking-wide text-slate-400">
          {t("idCard.barcode")}
        </p>
        <Barcode value={profile.reg_no ?? ""} className="h-7" />

        <p className="mt-2 line-clamp-2 border-t border-slate-100 pt-1.5 text-[8px] leading-snug text-slate-500">
          {t("idCard.terms")}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-1.5">
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-wide text-slate-400">
              {t("idCard.ifFound")}
            </p>
            <p className="truncate text-[10px] font-semibold text-slate-700">
              {collegeName}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[8px] uppercase tracking-wide text-slate-400">
              {t("idCard.helpdesk")}
            </p>
            <p className="text-[10px] font-semibold text-slate-700">
              support@medconnectme.local
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IdCardPage() {
  const { t } = useLang();
  const profile = useProfile();
  const supabase = createClient();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  const { data: program, loading } = useAsync(async () => {
    if (!profile.program_id) return null;
    const { data } = await supabase
      .from("programs")
      .select("*")
      .eq("id", profile.program_id)
      .single();
    return (data ?? null) as Program | null;
  }, []);

  useEffect(() => {
    if (!profile.reg_no) return;
    QRCode.toDataURL(profile.reg_no, { width: 160, margin: 1 })
      .then(setQrUrl)
      .catch(() => setQrUrl(null));
  }, [profile.reg_no]);

  if (loading) return <PageLoader />;

  const handlePrint = () => window.print();
  const collegeName = COLLEGES.find((c) => c.id === profile.college)?.name ?? t("appName");

  return (
    <div className="print:bg-white">
      <PageHeader
        title={t("idCard.title")}
        subtitle={t("idCard.subtitle")}
        action={
          <div className="hidden print:hidden sm:flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              {t("idCard.printCard")}
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Download className="h-4 w-4" />
              {t("idCard.downloadCard")}
            </Button>
          </div>
        }
      />

      <div className="flex justify-center mt-2">
        <div className="w-full max-w-sm">
          <div className="relative [perspective:1200px]">
            <div
              className={`id-card-inner relative aspect-[85.6/54] transition-transform duration-700 [transform-style:preserve-3d] ${
                flipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <div className="id-card-front absolute inset-0 [backface-visibility:hidden] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                <CardFront profile={profile} program={program} qrUrl={qrUrl} t={t} />
              </div>
              <div className="id-card-back absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                <CardBack profile={profile} collegeName={collegeName} t={t} />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFlipped((f) => !f)}
            >
              <Repeat className="h-4 w-4" />
              {flipped ? t("idCard.showFront") : t("idCard.flip")}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-5 sm:hidden print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          {t("idCard.printCard")}
        </Button>
      </div>

      <div className="id-card-print">
        <div className="id-print-page">
          <div className="id-print-face">
            <CardFront profile={profile} program={program} qrUrl={qrUrl} t={t} />
          </div>
        </div>
        <div className="id-print-page">
          <div className="id-print-face">
            <CardBack profile={profile} collegeName={collegeName} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}
