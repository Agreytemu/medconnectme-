import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://medconnectme.app"),
  title: {
    default: "MedConnectMe — Dashboard for Medical Students",
    template: "%s — MedConnectMe",
  },
  description:
    "A quiet place for the daily work of medical school - timetable, results, rotations, case logs, drug formulary and your student ID, in English or Kiswahili.",
  keywords: [
    "medical school",
    "medical students",
    "dashboard",
    "timetable",
    "results",
    "rotations",
    "case logs",
    "MedConnectMe",
  ],
  openGraph: {
    type: "website",
    url: "https://medconnectme.app",
    siteName: "MedConnectMe",
    title: "MedConnectMe — Dashboard for Medical Students",
    description:
      "Timetable, results, rotations, case logs, drug formulary and your student ID in one calm place.",
    images: [
      { url: "/icon.png", width: 512, height: 512, alt: "MedConnectMe" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MedConnectMe — Dashboard for Medical Students",
    description:
      "Timetable, results, rotations, case logs, drug formulary and your student ID in one calm place.",
    images: ["/icon.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
