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
import type { Program } from "@/lib/types";

function Barcode({ value }: { value: string }) {
  const code = value || "MEDCONNECTME";
  const pairs = code.split("").map((c, i) => {
    const n = c.charCodeAt(0);
    const bar = 2 + (n % 3) + (i % 2);
    const gap = 1 + ((n >> 2) % 2) + (i % 2 ? 0 : 1);
    return { bar, gap };
  });
  return (
    <div className="mt-1 flex h-10 items-stretch overflow-hidden" aria-hidden>
      {pairs.map((p, i) => (
        <Fragment key={i}>
          <div style={{ width: p.bar }} className="h-full shrink-0 bg-slate-800" />
          <div style={{ width: p.gap }} className="h-full shrink-0" />
        </Fragment>
      ))}
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
  const college = COLLEGES.find((c) => c.id === profile.college);

  return (
    <div className="print:bg-white">
      <div className="hidden print:block">
        <h1 className="text-center text-2xl font-bold mb-6">
          <Logo className="inline-block h-8 w-8 rounded-lg mr-2 align-[-3px]" />
          {t("appName")} - {t("idCard.title")}
        </h1>
      </div>

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
              className={`id-card-inner relative transition-transform duration-700 [transform-style:preserve-3d] ${
                flipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <div className="id-card-front [backface-visibility:hidden] rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-4 flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                    <Logo className="h-full w-full rounded-lg" />
                  </div>
                  <div className="text-white">
                    <p className="font-bold leading-tight">{t("appName")}</p>
                    <p className="text-[11px] opacity-80">
                      {t("idCard.cardholder")}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5">
                  <p className="text-lg font-bold text-slate-800">
                    {profile.full_name}
                  </p>
                  <p className="text-xs text-slate-400 mb-4">{profile.email}</p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px]">
                        {t("idCard.regNo")}
                      </p>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {profile.reg_no ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px]">
                        {t("idCard.yearOfStudy")}
                      </p>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {profile.year_of_study
                          ? `Year ${profile.year_of_study}`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px]">
                        {t("idCard.program")}
                      </p>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {program?.name ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px]">
                        {t("idCard.phone")}
                      </p>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {profile.phone ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-5 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                        {t("idCard.expires")}
                      </p>
                      <p className="text-xs font-semibold text-slate-600">
                        2027-07-31
                      </p>
                    </div>
                    {qrUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrUrl}
                        alt="QR"
                        className="h-16 w-16 rounded-lg border border-slate-200"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="id-card-back absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                <div className="h-10 bg-slate-800 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex w-full gap-2 px-6">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} className="h-4 w-4 rounded-full bg-slate-700" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 flex h-[calc(100%-2.5rem)] flex-col">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                    {t("idCard.magneticStripe")}
                  </p>

                  <div className="mt-4">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      {t("idCard.signature")}
                    </p>
                    <svg viewBox="0 0 220 40" className="mt-1 h-9 w-full max-w-[200px]">
                      <path
                        d="M6 30 C 28 6, 44 36, 70 22 S 104 8, 128 24 S 158 12, 176 22 S 202 30, 214 14"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      {t("idCard.barcode")}
                    </p>
                    <Barcode value={profile.reg_no ?? ""} />
                  </div>

                  <p className="mt-4 text-[10px] leading-relaxed text-slate-500 border-t border-slate-100 pt-3">
                    {t("idCard.terms")}
                  </p>

                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                        {t("idCard.ifFound")}
                      </p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">
                        {college?.name ?? t("appName")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                        {t("idCard.helpdesk")}
                      </p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        support@medconnectme.local
                      </p>
                    </div>
                  </div>
                </div>
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
    </div>
  );
}
