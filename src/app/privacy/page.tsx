import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MedConnectMe handles your data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-slate-900/[0.06] px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 rounded-lg" />
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            MedConnectMe
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          Back to home
        </Link>
      </header>
      <article className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-slate-500">Last updated: 21 August 2026</p>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-slate-700">
          <p>
            MedConnectMe is built around the daily rhythm of medical school. This
            policy explains what information we handle and why.
          </p>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              Information we store
            </h2>
            <p>
              Your account profile, timetable, results, rotation hours, case
              logs, formulary lookups and notices are stored in your
              institution&apos;s own Supabase project. Students can only see their
              own records.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              Contact messages
            </h2>
            <p>
              Messages you send through the contact form are delivered to the
              MedConnectMe team by email and are never sold or shared with third
              parties.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              Your choices
            </h2>
            <p>
              You can request access to or deletion of your data by contacting us
              through the contact page.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
