"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, GraduationCap, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { GitHubInput, GitHubSelect } from "@/components/ui/github-input";
import { COLLEGES, PROGRAMS } from "@/lib/constants/education";
import { isDemoMode, demoCredentials } from "@/lib/demo/config";
import { setDemoCookie } from "@/lib/demo/session";

type Mode = "login" | "register";

export function AuthScreen({ initialMode }: { initialMode: Mode }) {
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <div className="flex h-full w-full">
      <aside className="hidden lg:flex lg:w-1/2 flex-col justify-center bg-gradient-to-br from-emerald-600 to-teal-500 p-12 text-white">
        <Logo className="h-14 w-14 rounded-2xl bg-white/15 p-2 mb-8" />
        <h1 className="max-w-md text-4xl font-bold leading-tight">
          {mode === "login" ? t("auth.loginMotto") : t("auth.registerMotto")}
        </h1>
        <p className="mt-4 max-w-md text-emerald-50/90">
          {mode === "login" ? t("auth.loginMottoSub") : t("auth.registerMottoSub")}
        </p>
      </aside>

      <div className="flex flex-1 items-center justify-center overflow-y-auto p-4 lg:p-8">
        <div className="my-auto w-full max-w-[400px] rounded-md border border-[#d0d7de] bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "login"
                ? t("auth.loginSubtitle")
                : t("auth.registerSubtitle")}
            </p>
          </div>

          <div className="mb-6 flex gap-6 border-b border-[#d0d7de]">
            <ToggleButton
              active={mode === "login"}
              onClick={() => setMode("login")}
              label={t("auth.login")}
            />
            <ToggleButton
              active={mode === "register"}
              onClick={() => setMode("register")}
              label={t("auth.register")}
            />
          </div>

          {mode === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "-mb-px border-b-2 pb-2.5 pt-0.5 text-sm font-medium transition-colors " +
        (active
          ? "border-emerald-600 text-slate-900"
          : "border-transparent text-slate-500 hover:text-slate-700")
      }
    >
      {label}
    </button>
  );
}

function LoginForm() {
  const { t } = useLang();
  const router = useRouter();
  const supabase = createClient();
  const demo = isDemoMode();
  const creds = demoCredentials();

  const [email, setEmail] = useState(demo ? creds.student.email : "");
  const [password, setPassword] = useState(demo ? creds.student.password : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishLogin = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (demo && profile) {
      setDemoCookie(profile as never);
    }
    router.push(profile?.role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  };

  const handleLogin = async (
    e?: React.FormEvent,
    credentials?: { email: string; password: string }
  ) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials?.email ?? email,
      password: credentials?.password ?? password,
    });

    if (error || !data.user) {
      setError(t("auth.invalidCredentials"));
      setLoading(false);
      return;
    }

    await finishLogin(data.user.id);
  };

  const loginAs = (role: "student" | "admin") => {
    const c = role === "student" ? creds.student : creds.admin;
    setEmail(c.email);
    setPassword(c.password);
    void handleLogin(undefined, c);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <GitHubInput
        label={t("auth.email")}
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <GitHubInput
        label={t("auth.password")}
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="auth" className="w-full" loading={loading}>
        {t("auth.login")}
      </Button>

      {demo && (
        <div className="mt-2 rounded-md border border-[#d0d7de] bg-slate-50 p-4">
          <div className="mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-slate-800">
              {t("auth.demoLabel")}
            </p>
          </div>
          <p className="mb-3 text-xs text-slate-500">{t("auth.demoHint")}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginAs("student")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-md border border-[#d0d7de] bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
            >
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              {t("auth.demoStudent")}
            </button>
            <button
              type="button"
              onClick={() => loginAs("admin")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-md border border-[#d0d7de] bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {t("auth.demoAdmin")}
            </button>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            {creds.student.email} / {creds.student.password} •{" "}
            {creds.admin.email} / {creds.admin.password}
          </p>
        </div>
      )}
    </form>
  );
}

function RegisterForm() {
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
    <form onSubmit={handleRegister} className="space-y-4">
      <GitHubInput
        label={t("auth.fullName")}
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <GitHubInput
        label={t("auth.regNo")}
        required
        value={regNo}
        onChange={(e) => setRegNo(e.target.value)}
      />
      <GitHubInput
        label={t("auth.email")}
        type="email"
        required
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <GitHubInput
        label={t("auth.phone")}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <GitHubSelect
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
      </GitHubSelect>
      <GitHubSelect
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
      </GitHubSelect>
      <GitHubSelect
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
      </GitHubSelect>
      <GitHubInput
        label={t("auth.password")}
        type="password"
        required
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="auth" className="w-full" loading={loading}>
        {t("auth.createAccount")}
      </Button>
    </form>
  );
}
