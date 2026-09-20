import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { LoggaInEn } from "./logga-in-en";
import { SIFFROR } from "@/lib/siffror";

export const dynamic = "force-static";

/**
 * ENGLISH MIRROR of /logga-in (Våg 51 agent S2).
 *
 * The page chrome is translated here; the interactive form lives in the
 * colocated client component logga-in-en.tsx (same API + member storage
 * as the Swedish form, English strings). Standalone copy — no shared
 * strings with the Swedish page.
 */
export const metadata: Metadata = {
  title: "Log in — free account, all courses unlocked | AK1A",
  description: `Log in with email or create a free account: all ${SIFFROR.kurser} courses, the calculator and the portfolio system — completely free, forever.`,
  keywords: ["log in", "free account", "free stock market education", "AK1A"],
  alternates: {
    canonical: `${SITE_URL}/en/logga-in`,
    languages: {
      "sv-SE": `${SITE_URL}/logga-in`,
      en: `${SITE_URL}/en/logga-in`,
      ar: `${SITE_URL}/ar/logga-in`,
      "x-default": `${SITE_URL}/logga-in`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Log in — free account, all courses unlocked | AK1A",
    description:
      "One email unlocks everything in Phase 1 — completely free, forever.",
    url: `${SITE_URL}/en/logga-in`,
    siteName: "AK1A Research Lab",
    type: "website",
    locale: "en_US",
    alternateLocale: ["sv_SE", "ar_AR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Log in — free account | AK1A",
    description: `All ${SIFFROR.kurser} courses, the calculator and the portfolio system — free forever.`,
  },
};

export default function EnLoggaInPage() {
  return (
    <SeoPageShell lang="en" breadcrumb={[{ name: "Start", href: "/en" }, { name: "Log in" }]}>
      <h1 className="text-center font-serif text-4xl font-bold">Welcome to AK1A</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground leading-relaxed">
        Institutional methodology — as a right. One account unlocks everything
        in Phase 1, completely free. Your progress is saved and you earn XP
        and stars for every course.
      </p>
      <div className="mt-10">
        <LoggaInEn />
      </div>
    </SeoPageShell>
  );
}
