"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { formatTime, DAYS_OF_WEEK, DAYS_OF_WEEK_SHORT } from "@/lib/utils";
import type { TimetableEntry } from "@/lib/types";

export default function TimetablePage() {
  const { t } = useLang();
  const profile = useProfile();
  const supabase = createClient();
  const todayIdx = (new Date().getDay() + 6) % 7;
  const [activeDay, setActiveDay] = useState(todayIdx);

  const { data: entries, loading } = useAsync(async () => {
    const q = supabase
      .from("timetable_entries")
      .select("*")
      .order("start_time", { ascending: true });
    if (profile.program_id) {
      q.eq("program_id", profile.program_id);
    }
    const { data } = await q;
    return (data ?? []) as TimetableEntry[];
  }, [profile.program_id]);

  const byDay = useMemo(() => {
    const map: Record<number, TimetableEntry[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    (entries ?? []).forEach((e) => {
      map[e.day_of_week]?.push(e);
    });
    return map;
  }, [entries]);

  if (loading) return <PageLoader />;

  const dayEntries = byDay[activeDay] ?? [];

  return (
    <div>
      <PageHeader title={t("timetable.title")} subtitle={t("timetable.subtitle")} />

      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {DAYS_OF_WEEK.map((day, idx) => (
          <button
            key={day}
            onClick={() => setActiveDay(idx)}
            className={`rounded-xl py-2 text-xs font-semibold transition-colors ${
              activeDay === idx
                ? "bg-emerald-600 text-white shadow"
                : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span className="hidden sm:inline">{t(`timetable.${DAYS_OF_WEEK_SHORT[idx].toLowerCase()}`)}</span>
            <span className="sm:hidden">{DAYS_OF_WEEK_SHORT[idx]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {dayEntries.length > 0 ? (
          dayEntries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  <div className="h-14 w-16 shrink-0 rounded-xl bg-emerald-50 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-emerald-700">
                      {formatTime(entry.start_time)}
                    </span>
                    <span className="text-[10px] text-emerald-500">
                      {formatTime(entry.end_time)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {entry.title}
                      </p>
                      <Badge variant="blue">{t(`timetable.typeLabel.${entry.type}`)}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-400">
                      {entry.location && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> {entry.location}
                        </span>
                      )}
                      {entry.teacher && <span>{entry.teacher}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <EmptyState
              title={t("timetable.noClasses")}
              icon={<CalendarDays className="h-6 w-6" />}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
