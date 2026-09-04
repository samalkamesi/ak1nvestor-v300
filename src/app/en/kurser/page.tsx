import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { FortsattPanel } from "@/components/ak1a/fortsatt-panel";
import { KursSok } from "@/components/ak1a/kurs-sok";
import { KurstipsKort } from "@/components/ak1a/kurstips-kort";
import { SIFFROR } from "@/lib/siffror";
import {
  spegelMetadata,
  spegelWebsiteJsonLd,
  spegelUtbildningsOrganisationJsonLd,
  spegelFaqJsonLd,
} from "@/lib/spegel-metadata";
import { JsonLd } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * /en/kurser — full mirror of the Swedish /kurser flow page (wave 51,
 * agent S3). All page texts are translated to English; the course list
 * itself (333 Swedish course titles) is rendered as-is via KursSok —
 * translating the courses is phase 3 of the language plan. A clear notice
 * tells the reader that course titles and content are still in Swedish.
 * Numbers come from src/lib/siffror (single source of truth).
 */

export const metadata: Metadata = spegelMetadata({
  lang: "en",
  sida: "kurser",
  title: `Courses in Institutional Stock Analysis — ${SIFFROR.kurser} Courses | AK1A`,
  description: `Learn institutional stock analysis step by step. ${SIFFROR.kurser} courses: AKM1's 20 variables, technical analysis, risk management, portfolio management and practical cases. Research-based financial education.`,
  keywords: [
    "stock analysis courses",
    "AKM1",
    "institutional methodology",
    "learn stock analysis",
    "Swedish stocks",
    "financial education",
  ],
});

/** FAQPage schema in English (mirror of the Swedish FAQ on /kurser). */
function coursesFaqJsonLd() {
  return spegelFaqJsonLd("en", [
    {
      fraga: "What is the AKM1 methodology?",
      svar:
        "AKM1 is AK1A's model framework of 20 fundamental variables (V01–V20) — from sales growth to share buybacks — which together give an institutional whole-picture view of a company.",
    },
    {
      fraga: "How many courses does AK1A have?",
      svar: `${SIFFROR.kurser.toLocaleString("en-US")} courses in subjects such as fundamental analysis, valuation, technical analysis, risk management and behavioural finance — plus ${SIFFROR.bokmaster} books as BOKMASTER courses, chapter by chapter.`,
    },
    {
      fraga: "Are the courses free?",
      svar:
        "Phase 1 — the core education with courses, book summaries, quizzes and tools — is free of charge, forever. Phase 2 and Phase 3 are the advanced steps.",
    },
    {
      fraga: "Do I need prior knowledge to learn stock analysis?",
      svar:
        "No. The curriculum starts from zero and builds step by step: every key ratio has its own course with examples, quizzes and practical exercises.",
    },
    {
      fraga: "Does AK1A give investment advice or stock tips?",
      svar:
        "No. AK1A Research Lab provides research-based education in analysis methodology — never investment advice or tips on individual stocks.",
    },
  ]);
}

export default function KurserPageEn() {
  const courses = getCourseList();

  return (
    <SeoPageShell breadcrumb={[{ name: "Courses" }]} wide>
      <JsonLd data={spegelWebsiteJsonLd("en")} />
      <JsonLd data={spegelUtbildningsOrganisationJsonLd(
        "en",
        `AKM1 — ${SIFFROR.kurser} courses, ${SIFFROR.kanonBocker} canon books, ${SIFFROR.quiz} quiz questions`
      )} />
      <JsonLd data={coursesFaqJsonLd()} />

      <h1 className="font-serif text-4xl font-bold">
        Courses in Institutional Stock Analysis
      </h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        {courses.length} courses that teach you to think like an analyst — from
        AKM1's 20 fundamental variables to technical analysis, risk management
        and practical cases. Every course builds on the same methodology the
        institutions use, explained pedagogically for private investors.
      </p>

      {/* Translation notice — the course library itself is still Swedish (phase 3) */}
      <div
        role="note"
        className="mt-5 rounded-xl border border-gold/40 bg-gold/[0.06] p-4 text-sm leading-relaxed"
      >
        <p className="font-semibold text-foreground">
          Course titles and content are in Swedish — translation in progress.
        </p>
        <p className="mt-1 text-muted-foreground">
          The complete course list below is shown in its original Swedish. The
          rest of this page, and the platform's key flow pages, are available in
          English and Arabic.
        </p>
      </div>

      {/* Tips for you — personal, an invitation never a demand */}
      <div className="mt-6">
        <KurstipsKort antal={3} rubrik="Tips for you" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
        <KursSok
          kurser={courses.map((c) => ({
            slug: c.slug,
            title: c.title,
            category: c.category,
            kapitel: c.chapters.length,
            minuter: c.totalMinutes || c.minutes,
            learn: c.learn,
            xp: c.xp,
            quiz: c.chapters.reduce((s, k) => s + ((k as { quiz?: unknown[] }).quiz?.length ?? 0), 0),
          }))}
        />
        <aside className="h-fit"><FortsattPanel /></aside>
      </div>

      {/* NUMBERS BAND — figures from the single source of truth
          (src/lib/siffror, data/siffror.json). English mirror of the social
          proof band on the Swedish page. */}
      <section
        aria-label="AK1A Research Lab in numbers"
        className="marin-panel relative overflow-hidden rounded-3xl p-6 sm:p-10"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute inset-3 rounded-2xl border border-gold/20" />
        </div>
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            AK1A Research Lab · in numbers
          </p>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl">
            The entire library. Zero kronor. Built so that you actually
            understand.
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                tal: `${SIFFROR.kurser.toLocaleString("en-US")}`,
                huvud: "courses",
                etikett:
                  "from your very first foundation course to ultra-deep system courses — every chapter a step on the journey",
              },
              {
                tal: `${SIFFROR.bokmaster.toLocaleString("en-US")}`,
                huvud: "books",
                etikett:
                  "covered chapter by chapter — Graham, Damodaran, Murphy … the entire canon, step by step in Swedish",
              },
              {
                tal: `${SIFFROR.quiz.toLocaleString("en-US")}`,
                huvud: "quiz questions",
                etikett:
                  "that make you think — not just read. That is where the knowledge sticks",
              },
              {
                tal: "100 %",
                huvud: "free",
                etikett:
                  "in Phase 1 — the entire library, free of charge, forever. We earn through trust",
              },
            ].map((s) => (
              <div
                key={s.huvud}
                className="rounded-2xl border border-gold/25 bg-black/20 p-5"
              >
                <p className="font-serif text-4xl font-black tabular-nums text-gold">
                  {s.tal}
                </p>
                <p className="mt-2 font-serif text-lg font-semibold">{s.huvud}</p>
                <p className="mt-1 text-xs leading-relaxed opacity-70">{s.etikett}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-xl border border-gold/20 bg-black/20 px-4 py-3 text-center text-sm tracking-wide sm:text-base">
            {SIFFROR.kurser} courses · {SIFFROR.bokmaster} books chapter by
            chapter · {SIFFROR.quiz.toLocaleString("en-US")} quiz ·{" "}
            <span className="font-semibold text-gold">100 % free in Phase 1</span>
          </p>
        </div>
      </section>
    </SeoPageShell>
  );
}
