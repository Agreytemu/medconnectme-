"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Field, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { t } = useLang();
  const profile = useProfile();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile.full_name,
    phone: profile.phone ?? "",
    reg_no: profile.reg_no ?? "",
    year_of_study: profile.year_of_study ?? 1,
    gender: profile.gender ?? "",
    dob: profile.dob ?? "",
    address: profile.address ?? "",
  });

  const update = (key: keyof typeof form, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("profiles").update(form).eq("id", profile.id);
    setSaving(false);
    setEditing(false);
    window.location.reload();
  };

  const infoRow = (label: string, value: string) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-700 text-right">{value || t("common.notSet")}</span>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={t("profile.title")}
        subtitle={t("profile.subtitle")}
        action={
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            {t("profile.editProfile")}
          </Button>
        }
      />

      <Card className="overflow-hidden mb-4">
        <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <div className="px-5 pb-5 -mt-10">
          <div className="h-20 w-20 rounded-2xl bg-white p-1 shadow">
            <div className="h-full w-full rounded-xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold">
              {profile.full_name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{profile.full_name}</h2>
              <p className="text-xs text-slate-400">{profile.email}</p>
            </div>
            <Badge variant={profile.role === "admin" ? "purple" : "green"}>
              {profile.role === "admin" ? t("auth.admin") : t("auth.student")}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.personalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            {infoRow(t("profile.fullName"), profile.full_name)}
            {infoRow(t("profile.gender"), profile.gender ?? "")}
            {infoRow(t("profile.dob"), profile.dob ? formatDate(profile.dob) : "")}
            {infoRow(t("profile.address"), profile.address ?? "")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.contactInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            {infoRow(t("profile.email"), profile.email)}
            {infoRow(t("profile.phone"), profile.phone ?? "")}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("profile.academicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            {infoRow(t("profile.regNo"), profile.reg_no ?? "")}
            {infoRow(t("profile.yearOfStudy"), profile.year_of_study ? `Year ${profile.year_of_study}` : "")}
          </CardContent>
        </Card>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title={t("profile.editProfile")}>
        <div className="space-y-4">
          <Field label={t("profile.fullName")}>
            <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
          </Field>
          <Field label={t("profile.phone")}>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
          <Field label={t("profile.regNo")}>
            <Input value={form.reg_no} onChange={(e) => update("reg_no", e.target.value)} />
          </Field>
          <Field label={t("profile.yearOfStudy")}>
            <Input
              type="number"
              min={1}
              max={7}
              value={form.year_of_study}
              onChange={(e) => update("year_of_study", Number(e.target.value))}
            />
          </Field>
          <Field label={t("profile.gender")}>
            <Select value={form.gender} onChange={(e) => update("gender", e.target.value)}>
              <option value="">{t("common.none")}</option>
              <option value="male">{t("caseLogs.male")}</option>
              <option value="female">{t("caseLogs.female")}</option>
              <option value="other">{t("caseLogs.other")}</option>
            </Select>
          </Field>
          <Field label={t("profile.dob")}>
            <Input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
          </Field>
          <Field label={t("profile.address")}>
            <Textarea rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} />
          </Field>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleSave} loading={saving}>
              {t("common.save")}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
