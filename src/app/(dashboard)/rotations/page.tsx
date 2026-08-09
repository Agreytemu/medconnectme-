"use client";

import { useMemo, useState } from "react";
import {
  Stethoscope,
  Plus,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";
import type { ClinicalRotation, RotationHour, RotationWithHours } from "@/lib/types";

export default function RotationsPage() {
  const { t } = useLang();
  const profile = useProfile();
  const supabase = createClient();

  const { data, loading, refetch } = useAsync(async () => {
    const { data: rotations } = await supabase
      .from("clinical_rotations")
      .select("*")
      .eq("student_id", profile.id)
      .order("start_date", { ascending: false });

    const list = (rotations ?? []) as ClinicalRotation[];
    const ids = list.map((r) => r.id);
    let hours: RotationHour[] = [];
    if (ids.length) {
      const { data: h } = await supabase
        .from("rotation_hours")
        .select("*")
        .in("rotation_id", ids)
        .order("date", { ascending: false });
      hours = (h ?? []) as RotationHour[];
    }

    const withHours: RotationWithHours[] = list.map((r) => {
      const rh = hours.filter((x) => x.rotation_id === r.id);
      return {
        ...r,
        hours: rh,
        total_hours: rh.reduce((a, x) => a + Number(x.hours), 0),
      };
    });

    return withHours;
  }, []);

  const [logRotationId, setLogRotationId] = useState<string | null>(null);
  const [logForm, setLogForm] = useState({ date: new Date().toISOString().slice(0, 10), hours: 8, activity: "Ward rounds", note: "" });
  const [saving, setSaving] = useState(false);

  const totalHours = useMemo(
    () => (data ?? []).reduce((a, r) => a + r.total_hours, 0),
    [data]
  );
  const activeCount = useMemo(
    () => (data ?? []).filter((r) => r.status === "active").length,
    [data]
  );
  const chartData = useMemo(
    () =>
      (data ?? []).map((r) => ({
        name: r.department.length > 10 ? r.department.slice(0, 10) + "…" : r.department,
        hours: Number(r.total_hours.toFixed(1)),
      })),
    [data]
  );

  const handleLogHours = async () => {
    if (!logRotationId) return;
    setSaving(true);
    const { error } = await supabase.from("rotation_hours").insert({
      rotation_id: logRotationId,
      date: logForm.date,
      hours: logForm.hours,
      activity: logForm.activity,
      note: logForm.note || null,
    });
    if (!error) {
      setLogRotationId(null);
      refetch();
    }
    setSaving(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title={t("rotations.title")} subtitle={t("rotations.subtitle")} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label={t("rotations.totalHours")} value={totalHours.toFixed(0)} icon={<Clock className="h-5 w-5" />} />
        <StatCard label={t("nav.rotations")} value={data?.length ?? 0} icon={<Stethoscope className="h-5 w-5" />} />
        <StatCard label={t("rotations.statusLabel.active")} value={activeCount} />
      </div>

      {chartData.length > 1 && (
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>{t("rotations.hoursChart")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4 mt-5">
        {data && data.length > 0 ? (
          data.map((rotation) => {
            const badge = statusBadge(rotation.status, () => t(`rotations.statusLabel.${rotation.status}`));
            const progress = rotation.hours_required
              ? Math.min(100, Math.round((rotation.total_hours / rotation.hours_required) * 100))
              : 0;
            return (
              <Card key={rotation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{rotation.department}</p>
                        <p className="text-xs text-slate-400">{rotation.hospital ?? t("common.notSet")}</p>
                      </div>
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <p className="text-[10px] text-slate-400 uppercase">{t("rotations.startDate")}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatDate(rotation.start_date)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <p className="text-[10px] text-slate-400 uppercase">{t("rotations.endDate")}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatDate(rotation.end_date)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <p className="text-[10px] text-slate-400 uppercase">{t("rotations.supervisor")}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">{rotation.supervisor ?? "-"}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500">
                        {t("rotations.completedHours")}:{" "}
                        <b className="text-slate-800">{rotation.total_hours.toFixed(1)}</b>
                        {rotation.hours_required ? ` / ${rotation.hours_required}` : ""}
                      </span>
                      <span className="font-semibold text-emerald-600">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-slate-400">
                      {rotation.hours.length} {t("rotations.hoursLogged")}
                    </p>
                    {rotation.status !== "completed" && (
                      <Button size="sm" onClick={() => setLogRotationId(rotation.id)}>
                        <Plus className="h-4 w-4" />
                        {t("rotations.logHours")}
                      </Button>
                    )}
                  </div>

                  {rotation.hours.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {rotation.hours.slice(0, 5).map((h) => (
                        <div key={h.id} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                          <div>
                            <span className="text-slate-700 font-medium">{formatDate(h.date)}</span>
                            <span className="text-slate-400 ml-2">{h.activity ?? ""}</span>
                          </div>
                          <span className="font-semibold text-emerald-600">{h.hours}h</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <EmptyState title={t("rotations.noRotations")} icon={<Stethoscope className="h-6 w-6" />} />
          </Card>
        )}
      </div>

      <Modal open={!!logRotationId} onClose={() => setLogRotationId(null)} title={t("rotations.addHours")}>
        <div className="space-y-4">
          <Field label={t("rotations.date")}>
            <Input type="date" value={logForm.date} onChange={(e) => setLogForm({ ...logForm, date: e.target.value })} />
          </Field>
          <Field label={t("rotations.hours")}>
            <Input
              type="number"
              min={0.5}
              step={0.5}
              value={logForm.hours}
              onChange={(e) => setLogForm({ ...logForm, hours: Number(e.target.value) })}
            />
          </Field>
          <Field label={t("rotations.activity")}>
            <Input value={logForm.activity} onChange={(e) => setLogForm({ ...logForm, activity: e.target.value })} />
          </Field>
          <Field label={t("attendance.note")}>
            <Input value={logForm.note} onChange={(e) => setLogForm({ ...logForm, note: e.target.value })} />
          </Field>
          <Button className="w-full" onClick={handleLogHours} loading={saving}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
