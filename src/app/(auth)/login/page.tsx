"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartPulse, Sparkles, GraduationCap, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { isDemoMode, demoCredentials } from "@/lib/demo/config";
import { setDemoCookie } from "@/lib/demo/session";

export const dynamic = "force-dynamic";

export default function LoginPage() {
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
    <AuthShell>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/30">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{t("appName")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("auth.loginSubtitle")}</p>
        </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <FloatingInput
              label={t("auth.email")}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FloatingInput
              label={t("auth.password")}
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {t("auth.login")}
            </Button>
          </form>

          {demo && (
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-semibold">{t("auth.demoLabel")}</p>
              </div>
              <p className="text-xs text-emerald-50/90 mb-3">
                {t("auth.demoHint")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => loginAs("student")}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  <GraduationCap className="h-4 w-4" />
                  {t("auth.demoStudent")}
                </button>
                <button
                  type="button"
                  onClick={() => loginAs("admin")}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t("auth.demoAdmin")}
                </button>
              </div>
              <p className="text-[11px] text-emerald-50/80 mt-3">
                {creds.student.email} / {creds.student.password} •{" "}
                {creds.admin.email} / {creds.admin.password}
              </p>
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-emerald-600 font-semibold">
              {t("auth.register")}
            </Link>
          </p>
        </div>
    </AuthShell>
  );
}
