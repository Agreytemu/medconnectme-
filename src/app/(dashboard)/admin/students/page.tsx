"use client";

import { useState } from "react";
import { Users, Plus, Pencil, Trash2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useAsync } from "@/lib/hooks/use-async";
import { AdminOnly } from "@/components/admin/admin-only";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Field } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import type { Profile, Program } from "@/lib/types";

const emptyForm = {
  full_name: "",
  email: "",
  reg_no: "",
  password: "",
  phone: "",
  year_of_study: 1,
  program_id: "",
};

export default function AdminStudentsPage() {
  const { t } = useLang();
  const supabase = createClient();

  const { data, loading, refetch } = useAsync(async () => {
    const [studentsRes, programsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false }),
      supabase.from("programs").select("*").order("name", { ascending: true }),
    ]);
    return {
      students: (studentsRes.data ?? []) as Profile[],
      programs: (programsRes.data ?? []) as Program[],
    };
  }, []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (s: Profile) => {
    setEditing(s);
    setForm({
      full_name: s.full_name,
      email: s.email,
      reg_no: s.reg_no ?? "",
      password: "",
      phone: s.phone ?? "",
      year_of_study: s.year_of_study ?? 1,
      program_id: s.program_id ?? "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          reg_no: form.reg_no || null,
          phone: form.phone || null,
          year_of_study: form.year_of_study,
          program_id: form.program_id || null,
        })
        .eq("id", editing.id);
    } else {
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: true,
        user_metadata: { full_name: form.full_name, role: "student", reg_no: form.reg_no },
      });
      if (!error && created?.user) {
        await supabase
          .from("profiles")
          .update({
            full_name: form.full_name,
            reg_no: form.reg_no || null,
            phone: form.phone || null,
            year_of_study: form.year_of_study,
            program_id: form.program_id || null,
          })
          .eq("id", created.user.id);
      }
    }
    setSaving(false);
    setOpen(false);
    refetch();
  };

  const handleDelete = async (s: Profile) => {
    if (!confirm(t("common.confirmDelete"))) return;
    await supabase.auth.admin.deleteUser(s.id);
    refetch();
  };

  const filtered = (data?.students ?? []).filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.reg_no ?? "").toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <AdminOnly>
      <PageHeader
        title={t("admin.studentList")}
        subtitle={t("admin.subtitle")}
        action={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" />
            {t("admin.addStudent")}
          </Button>
        }
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder={t("common.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-3 pl-4 font-medium">{t("common.name")}</th>
                    <th className="py-3 font-medium">{t("profile.regNo")}</th>
                    <th className="py-3 font-medium">{t("auth.email")}</th>
                    <th className="py-3 font-medium">{t("profile.yearOfStudy")}</th>
                    <th className="py-3 pr-4 font-medium text-right">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {s.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{s.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-500">{s.reg_no ?? "-"}</td>
                      <td className="py-3 text-slate-500">{s.email}</td>
                      <td className="py-3">
                        <Badge variant="blue">Year {s.year_of_study ?? "-"}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(s)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title={t("admin.studentList")} icon={<Users className="h-6 w-6" />} />
          )}
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? t("admin.editStudent") : t("admin.addStudent")}
      >
        <div className="space-y-4">
          <Field label={t("auth.fullName")}>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <Field label={t("auth.email")}>
            <Input
              type="email"
              disabled={!!editing}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          {!editing && (
            <Field label={t("auth.password")}>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("auth.regNo")}>
              <Input value={form.reg_no} onChange={(e) => setForm({ ...form, reg_no: e.target.value })} />
            </Field>
            <Field label={t("profile.yearOfStudy")}>
              <Input
                type="number"
                min={1}
                max={7}
                value={form.year_of_study}
                onChange={(e) => setForm({ ...form, year_of_study: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label={t("profile.program")}>
            <Select value={form.program_id} onChange={(e) => setForm({ ...form, program_id: e.target.value })}>
              <option value="">{t("common.none")}</option>
              {(data?.programs ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("auth.phone")}>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Button className="w-full" onClick={handleSave} loading={saving}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </AdminOnly>
  );
}
