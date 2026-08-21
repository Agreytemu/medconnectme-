"use client";

import { useState, type FormEvent } from "react";
import { Mail, MapPin, Clock, Send } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Panel } from "./scroller";
import { Reveal } from "./reveal";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
      {children}
    </p>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-900/[0.06]">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function Contact() {
  const { t } = useLang();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const WEB3FORMS_KEY =
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "YOUR_WEB3FORMS_ACCESS_KEY";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const message = String(data.get("message") || "");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `MedConnectMe - ${name}`,
          name,
          email,
          message,
        }),
      });
      const json = await res.json();
      if (json.success) setSent(true);
      else setError(t("landing.contact.errorGeneric"));
    } catch {
      setError(t("landing.contact.errorGeneric"));
    } finally {
      setSending(false);
    }
  };

  return (
    <Panel id="contact">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Kicker>{t("landing.contact.kicker")}</Kicker>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            {t("landing.contact.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-slate-600">
            {t("landing.contact.body")}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              <ContactItem
                icon={Mail}
                label={t("landing.contact.emailLabel")}
                value={t("landing.contact.email")}
              />
              <ContactItem
                icon={MapPin}
                label={t("landing.contact.locationLabel")}
                value={t("landing.contact.location")}
              />
              <ContactItem
                icon={Clock}
                label={t("landing.contact.hoursLabel")}
                value={t("landing.contact.hours")}
              />
            </div>
          </Reveal>

          <Reveal delay={80}>
            {sent ? (
              <div className="flex h-full flex-col items-start justify-center rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-200">
                <p className="text-lg font-semibold text-emerald-800">
                  {t("landing.contact.sentTitle")}
                </p>
                <p className="mt-2 text-sm text-emerald-700">
                  {t("landing.contact.sentBody")}
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-900/[0.06]"
              >
                <input
                  name="name"
                  required
                  placeholder={t("landing.contact.nameLabel")}
                  className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder={t("landing.contact.emailFieldLabel")}
                  className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder={t("landing.contact.messageLabel")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {error && (
                  <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {sending ? t("landing.contact.sending") : t("landing.contact.send")}
                </button>
                <p className="text-xs text-slate-500">
                  {t("landing.contact.sentNote")}
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </Panel>
  );
}
