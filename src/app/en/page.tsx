import type { Metadata } from "next";
import Link from "next/link";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { JsonLd, SITE_URL, SITE_NAME } from "@/lib/seo";
import { SIFFROR } from "@/lib/siffror";

export const dynamic = "force-static";

/** English thousand grouping (en-US: 8,211). */
const num = (n: number) => n.toLocaleString("en-US");

/**
 * ENGLISH MIRROR of the start page (Våg 51 agent S2).
 *
 * The Swedish start page (/) is the SPA client app; this mirror is a fully
 * server-rendered welcome page carrying the same message in English:
 * hero + numbers band (live figures from src/lib/siffror.ts — NEVER
 * hardcoded) + the vision text + LEARN/ANALYSE/PRACTICE sections linking
 * to the Swedish tool pages (translated in a later phase) + login CTA.
 *
 * All copy is standalone English — no shared strings with the Swedish pages.
 */
export const metadata: Metadata = {
  title: "AK1A Research Lab — From Education to Income | Ak1 Apex Nexus",
  description:
    "Sweden's only institutional methodology, built for private individuals. Deeper than a blog. Clearer than a bank. Faster than a degree. Educational financial analysis — never investment advice.",
  keywords: [
    "stock analysis",
    "fundamental analysis",
    "institutional methodology",
    "AKM1",
    "learn stock analysis",
    "Swedish stocks",
    "value investing",
  ],
  alternates: {
    canonical: `${SITE_URL}/en`,
    languages: {
      "sv-SE": SITE_URL,
      en: `${SITE_URL}/en`,
      ar: `${SITE_URL}/ar`,
      "x-default": SITE_URL,
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
    title: "AK1A Research Lab — From Education to Income | Ak1 Apex Nexus",
    description:
      "Deeper than a blog. Clearer than a bank. Faster than a degree. Keep the know-how — we publish generously.",
    url: `${SITE_URL}/en`,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    alternateLocale: ["sv_SE", "ar_AR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AK1A Research Lab — From Education to Income",
    description:
      "Sweden's only institutional methodology, built for private individuals.",
  },
};

/** Numbers band — every figure from the single source of truth (src/lib/siffror.ts). */
const BAND = [
  {
    tal: num(SIFFROR.kurser),
    etikett: "courses",
    undertext: "From the basics of bookkeeping to AK1TS wave theory.",
    href: "/kurser",
  },
  {
    tal: num(SIFFROR.quiz),
    etikett: "quiz questions",
    undertext: "Every course ends with a quiz that pinpoints your knowledge gaps.",
    href: "/kurser",
  },
  {
    tal: num(SIFFROR.bokmaster),
    etikett: "canon books",
    undertext: "From Security Analysis to Poor Charlie's Almanack.",
    href: "/kurser",
  },
  {
    tal: "0",
    suffix: " kr",
    etikett: "to start",
    undertext: "Phase 1 is free — forever. No card, no lock-in.",
    href: "/en/medlemskap",
  },
];

/** LEARN / ANALYSE / PRACTICE — the site's task structure, links to the Swedish tools. */
const SEKTIONER = [
  {
    ikon: "🎓",
    titel: "LEARN",
    punkter: [
      { text: "The Curriculum", href: "/laroplan", undertext: "Five levels → independent analyst" },
      { text: "All Courses", href: "/kurser", undertext: "The entire library with quizzes — BOKMASTER included" },
      { text: "The Library", href: "/bibliotek", undertext: "The book canon, mapped to AKM1/AK1TS" },
      { text: "The Labs", href: "/labb", undertext: "Research cases — successes and failures" },
      { text: "Certificates", href: "/certifikat", undertext: "Your proof of competence, levels A–D" },
    ],
  },
  {
    ikon: "🔬",
    titel: "ANALYSE",
    punkter: [
      { text: "The AKM1 Calculator", href: "/kalkylator", undertext: "20 fundamental variables · V01–V20" },
      { text: "The Wave Foundation", href: "/vagfundament", undertext: "Fundamental waves — every variable as a time series" },
      { text: "The Confluence Radar", href: "/konfluens", undertext: "Where value meets waves" },
      { text: "The Net-Net Scanner", href: "/netnet", undertext: "Graham's cigar butts — live NCAV screening" },
      { text: "The Super Analysis", href: "/superanalys", undertext: "Guided 24-step analysis · AKM1 + AK1TS" },
      { text: "The Portfolio Builder", href: "/portfoljbyggare", undertext: "Build visually — see risk and diversification live" },
    ],
  },
  {
    ikon: "🎯",
    titel: "PRACTICE",
    punkter: [
      { text: "Today's Session", href: "/dagens-pass", undertext: "Five minutes of daily market training" },
      { text: "The Leaderboard", href: "/topplista", undertext: "Students ranked by XP" },
      { text: "Badges & Merits", href: "/badges", undertext: "Trophies to earn" },
      { text: "Phase 3 — Certification", href: "/fas3", undertext: "Certified AK1A analyst — practice portfolio and ethics" },
    ],
  },
];

export default function EnStartPage() {
  return (
    <SeoPageShell wide breadcrumb={[{ name: "Start", href: "/en" }, { name: "English" }]}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "AK1A Research Lab — From Education to Income",
          inLanguage: "en",
          url: `${SITE_URL}/en`,
          description:
            "Server-rendered English welcome page: institutional-grade stock analysis education for private individuals. Educational financial analysis — never investment advice.",
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        }}
      />

      {/* ── 1 · HERO — marine certificate opening ─────────────────────────── */}
      <section className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-2 sm:p-3">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
        <div className="relative rounded-xl border border-[#E8C766]/20 p-8 sm:p-12">
          <div className="flex items-center gap-3">
            <VarumarkesLogo storlek="sm" medText={false} />
            <p className="flex flex-wrap items-baseline gap-x-4 font-serif text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
              <span>A · K · 1 · A</span>
              <span>R E S E A R C H</span>
              <span>L A B</span>
            </p>
          </div>

          <h1 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-[1.05] tracking-tight text-[#EDE6D6] text-balance sm:text-5xl lg:text-6xl">
            Become the analyst who sees what others miss.
          </h1>

          <p className="mt-5 max-w-2xl font-serif text-lg italic leading-relaxed text-[#E8C766] sm:text-xl">
            Learn to read companies the way an analyst does — from your first
            annual report to the certificate. {num(SIFFROR.kurser)} courses,{" "}
            {num(SIFFROR.quiz)} quiz questions and the tools that belong with
            them, from day one.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/en/logga-in"
              className="btn-guld-signatur inline-flex items-center gap-2 px-8 py-4 text-base font-bold sm:text-lg"
            >
              Become a member — free <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/kurser"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E8C766]/50 px-6 py-4 text-base font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/10"
            >
              Explore the courses
            </Link>
          </div>

          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-wide text-[#EDE6D6]/70">
            <span>
              <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
              Phase 1 free forever — 0 kr
            </span>
            <span>
              <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
              All courses unlocked immediately
            </span>
            <span>
              <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
              No card required
            </span>
          </p>
        </div>
      </section>

      {/* ── 2 · TRANSLATION NOTICE ────────────────────────────────────────── */}
      <div className="mt-6 rounded-xl border border-dashed border-gold/50 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">A note on languages:</strong>{" "}
        The full course library is currently in Swedish — tools and courses
        are being translated. This page, the membership overview, the
        manifesto, the login and the about page are fully available in
        English. Education, never investment advice — in every language.
      </div>

      {/* ── 3 · NUMBERS BAND — measured figures, single source of truth ───── */}
      <section className="mt-6">
        <h2 className="font-serif text-2xl font-bold">AK1A in numbers</h2>
        <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {BAND.map((s) => (
            <Link
              key={s.etikett}
              href={s.href}
              className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-gold/50 hover:shadow-md"
            >
              <p className="font-serif text-4xl font-bold leading-none text-foreground sm:text-5xl">
                {s.tal}
                {s.suffix}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {s.etikett}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {s.undertext}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4 · THE VISION ────────────────────────────────────────────────── */}
      <section className="mt-10 rounded-xl border-2 border-gold bg-card p-7 shadow-lg sm:p-9">
        <h2 className="font-serif text-3xl font-bold">
          Our vision: knowledge is a right
        </h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
          Fundamental analysis should be available to every human being — like
          air and water. That is why <strong>Phase 1 is completely free,
          forever</strong>. We do not profit from people who want to learn.
          Phase 2 is the fast fundamental path forward — the same 20
          indicators, but now <em>weighed together</em> the right way, with
          the founder's coaching at your side — and Phase 3 is the ecosystem
          where analysis begins to move.
        </p>
        <Link
          href="/en/medlemskap"
          className="mt-5 inline-block rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Read the full membership overview →
        </Link>
      </section>

      {/* ── 5 · LEARN / ANALYSE / PRACTICE ────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="font-serif text-3xl font-bold">
          Learn. Analyse. Practise.
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The whole site follows one task flow — from your first variable to
          your own portfolio. The tools open in Swedish today; the translation
          is under way.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {SEKTIONER.map((sektion) => (
            <div
              key={sektion.titel}
              className="flex flex-col rounded-xl border border-gold/30 bg-card p-6"
            >
              <h3 className="font-serif text-xl font-bold">
                <span className="mr-2" aria-hidden="true">
                  {sektion.ikon}
                </span>
                {sektion.titel}
              </h3>
              <ul className="mt-4 flex-1 space-y-3 text-sm">
                {sektion.punkter.map((p) => (
                  <li key={p.href + p.text}>
                    <Link
                      href={p.href}
                      className="font-semibold text-foreground underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
                    >
                      {p.text}
                    </Link>
                    <span className="block text-xs leading-relaxed text-muted-foreground">
                      {p.undertext}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6 · FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="mt-10">
        <div className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-2 sm:p-3">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent" />
          <div className="relative flex flex-col items-center rounded-xl border border-[#E8C766]/20 px-6 py-12 text-center sm:px-12">
            <p className="font-serif text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
              AK1A Research Lab · Phase 1
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-3xl font-bold leading-tight text-balance text-[#EDE6D6] sm:text-4xl">
              Your first course starts in 30 seconds.
            </h2>
            <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-[#E8C766] sm:text-lg">
              Create a free account — all {num(SIFFROR.kurser)} courses unlock
              immediately.
            </p>
            <Link
              href="/en/logga-in"
              className="btn-guld-signatur mt-8 inline-flex items-center gap-2 px-8 py-4 text-base font-bold sm:text-lg"
            >
              Become a member — free <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs tracking-wide text-[#EDE6D6]/70">
              <span>0 kr forever</span>
              <span aria-hidden="true">·</span>
              <span>No card required</span>
              <span aria-hidden="true">·</span>
              <span>
                Unsure?{" "}
                <Link
                  href="/kurser"
                  className="font-semibold text-[#E8C766] hover:underline"
                >
                  Browse the courses first
                </Link>
              </span>
            </p>
          </div>
        </div>
      </section>
    </SeoPageShell>
  );
}
