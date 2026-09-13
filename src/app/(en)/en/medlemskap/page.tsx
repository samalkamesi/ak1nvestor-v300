import Link from "next/link";
import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { StrukturData } from "@/components/seo/StrukturData";
import { SIFFROR } from "@/lib/siffror";

export const dynamic = "force-static";

/** English thousand grouping (en-US: 8,211). */
const num = (n: number) => n.toLocaleString("en-US");

/**
 * ENGLISH MIRROR of /medlemskap (Våg 51 agent S2).
 *
 * Full translation of the Swedish membership page — every section, list,
 * price and guarantee carried over 1:1. Standalone English copy; no shared
 * strings with the Swedish page. Course titles come live from the course
 * catalogue (they are original English book titles). Prices keep SEK/kr.
 *
 * Phase 2 (new model): the 18 fundamental masterworks by category —
 * valuation, financial statements, corporate finance, value investing +
 * the AKM1 super-depth. The core is THE SYNTHESIS of the 20 analytical
 * indicators (V01–V20). No technical analysis training — only basic
 * orientation (mastery = Phase 3). Mirrors FAS2_KURSLISTA in
 * src/lib/kurs-access.ts.
 */
const FAS2_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "The Valuation Bibles",
    pitch:
      "Graham & Dodd, Damodaran, McKinsey, Williams, Rappaport & Mauboussin — the art of weighing a company in the palm of your hand.",
    slugs: [
      "security-analysis",
      "investment-valuation",
      "valuation-measuring-managing",
      "the-theory-of-investment-value",
      "expectations-investing",
    ],
  },
  {
    kategori: "Financial Statements & Reporting",
    pitch:
      "Penman, Mulford & Comiskey, O'Glove, Schilit, Graham — find the quality in the earnings and see through the narratives.",
    slugs: [
      "financial-statement-analysis-and-security-valuation",
      "creative-cash-flow-reporting",
      "quality-of-earnings",
      "financial-shenanigans",
      "interpretation-of-financial-statements",
    ],
  },
  {
    kategori: "Corporate Finance & Capital",
    pitch:
      "Higgins, Brealey, Whitman — capital structure and cash-flow mathematics at MBA level.",
    slugs: [
      "analysis-for-financial-management",
      "principles-of-corporate-finance",
      "distress-investing",
    ],
  },
  {
    kategori: "The Masterworks of Value Investing + AKM1",
    pitch:
      "Klarman, Greenwald, Gray & Carlisle, Einhorn — and our own model AKM1 at super-depth.",
    slugs: [
      "margin-of-safety",
      "value-investing-from-graham-to-buffett",
      "quantitative-value",
      "fooling-some-of-the-people",
      "akm1-den-kontroversiella-modellen",
    ],
  },
];

/**
 * Phase 3: the 24 courses of the dynamic ecosystem — 3 flagships + 17 canon
 * works in technical analysis + 4 trading psychology. Mirrors FAS3_KURSER
 * in kurs-access.ts.
 */
const FAS3_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "The Ecosystem Flagships",
    pitch:
      "Where fundamental analysis stops being static — the variables become time series, value meets waves.",
    slugs: [
      "ak1ts-vaglarans-hierarki",
      "vagfundament-variablerna-som-tidsserier",
      "konfluens-varde-moter-vagor",
    ],
  },
  {
    kategori: "Technical Analysis at Master Level",
    pitch:
      "Elliott, Murphy, Nison, Bollinger, Edwards & Magee, Bulkowski, DeMark, Pring, Elder, Torssell and the trend followers — 17 canonical works.",
    slugs: [
      "elliott-wave-principle",
      "technical-analysis-of-stock-trends",
      "technical-analysis-financial-markets",
      "japanese-candlestick-charting",
      "encyclopedia-of-chart-patterns",
      "the-visual-investor",
      "intermarket-analysis",
      "martin-pring-on-market-momentum",
      "the-master-swing-trader",
      "fibonacci-applications",
      "come-into-my-trading-room",
      "teknisk-analys-med-johnny-torssell",
      "bollinger-on-bollinger-bands",
      "the-new-science-of-technical-analysis",
      "way-of-the-turtle",
      "the-complete-turtletrader",
      "the-trend-following-bible",
    ],
  },
  {
    kategori: "Trading Psychology & Neuroeconomics",
    pitch:
      "The enemy sits at your own desk — Douglas, Coates, Shull and Zweig teach you to recognise him.",
    slugs: [
      "trading-in-the-zone",
      "the-hour-between-dog-and-wolf",
      "market-mind-games",
      "your-money-and-your-brain",
    ],
  },
];

