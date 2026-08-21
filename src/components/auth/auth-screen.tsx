"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  GraduationCap,
  ShieldCheck,
  CalendarDays,
  Activity,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";
import {
  FaFacebook,
  FaXTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa6";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  GitHubInput,
  GitHubSelect,
  PasswordField,
} from "@/components/ui/github-input";
import { AuthCharacter, type CharStatus } from "@/components/auth/auth-character";
import { COLLEGES, PROGRAMS } from "@/lib/constants/education";
import { isDemoMode, demoCredentials } from "@/lib/demo/config";
import { setDemoCookie } from "@/lib/demo/session";

type Mode = "login" | "register";

const SYSTEM_FONT =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

type Binder = {
  onFocusCapture: (e: React.FocusEvent) => void;
  onBlurCapture: (e: React.FocusEvent) => void;
  onInputCapture: () => void;
  setStatus: (s: CharStatus) => void;
  setPwVisible: (name: string, visible: boolean) => void;
};

export function AuthScreen({ initialMode }: { initialMode: Mode }) {
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>(initialMode);

  const [activeField, setActiveField] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatusState] = useState<CharStatus>("idle");
  const [pwVisible, setPwVisibleState] = useState<Record<string, boolean>>({});
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setStatus = (s: CharStatus) => {
    setStatusState(s);
    if (s === "error" && typingTimer.current) {
      setTimeout(() => setStatusState("idle"), 2600);
    }
  };

  const setPwVisible = (name: string, visible: boolean) =>
    setPwVisibleState((prev) => ({ ...prev, [name]: visible }));

  const onFieldFocus = (name: string | null) => setActiveField(name);
  const onFieldBlur = (name: string | null) =>
    setActiveField((cur) => (cur === name ? null : cur));

  const onType = () => {
    setIsTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsTyping(false), 700);
  };

  const onFocusCapture = (e: React.FocusEvent) => {
    const f = (e.target as HTMLElement).getAttribute("data-field");
    if (f) onFieldFocus(f);
  };
  const onBlurCapture = (e: React.FocusEvent) => {
    const f = (e.target as HTMLElement).getAttribute("data-field");
    if (f) onFieldBlur(f);
  };
  const onInputCapture = () => onType();

  const switchMode = (m: Mode) => {
    setMode(m);
    setActiveField(null);
    setIsTyping(false);
    setStatusState("idle");
    setPwVisibleState({});
  };

  const privacy =
    !!activeField &&
    activeField.startsWith("password") &&
    !pwVisible[activeField];

  const binder: Binder = {
    onFocusCapture,
    onBlurCapture,
    onInputCapture,
    setStatus,
    setPwVisible,
  };

  const features = [
    { icon: CalendarDays, label: t("dashboard.todaySchedule") },
    { icon: GraduationCap, label: t("dashboard.recentResults") },
    { icon: Activity, label: t("dashboard.activeRotation") },
    { icon: ClipboardList, label: t("dashboard.caseLogs") },
  ];

  const SOCIALS = [
    { label: "Facebook", href: "https://www.facebook.com/medconnectme", Icon: FaFacebook },
    { label: "X", href: "https://x.com/medconnectme", Icon: FaXTwitter },
    { label: "Instagram", href: "https://www.instagram.com/medconnectme", Icon: FaInstagram },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/medconnectme", Icon: FaLinkedin },
    { label: "GitHub", href: "https://github.com/medconnectme", Icon: FaGithub },
  ];

  return (
    <div className="relative flex h-full w-full" style={{ fontFamily: SYSTEM_FONT }}>
      {/* Brand / motto panel with diagonal edge (desktop) */}
      <aside
        className="absolute inset-y-0 left-0 hidden w-[46%] lg:block"
        style={{ clipPath: "polygon(0 0, 100% 0, 82% 100%, 0 100%)" }}
      >
        <div className="flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-500 p-8 text-white lg:p-10">
          <div>
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-10 rounded-xl bg-white/15 p-1.5" />
              <span className="text-lg font-semibold">{t("appName")}</span>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
              {mode === "login" ? t("auth.loginMotto") : t("auth.registerMotto")}
            </h1>
            <p className="mt-4 text-sm text-emerald-50/90 lg:text-base">
              {mode === "login"
                ? t("auth.loginMottoSub")
                : t("auth.registerMottoSub")}
            </p>

            <svg
              className="mt-8 w-64 text-white/70"
              viewBox="0 0 320 60"
              fill="none"
              aria-hidden
            >
              <path
                className="hand-draw"
                d="M0 30 H70 L82 30 L92 10 L104 50 L116 22 L126 30 H170 L182 30 L192 14 L204 46 L216 30 H320"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="mt-8 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
                >
                  <s.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <ul className="space-y-2.5">
              {features.map((f) => (
                <li
                  key={f.label}
                  className="flex items-center gap-3 text-sm text-emerald-50/90"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">
                    <f.icon className="h-4 w-4" />
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-emerald-50/70">{t("appTagline")}</p>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 overflow-y-auto p-4 sm:p-6 lg:pl-[48%]">
        <div className="m-auto w-full max-w-[420px]">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Logo className="h-9 w-9 rounded-lg bg-emerald-600 p-1.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {t("appName")}
              </p>
              <p className="text-xs text-slate-500">{t("appTagline")}</p>
            </div>
          </div>

          <div className="rounded-md border border-[#d0d7de] bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {mode === "login"
                    ? t("auth.loginTitle")
                    : t("auth.registerTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {mode === "login"
                    ? t("auth.loginSubtitle")
                    : t("auth.registerSubtitle")}
                </p>
              </div>
              <AuthCharacter
                activeField={activeField}
                isTyping={isTyping}
                status={status}
                privacy={privacy}
              />
            </div>

            <div className="mb-6 flex gap-6 border-b border-[#d0d7de]">
              <ToggleButton
                active={mode === "login"}
                onClick={() => switchMode("login")}
                label={t("auth.login")}
              />
              <ToggleButton
                active={mode === "register"}
                onClick={() => switchMode("register")}
                label={t("auth.register")}
              />
            </div>

            {mode === "login" ? (
              <LoginForm binder={binder} />
            ) : (
              <RegisterForm binder={binder} />
            )}
          </div>
        </div>
      </main>
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

function LoginForm({ binder }: { binder: Binder }) {
  const { t } = useLang();
  const router = useRouter();
  const supabase = createClient();
  const demo = isDemoMode();
  const creds = demoCredentials();

  const [email, setEmail] = useState(demo ? creds.student.email : "");
  const [password, setPassword] = useState(demo ? creds.student.password : "");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mc_remember_email");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const finishLogin = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (demo && profile) {
      setDemoCookie(profile as never);
    }
    if (remember) localStorage.setItem("mc_remember_email", email);
    else localStorage.removeItem("mc_remember_email");
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
    binder.setStatus("loading");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials?.email ?? email,
      password: credentials?.password ?? password,
    });

    if (error || !data.user) {
      setError(t("auth.invalidCredentials"));
      binder.setStatus("error");
      setLoading(false);
      return;
    }

    binder.setStatus("success");
    await finishLogin(data.user.id);
  };

  const loginAs = (role: "student" | "admin") => {
    const c = role === "student" ? creds.student : creds.admin;
    setEmail(c.email);
    setPassword(c.password);
    void handleLogin(undefined, c);
  };

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setResetLoading(false);
    if (error) {
      setError(error.message);
      binder.setStatus("error");
      return;
    }
    setResetSent(true);
    binder.setStatus("success");
  };

  if (forgot) {
    return (
      <form
        onSubmit={sendReset}
        onFocusCapture={binder.onFocusCapture}
        onBlurCapture={binder.onBlurCapture}
        onInputCapture={binder.onInputCapture}
        className="space-y-4"
      >
        <GitHubInput
          label={t("auth.email")}
          name="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {resetSent ? (
          <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {t("auth.resetSent")}
          </p>
        ) : (
          <Button type="submit" size="auth" className="w-full" loading={resetLoading}>
            {t("auth.resetPassword")}
          </Button>
        )}
        <button
          type="button"
          onClick={() => setForgot(false)}
          className="inline-flex items-center gap-1.5 text-sm text-emerald-600 transition-colors hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth.backToSignIn")}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleLogin}
      onFocusCapture={binder.onFocusCapture}
      onBlurCapture={binder.onBlurCapture}
      onInputCapture={binder.onInputCapture}
      className="space-y-4"
    >
      <GitHubInput
        label={t("auth.email")}
        name="email"
        type="email"
        required
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <PasswordField
        label={t("auth.password")}
        name="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        showLabel={t("auth.showPassword")}
        hideLabel={t("auth.hidePassword")}
        onVisibilityChange={(v) => binder.setPwVisible("password", v)}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-[#d0d7de] text-emerald-600 focus:ring-emerald-500"
          />
          {t("auth.rememberMe")}
        </label>
        <button
          type="button"
          onClick={() => setForgot(true)}
          className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
        >
          {t("auth.forgotPassword")}
        </button>
      </div>

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

function RegisterForm({ binder }: { binder: Binder }) {
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
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    binder.setStatus("loading");

    if (password.length < 6) {
      setError(t("auth.passwordMin"));
      binder.setStatus("error");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError(t("auth.passwordsMismatch"));
      binder.setStatus("error");
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
      binder.setStatus("error");
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

    binder.setStatus("success");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleRegister}
      onFocusCapture={binder.onFocusCapture}
      onBlurCapture={binder.onBlurCapture}
      onInputCapture={binder.onInputCapture}
      className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2"
    >
      <GitHubInput
        label={t("auth.fullName")}
        name="fullName"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <GitHubInput
        label={t("auth.regNo")}
        name="regNo"
        required
        value={regNo}
        onChange={(e) => setRegNo(e.target.value)}
      />
      <GitHubInput
        label={t("auth.email")}
        name="email"
        type="email"
        required
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <GitHubInput
        label={t("auth.phone")}
        name="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <GitHubSelect
        label={t("auth.college")}
        name="college"
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
        name="year"
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
        name="course"
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
      <PasswordField
        label={t("auth.password")}
        name="password"
        required
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        showLabel={t("auth.showPassword")}
        hideLabel={t("auth.hidePassword")}
        onVisibilityChange={(v) => binder.setPwVisible("password", v)}
      />
      <PasswordField
        label={t("auth.confirmPassword")}
        name="confirmPassword"
        required
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        showLabel={t("auth.showPassword")}
        hideLabel={t("auth.hidePassword")}
        onVisibilityChange={(v) => binder.setPwVisible("confirmPassword", v)}
      />

      {error && (
        <p className="col-span-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="auth" className="col-span-2 w-full" loading={loading}>
        {t("auth.createAccount")}
      </Button>
    </form>
  );
}
