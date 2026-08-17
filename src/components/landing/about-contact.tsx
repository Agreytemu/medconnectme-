"use client";

import type { FormEvent } from "react";
import { Mail, MapPin, Clock, Send } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Panel } from "./scroller";
import { Reveal } from "./reveal";
import { FrameSequence } from "./frame-sequence";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
      {children}
    </p>
  );
}

export function About() {
  const { t } = useLang();
  const captions = [
    { title: t("landing.about.frame1Title"), text: t("landing.about.frame1Text") },
    { title: t("landing.about.frame2Title"), text: t("landing.about.frame2Text") },
    { title: t("landing.about.frame3Title"), text: t("landing.about.frame3Text") },
    { title: t("landing.about.frame4Title"), text: t("landing.about.frame4Text") },
  ];
  return (
    <Panel id="about">
      <FrameSequence captions={captions} />
    </Panel>
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const message = String(data.get("message") || "");
    const subject = `MedConnectMe - ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.href = `mailto:${t(
      "landing.contact.email"
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              >
                <Send className="h-4 w-4" />
                {t("landing.contact.send")}
              </button>
              <p className="text-xs text-slate-500">
                {t("landing.contact.sentNote")}
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </Panel>
  );
}