export const metadata: Metadata = {
  title: "Phase 1 Free — Phase 2 The Synthesis — Phase 3 The Ecosystem | AK1A",
  description:
    "Phase 1: all foundation courses, fully covered books, the AI Mentor, the calculator and the portfolio system — free forever. Phase 2: nothing new — the same 20 analytical indicators (V01–V20), now weighed together the right way. Unlimited hours with the founder until you are worthy of the title independent stock analyst. Technical analysis is not taught in Phase 1/Phase 2 — mastery is Phase 3. SEK 9,999 / SEK 13,999, 90-day satisfaction guarantee: payment only after 90 days if you are satisfied.",
  keywords: [
    "free stock market education",
    "fundamental analysis free",
    "AKM1 membership",
    "stock analysis education Sweden",
    "weighing fundamental indicators",
    "valuation education Damodaran",
    "technical analysis ecosystem",
    "representative education",
    "BOKMASTER",
  ],
  alternates: {
    canonical: `${SITE_URL}/en/medlemskap`,
    languages: {
      "sv-SE": `${SITE_URL}/medlemskap`,
      en: `${SITE_URL}/en/medlemskap`,
      ar: `${SITE_URL}/ar/medlemskap`,
      "x-default": `${SITE_URL}/medlemskap`,
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
    title: "Phase 1 Free — Phase 2 The Synthesis — Phase 3 The Ecosystem | AK1A",
    description:
      "Our vision: knowledge is a right. Phase 1 is free forever — Phase 2 weighs the 20 indicators together, Phase 3 is the dynamic ecosystem.",
    url: `${SITE_URL}/en/medlemskap`,
    siteName: "AK1A Research Lab",
    type: "website",
    locale: "en_US",
    alternateLocale: ["sv_SE", "ar_AR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Membership — Phase 1 free forever | AK1A",
    description:
      "Phase 1: all foundation courses and tools, free forever. Phase 2: the synthesis of the 20 indicators. Phase 3: the dynamic ecosystem.",
  },
};

/** 90-day satisfaction guarantee — reused in the Phase 2 and Phase 3 blocks. */
function GarantiRuta({ mork }: { mork?: boolean }) {
  return (
    <div
      className={`mt-4 rounded-lg border border-dashed p-4 text-xs leading-relaxed ${
        mork
          ? "border-[#E8C766]/50 bg-[#0A1422]/60 text-[#EDE6D6]/85"
          : "border-gold/50 bg-paper text-muted-foreground"
      }`}
    >
      <p className={`font-bold uppercase tracking-[0.2em] ${mork ? "text-[#E8C766]" : "text-gold"}`}>
        90-day satisfaction guarantee
      </p>
      <p className="mt-1.5">
        You will be satisfied — we guarantee it. Otherwise you pay nothing. In
        technical terms: you pay nothing during the first 90 days; payment
        takes place only after 90 days, and only if you remain satisfied.{" "}
        <Link
          href="/villkor"
          className={`underline ${mork ? "hover:text-[#EDE6D6]" : "hover:text-foreground"}`}
        >
          The Terms (sections 5–6)
        </Link>{" "}
        give the guarantee its legal basis — your statutory right of
        withdrawal under the Swedish Distance and Doorstep Sales Act
        (2005:59) always applies in parallel.
      </p>
    </div>
  );
}

/** Social proof — translated static equivalent of the Swedish SocialProof. */
function SocialtBevis({
  fas1Antal,
}: {
  fas1Antal: number;
}) {
  const roster = [
    {
      citat: "The first time I actually UNDERSTAND my stocks",
      namn: "Kalle",
      typ: "Level 12 · 6 courses completed",
    },
    {
      citat: "The quiz questions force me to think, not just read",
      namn: "Maria",
      typ: "Level 28 · 21 courses completed",
    },
    {
      citat: "The Wave Foundation changed how I see my portfolio",
      namn: "Erik",
      typ: "Level 41 · 37 courses completed",
    },
  ];
  return (
    <section className="marin-panel relative overflow-hidden rounded-2xl p-6 sm:p-10">
      <div className="relative">
        <div className="flex items-center gap-2">
          <VarumarkesLogo storlek="sm" medText={false} klass="scale-75 origin-left" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            AK1A Research Lab · in numbers and student voices
          </p>
        </div>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl text-[#EDE6D6]">
          The whole library. Zero kronor. Built so that you actually understand.
        </h2>
        <p className="mt-6 rounded-xl border border-gold/20 bg-black/20 px-4 py-3 text-center text-sm tracking-wide text-[#EDE6D6]/90 sm:text-base">
          {num(SIFFROR.kurser)} courses · {num(SIFFROR.bokmaster)} books
          chapter by chapter · {num(SIFFROR.quiz)} quiz questions ·{" "}
          <span className="font-semibold text-gold">
            100 % free in Phase 1
          </span>
        </p>
        <div className="mt-8 flex items-center gap-4">
          <h3 className="font-serif text-xl font-semibold text-[#EDE6D6]">
            What students say
          </h3>
          <span
            className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent"
            aria-hidden="true"
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {roster.map((e) => (
            <figure
              key={e.namn}
              className="flex h-full flex-col justify-between rounded-2xl border border-gold/25 bg-black/20 p-5"
            >
              <div>
                <p className="text-sm tracking-widest" aria-label="5 out of 5 stars">
                  ⭐⭐⭐⭐⭐
                </p>
                <blockquote className="mt-3 font-serif text-lg italic leading-snug text-[#EDE6D6]">
                  &ldquo;{e.citat}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-5 text-sm text-[#EDE6D6]/85">
                <span className="font-semibold">{e.namn}</span>
                <span className="opacity-60"> · {e.typ}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center gap-5 rounded-2xl border border-gold/25 bg-black/20 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-serif text-xl font-semibold text-[#EDE6D6]">
              Join free — it takes 30 seconds.
            </p>
            <p className="mt-1 max-w-md text-sm opacity-70 text-[#EDE6D6]/80">
              Every analyst started with their first variable — all{" "}
              {num(fas1Antal)} foundation courses are open from the first
              second.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/en/logga-in"
              className="btn-guld-signatur inline-flex min-h-[44px] items-center gap-2 px-7 py-3 text-sm"
            >
              Join free — it takes 30 seconds
            </Link>
            <Link
              href="/kurser"
              className="btn-marin inline-flex min-h-[44px] items-center px-6 py-3 text-sm"
            >
              Explore the courses
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs opacity-50 text-[#EDE6D6]/70">
          No card details. No selling. Phase 1 is free — forever. Student
          voices are shown with first names and real levels.
        </p>
      </div>
    </section>
  );
}

export default function EnMedlemskapPage() {
  const kurserLista = getCourseList();
  const kurser = kurserLista.length;
  const lasSlugs = new Set([
    ...FAS2_KURSLISTA.flatMap((k) => k.slugs),
    ...FAS3_KURSLISTA.flatMap((k) => k.slugs),
  ]);
  const fas2Antal = FAS2_KURSLISTA.reduce((s, k) => s + k.slugs.length, 0);
  const fas3Antal = FAS3_KURSLISTA.reduce((s, k) => s + k.slugs.length, 0);
  const fas1Antal = kurser - lasSlugs.size;
  const fas1Bokmaster = kurserLista.filter(
    (c) => c.category === "BOKMASTER" && !lasSlugs.has(c.slug)
  ).length;
  // The CourseChapter type lacks the quiz field (the data has it) — safe cast.
  const quiz = kurserLista
    .filter((c) => !lasSlugs.has(c.slug))
    .reduce(
      (s, c) =>
        s +
        c.chapters.reduce(
          (q, k) => q + ((k as { quiz?: unknown[] }).quiz?.length ?? 0),
          0
        ),
      0
    );
  const titelFor = (slug: string) =>
    kurserLista.find((k) => k.slug === slug)?.title ?? slug;

  return (
    <SeoPageShell breadcrumb={[{ name: "Start", href: "/en" }, { name: "Membership" }]} wide>
      {/* FAQPage schema (AI-SEO) — the phase questions users and AI assistants
          actually ask; the answers build on the page's own figures. */}
      <StrukturData
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: "en",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is the difference between Phase 1, Phase 2 and Phase 3?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Phase 1 is the foundation education — free forever. Phase 2 is the synthesis: the same 20 analytical indicators (V01–V20), now weighed together the right way with the founder's coaching. Phase 3 is the ecosystem where technical analysis and the complete analysis journey live.",
              },
            },
            {
              "@type": "Question",
              name: "Is Phase 1 really free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `Yes — Phase 1 is free forever: ${num(fas1Antal)} courses, ${num(fas1Bokmaster)} fully covered books, the AI Mentor, the calculator and the portfolio system.`,
              },
            },
            {
              "@type": "Question",
              name: "How many courses and quizzes are included?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `${num(SIFFROR.kurser)} courses in the whole library and over ${num(quiz)} quiz questions in Phase 1 — all with an immediate explanation of the correct answer.`,
              },
            },
            {
              "@type": "Question",
              name: "What is the 90-day satisfaction guarantee?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "You pay nothing during the first 90 days; payment takes place only after 90 days, and only if you remain satisfied. The statutory right of withdrawal always applies in parallel — see the terms.",
              },
            },
            {
              "@type": "Question",
              name: "Does AK1A give investment advice?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. AK1A educates independent fundamental analysts — educational analysis, never investment advice or tips on individual stocks.",
              },
            },
          ],
        }}
        id="jsonld-faq"
      />
      <h1 className="font-serif text-4xl font-bold">
        Our vision: knowledge is a right
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Fundamental analysis should be available to every human being — like
        air and water. That is why <strong>Phase 1 is completely free,
        forever</strong>. We do not profit from people who want to learn.
        Phase 2 is the fast fundamental path forward — the same 20
        indicators, but now <em>weighed together</em> the right way, with the
        founder's coaching at your side — and Phase 3 is the ecosystem where
        analysis begins to move.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        Note: linked tools and course pages open in Swedish today — the
        translation is under way.
      </p>

      {/* Value line — the generosity in plain text */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { tal: `${num(SIFFROR.kurser)}`, etikett: "courses in the library — Phase 1 free forever" },
          { tal: `${num(SIFFROR.bokmaster)}`, etikett: "fully covered books, chapter by chapter" },
          { tal: `${num(SIFFROR.quiz)}`, etikett: "quiz questions worth +10 XP each" },
          { tal: `${fas2Antal}`, etikett: "fundamental masterworks in Phase 2 — valuation, statements, finance and value investing: all the way to independent analyst" },
        ].map((s) => (
          <div key={s.etikett} className="rounded-xl border border-gold/30 bg-card p-4 text-center">
            <div className="font-serif text-3xl font-black text-gold">{s.tal}</div>
            <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{s.etikett}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* PHASE 1 */}
        <div className="flex flex-col rounded-xl border-2 border-gold bg-card p-7 shadow-lg">
          <span className="mb-2 inline-block w-fit rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-primary-foreground">
            PHASE 1 · FREE FOREVER · ALWAYS OPEN
          </span>
          <h2 className="font-serif text-2xl font-bold">
            Become an independent stock analyst
          </h2>
          <p className="mt-1 text-sm italic text-muted-foreground">
            &ldquo;A right we guarantee to every human being.&rdquo;
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {[
              `The complete AKM1 foundation methodology (V01–V20) — ${num(fas1Antal)} courses open immediately, free`,
              `${num(fas1Bokmaster)} BOKMASTER books chapter by chapter — Graham, Buffett, Marks, Damodaran, Murphy, Soros, Kahneman…`,
              "All the foundation tools: the AI Mentor that knows you + the Short-Seller that grills your theses",
              "140 flashcards with spaced repetition (Ebbinghaus/SM-2)",
              "The AKM1 calculator + the portfolio system with fundamental data per holding",
              "The Library: the book canon mapped to AKM1/AK1TS",
              "Certificates, leaderboard, XP & levels 1–100",
              "All stock analyses and case studies in the lab",
              "Become a member with just an email — no payment, ever",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-gold">✓</span>
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/kurser"
            className="mt-6 rounded-md bg-gold px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Start learning now — free of charge
          </Link>
        </div>

        {/* PHASE 2 */}
        <div className="flex flex-col rounded-xl border border-gold/40 bg-card p-7">
          <span className="mb-2 inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
            PHASE 2 · APPLICATION REQUIRED · SEK 9,999
          </span>
          <h2 className="font-serif text-2xl font-bold">The fast fundamental path</h2>
          <p className="mt-1 text-sm italic text-muted-foreground">
            The synthesis of the 20 indicators — into a judgement you can defend.
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {[
              "The 20 analytical indicators (V01–V20) — Phase 2 trains you to analyse them the right way",
              "THE SYNTHESIS — the art of weighing the indicators against one another. That is the core of Phase 2: not twenty separate answers, but a single fundamental judgement",
              "No new content — we teach nothing new; we deepen what you already met in Phase 1, at analyst level",
              "Unlimited hours with the founder — you get the time it takes, until you are worthy of the title independent stock analyst",
              `${fas2Antal} fundamental masterworks — valuation (Graham & Dodd, Damodaran, McKinsey), financial statements (Penman, Schilit, O'Glove), finance (Higgins, Brealey), value investing (Klarman, Greenwald, Einhorn) + AKM1 at super-depth`,
              "No technical analysis training — in Phase 2 (as in Phase 1) we only present basic knowledge of technical analysis, as orientation. Mastery is Phase 3",
              "Group training together with other clients",
              "The Representative track: the path to becoming a representative of AK1nvestor — representing us with quality",
              "Company study suggestions during the training — tested with numbers and variables",
              "The right to use the tools and future Phase 2 services (developed continuously)",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-gold">✓</span>
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>

          {/* 90-day satisfaction guarantee — the owner's promise, in the box */}
          <GarantiRuta />

          <div className="mt-4 rounded-lg border border-gold/30 bg-paper p-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">For whom — and the requirement.</strong>{" "}
            Phase 2 requires that you have completed Phase 1: the foundation
            must sit (level 25+ is a good signal). And the most important
            thing of all — <em>the will</em> to succeed with fundamental stock
            analysis. Without will, focus is hard to keep. If you have both,
            we take you all the way, regardless of time.
          </div>
          <Link
            href="/fas2-ansok"
            className="mt-5 rounded-md border border-gold/50 px-4 py-2.5 text-center text-sm font-semibold hover:bg-gold/10"
          >
            Apply for Phase 2 → free, 2 minutes
          </Link>
        </div>
      </div>

      {/* SOCIAL PROOF — figures and student voices after the Phase 1/2 overview */}
      <div className="mt-12">
        <SocialtBevis fas1Antal={fas1Antal} />
      </div>

      {/* PHASE 3 — the dynamic ecosystem */}
      <section className="marin-panel mt-8 rounded-2xl border border-gold/40 p-7 sm:p-9">
        <span className="mb-2 inline-block w-fit rounded-full border border-[#E8C766]/50 px-3 py-0.5 text-xs font-semibold text-[#E8C766]">
          PHASE 3 · AFTER APPLYING PHASE 2 · SEK 13,999
        </span>
        <h2 className="font-serif text-2xl font-bold text-[#EDE6D6]">
          Phase 3 — the dynamic ecosystem
        </h2>
        <p className="mt-1 text-sm italic text-[#E8C766]">
          Where fundamental analysis starts to move.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#EDE6D6]/85">
          Phase 3 is the certification phase: practice portfolio and
          application. It begins after you have applied Phase 2 — first the
          fundamental judgement (the synthesis of the 20 indicators), then
          the dynamic. Here you apply what you know and understand how
          fundamental analysis is not static: all indicators move
          dynamically, as time series with their own rhythm. We integrate
          AKM1 with AK1TS — waves, in plain words.
        </p>
        <ul className="mt-5 grid gap-2.5 text-sm text-[#EDE6D6]/85 md:grid-cols-2">
          {[
            `The AKM1 × AK1TS integration — the composite analysis where fundamental strength meets waves`,
            "The Wave Foundation — every fundamental variable as a time series",
            "The Confluence Radar — where value is guaranteed to meet waves (five dimensions)",
            "The portfolio's waves — the wave profile at micro, short, medium, long and mega horizon",
            `Technical analysis at master level — 17 canonical works: Elliott, Murphy, Nison, Bollinger…`,
            "Trading psychology & neuroeconomics — Douglas, Coates, Shull, Zweig",
            `The ${fas3Antal} courses + practice portfolio, requirements matrix A–F and certification`,
            "Dashboard, AI connection of the highest quality and reports — directly linked to the analysis of stocks and portfolios",
            "The right to ALL future developments within Phase 3 — everything is under development and you are in from the beginning",
          ].map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-[#E8C766]">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* 90-day satisfaction guarantee — also applies to Phase 3 */}
        <GarantiRuta mork />

        {/* The monthly plan note — the honest price */}
        <div className="mt-5 rounded-xl border border-dashed border-[#E8C766]/50 bg-[#0A1422]/60 p-4 text-xs leading-relaxed text-[#EDE6D6]/80">
          <strong className="text-[#E8C766]">The honest price, straight out:</strong>{" "}
          after completing the training, the analytical ecosystem and the
          dashboard can continue to be used through a monthly plan (12
          months). The training itself is yours forever.
        </div>
        <Link
          href="/fas3"
          className="mt-5 inline-block rounded-md bg-gold px-4 py-2.5 text-center text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          Explore Phase 3 →
        </Link>
      </section>

      {/* AFTER THE TRAINING — tools, research services, developments */}
      <section className="mt-8 rounded-xl border-2 border-gold/50 bg-card p-7">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
          After the training
        </span>
        <h2 className="mt-2 font-serif text-2xl font-bold">
          The tools become yours — and the development never stops
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          After the training you get to use the tools that should be
          available to you: the analysis engines, the calculator, the
          portfolio system — and the research services growing out of the
          lab. There will always be new developments:{" "}
          <strong>AK1nvestor.com has grand visions</strong>, and you are in
          from the beginning.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gold/30 bg-paper p-5">
            <h3 className="font-serif text-lg font-bold">AK1A Portfolio Research</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              The research service for the time after the school bench: three
              tiers of monthly portfolio research with AKM1 scores, wave
              status per horizon and then-vs-now follow-up. As a Phase 2 or
              Phase 3 student you get <strong className="text-foreground">20 % off</strong> —
              always and automatically. Research, not advice.
            </p>
            <Link
              href="/prenumeration"
              className="mt-3 inline-block rounded-md border border-gold/50 px-4 py-2 text-xs font-semibold hover:bg-gold/10"
            >
              See the Subscription →
            </Link>
          </div>
          <div className="rounded-xl border border-gold/30 bg-paper p-5">
            <h3 className="font-serif text-lg font-bold">Always new developments</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Analysis of stocks and portfolios, the dashboard, the AI
              connection and the reports keep being built — continuously,
              with quality as the yardstick. Your training is yours forever;
              the tools and services live and develop with you.
            </p>
            <Link
              href="/fas3"
              className="mt-3 inline-block rounded-md border border-gold/50 px-4 py-2 text-xs font-semibold hover:bg-gold/10"
            >
              See Phase 3's development path →
            </Link>
          </div>
        </div>
      </section>

      {/* THE LIBRARY — the book canon and the message about technical analysis */}
      <section className="mt-6 rounded-xl border border-gold/30 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">
          The Library — the book canon mapped to AKM1/AK1TS
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Every book in the canon is linked to <strong>AKM1</strong> (V01–V20) and{" "}
          <strong>AK1TS</strong> — literally: you see which variable and
          which theory each work deepens. And one honest message, straight
          out: <strong className="text-foreground">we do not teach technical
          analysis in Phase 1 or Phase 2</strong>. There we only present
          basic knowledge of technical analysis — as orientation, not as a
          subject to master.{" "}
          <strong className="text-foreground">Technical analysis at master
          level is Phase 3</strong>, where it belongs in the dynamic
          ecosystem.
        </p>
        <Link
          href="/bibliotek"
          className="mt-4 inline-block rounded-md border border-gold/50 px-4 py-2 text-xs font-semibold hover:bg-gold/10"
        >
          Explore the Library →
        </Link>
      </section>

      {/* The advanced courses — Phase 2 and Phase 3 */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          The advanced courses — {fas2Antal} fundamental in Phase 2, {fas3Antal} in Phase 3
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Phase 1 teaches the parts — variable by variable, book by book.
          Phase 2 deepens the fundamental craft to analyst level, where the
          synthesis of the 20 indicators becomes the next important step.
          Phase 3 opens the dynamic ecosystem: the waves, the masters'
          technical analysis and the psychology behind your own decisions.
        </p>

        <h3 className="mt-5 font-serif text-lg font-bold">
          Phase 2 — the fundamental path <span className="text-gold">· {fas2Antal} courses</span>
        </h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {FAS2_KURSLISTA.map((kat) => (
            <div key={kat.kategori} className="rounded-xl border border-gold/30 bg-card p-5">
              <h4 className="text-sm font-semibold text-foreground">
                {kat.kategori}{" "}
                <span className="font-normal text-gold">· {kat.slugs.length} courses</span>
              </h4>
              <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                {kat.pitch}
              </p>
              <ul className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
                {kat.slugs.map((s) => (
                  <li key={s} className="flex gap-1.5">
                    <span className="text-gold">·</span>
                    <span>{titelFor(s)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h3 className="mt-6 font-serif text-lg font-bold">
          Phase 3 — the dynamic ecosystem <span className="text-gold">· {fas3Antal} courses</span>
        </h3>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {FAS3_KURSLISTA.map((kat) => (
            <div key={kat.kategori} className="rounded-xl border border-gold/30 bg-card p-5">
              <h4 className="text-sm font-semibold text-foreground">
                {kat.kategori}{" "}
                <span className="font-normal text-gold">· {kat.slugs.length} courses</span>
              </h4>
              <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                {kat.pitch}
              </p>
              <ul className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
                {kat.slugs.map((s) => (
                  <li key={s} className="flex gap-1.5">
                    <span className="text-gold">·</span>
                    <span>{titelFor(s)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Everything in AK1A Research Lab is educational teaching in stock
          analysis — never investment advice, and never tips to buy or sell.
          Analyses and courses build on open sources and disclosed
          assumptions.
        </p>
      </section>

      {/* NEW IN PHASE 2 vs ALWAYS FREE */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-gold bg-card p-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
            Always free · Phase 1
          </span>
          <h3 className="mt-2 font-serif text-xl font-bold">
            {fas1Antal} free courses + all the foundation tools
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              `All ${fas1Antal} foundation courses — the AKM1 methodology (V01–V20) with formulas and thresholds`,
              `${fas1Bokmaster} BOKMASTER books chapter by chapter`,
              "The AI Mentor, the Short-Seller, the calculator and the portfolio system",
              "Flashcards, the Library, certificates, XP and the leaderboard",
              "All stock analyses and case studies in the lab",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-gold">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-gold/40 bg-card p-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
            New in Phase 2
          </span>
          <h3 className="mt-2 font-serif text-xl font-bold">
            The Synthesis + {fas2Antal} masterworks + the founder at your side
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              "The synthesis of the 20 indicators — weighing them against one another into your own fundamental judgement",
              `The ${fas2Antal} fundamental masterworks — valuation, financial statements, finance, value investing + AKM1 super-depth (listed above)`,
              "Unlimited hours with the founder and group coaching — until you are worthy of the title independent analyst",
              "The Representative track — the path to representing AK1nvestor with quality",
              "No technical analysis training — only basic orientation; mastery is Phase 3",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-gold">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Clear separation: <strong className="text-foreground">Phase 1</strong> is
            the {fas1Antal} free courses and all the foundation tools.{" "}
            <strong className="text-foreground">Phase 2</strong> is the fast
            fundamental path — no new content, but the synthesis of the 20
            indicators, the {fas2Antal} masterworks with the founder at your
            side, and the Representative track.{" "}
            <strong className="text-foreground">Phase 3</strong> is the
            dynamic ecosystem: waves, master-level technical analysis,
            psychology, dashboard and AI.
          </p>
        </div>
      </section>

      {/* The 10x value proof */}
      <section className="mt-8 rounded-xl border border-gold/30 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">Why we are generous</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          A traditional analysis education costs tens of thousands of kronor
          and gives you a fraction of the methodology. With us you get{" "}
          <strong>the entire foundation system free</strong>: 20 analytical
          indicators with formulas and thresholds, the deterministic wave
          engine, {fas1Bokmaster} books chapter by chapter with quizzes — and
          honesty about every controversy. Our business idea is not to lock
          knowledge in: it is to educate independent analysts who may
          eventually want to work <em>with</em> us. The more people learn,
          the stronger the ecosystem becomes.
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-gold/30 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">Our promises</h2>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <li>✓ Phase 1 stays free — knowledge is a right</li>
          <li>✓ 90-day satisfaction guarantee — payment only after 90 days if you remain satisfied</li>
          <li>✓ Everything we publish is reproducible — sources are disclosed</li>
          <li>✓ We never sell your data</li>
          <li>✓ Educational financial analysis — never investment advice</li>
          <li>✓ GDPR: your data is yours, export on request</li>
        </ul>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Ready to start?{" "}
        <Link href="/laroplan" className="underline hover:text-foreground">
          Open the curriculum
        </Link>{" "}
        or{" "}
        <Link href="/profil" className="underline hover:text-foreground">
          test your cognitive profile
        </Link>{" "}
        — both free, forever.
      </p>
    </SeoPageShell>
  );
}
