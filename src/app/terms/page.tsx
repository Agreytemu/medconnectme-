import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of MedConnectMe.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-slate-500">Last updated: 21 August 2026</p>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-slate-700">
          <p>
            MedConnectMe helps medical students organise their training. By using
            the service you agree to the terms below.
          </p>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Your account</h2>
            <p>
              You are responsible for keeping your login details safe. Do not
              share your account, and let your institution know if you suspect
              misuse.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              Acceptable use
            </h2>
            <p>
              Use MedConnectMe for its intended purpose. Do not attempt to
              disrupt the service or access records that are not yours.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              Changes
            </h2>
            <p>
              We may update these terms from time to time. Continued use of the
              service means you accept the current version.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
