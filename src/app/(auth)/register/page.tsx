"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { FloatingInput, FloatingSelect } from "@/components/ui/floating-input";
import { Logo } from "@/components/ui/logo";
import { COLLEGES, PROGRAMS } from "@/lib/constants/education";
import { isDemoMode } from "@/lib/demo/config";
import { setDemoCookie } from "@/lib/demo/session";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  const { t } = useLang();
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [course, setCourse] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError(t("auth.passwordMin"));
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "student",
          reg_no: regNo,
          college,
          program_id: course,
          year_of_study: Number(yearOfStudy),
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          reg_no: regNo,
          phone: phone || null,
          college,
          program_id: course,
          year_of_study: Number(yearOfStudy),
        })
        .eq("id", data.user.id);

      if (isDemoMode()) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        if (profile) setDemoCookie(profile as never);
      }
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthShell>
      <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <Logo className="h-20 w-20 rounded-2xl shadow-lg shadow-emerald-600/30 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">
              {t("auth.registerTitle")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t("auth.registerSubtitle")}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <FloatingInput
              label={t("auth.fullName")}
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <FloatingInput
              label={t("auth.regNo")}
              required
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
            <FloatingInput
              label={t("auth.email")}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FloatingInput
              label={t("auth.phone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <FloatingSelect
              label={t("auth.college")}
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            >
              {COLLEGES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </FloatingSelect>
            <FloatingSelect
              label={t("auth.yearOfStudy")}
              required
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((y) => (
                <option key={y} value={y}>
                  {t("auth.yearPrefix")} {y}
                </option>
              ))}
            </FloatingSelect>
            <FloatingSelect
              label={t("auth.course")}
              required
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            >
              {(["degree", "diploma", "certificate"] as const).map((level) => (
                <optgroup key={level} label={t(`auth.${level}`)}>
                  {PROGRAMS.filter((p) => p.level === level).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </FloatingSelect>
            <FloatingInput
              label={t("auth.password")}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {t("auth.createAccount")}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="text-emerald-600 font-semibold">
              {t("auth.login")}
            </Link>
          </p>
        </div>
    </AuthShell>
  );
}
