import Link from "next/link";
import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { SIFFROR } from "@/lib/siffror";

export const dynamic = "force-static";

/** English thousand grouping (en-US: 8,211). */
const num = (n: number) => n.toLocaleString("en-US");

/**
 * ENGLISH MIRROR of /manifest (Våg 51 agent S2).
 *
 * Full translation of the Swedish manifesto — hero, six promises,
 * methodology, the honesty test, the figures, the path, CTA and signature.
 * Standalone English copy; no shared strings with the Swedish page.
 * Figures are counted live from the content layer (static fallback if
 * data is missing), exactly like the Swedish page.
 */
export const metadata: Metadata = {
  title: "The Manifesto — the world's best financial education | AK1A Research Lab",
  description: `Our manifesto: we are building the world's best financial education — ${SIFFROR.kurser} courses, ${SIFFROR.bokmaster} books chapter by chapter and ${num(SIFFROR.quiz)} quiz questions, free in Phase 1. Institutional methodology, complete honesty and generosity as a business idea.`,
  keywords: [
    "financial education",
    "manifesto",
    "free stock market education",
    "fundamental analysis",
    "AKM1 methodology",
    "AK1TS wave theory",
    "BOKMASTER",
  ],
  alternates: {
    canonical: `${SITE_URL}/en/manifest`,
    languages: {
      "sv-SE": `${SITE_URL}/manifest`,
      en: `${SITE_URL}/en/manifest`,
      ar: `${SITE_URL}/ar/manifest`,
      "x-default": `${SITE_URL}/manifest`,
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
    title: "The Manifesto — the world's best financial education | AK1A Research Lab",
    description:
      "We are building the world's best financial education — measured by what a student can actually do afterwards.",
    url: `${SITE_URL}/en/manifest`,
    siteName: "AK1A Research Lab",
    type: "website",
    locale: "en_US",
    alternateLocale: ["sv_SE", "ar_AR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Manifesto | AK1A Research Lab",
    description: `Phase 1 free, forever — ${SIFFROR.kurser} courses, ${SIFFROR.bokmaster} books and ${num(SIFFROR.quiz)} quiz questions. Knowledge is a right.`,
  },
};

export default function EnManifestPage() {
  // Live figures — counted from the content layer at build. Static fallback
  // if the data is missing, same as the Swedish page.
  const kurserLista = getCourseList();
  const kurser = kurserLista.length || 324;
  const bokmaster =
    kurserLista.filter((c) => c.category === "BOKMASTER").length || 78;
  const quiz =
    kurserLista.reduce(
      (s, c) =>
        s +
        c.chapters.reduce(
          (q, k) => q + ((k as { quiz?: Array<unknown> }).quiz?.length ?? 0),
          0
        ),
      0
    ) || SIFFROR.quiz;

  return (
    <SeoPageShell lang="en" wide breadcrumb={[{ name: "Start", href: "/en" }, { name: "The Manifesto" }]}>
      {/* ── 1 · HERO ─────────────────────────────────────────────────────── */}
      <section className="rounded-xl border-2 border-gold bg-card p-8 shadow-lg sm:p-10">
        <span className="mb-4 inline-block w-fit rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-primary-foreground">
          AK1A RESEARCH LAB · THE MANIFESTO
        </span>
        <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">
          We are building the world&rsquo;s best financial education.
        </h1>
        <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground">
          Not the world&rsquo;s biggest. Not the world&rsquo;s flashiest. The
          best — measured by what a student can actually do afterwards.
          Today: <strong>{num(kurser)} courses</strong>,{" "}
          <strong>{num(bokmaster)} books</strong> covered chapter by chapter
          and <strong>{num(quiz)} quiz questions</strong> that force the
          knowledge to stick. Tomorrow: more of the same, deeper. We keep the
          measure public — a manifesto without numbers is just a mood.
        </p>
        <p className="mt-4 font-serif text-lg italic text-gold">
          Phase 1 free, forever — knowledge is a right.
        </p>
      </section>

      {/* ── 2 · SIX PROMISES ─────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-serif text-3xl font-bold">Our six promises</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Six claims that can all be checked against the content. If we break
          one — hold us accountable.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              nr: "01",
              titel: "10x the value",
              body: (
                <>
                  Every course must teach you something you <em>could not</em>{" "}
                  do before you opened it. A course that only confirms what you
                  already believed has failed — no matter how beautiful it is.
                  We aim for every minute read to multiply your ability, not
                  add a smidgen to it.
                </>
              ),
            },
            {
              nr: "02",
              titel: "Complete honesty",
              body: (
                <>
                  We teach the criticism of ourselves better than the critics
                  do. The harshest scrutiny of our own models is found{" "}
                  <Link
                    href="/kurser/akm1-den-kontroversiella-modellen"
                    className="font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
                  >
                    in our own controversy courses
                  </Link>{" "}
                  — not hidden in an FAQ corner. A framework that cannot
                  withstand its own criticism does not deserve your trust.
                </>
              ),
            },
            {
              nr: "03",
              titel: "Institutional methodology",
              body: (
                <>
                  AKM1&rsquo;s 20 variables and AK1TS&rsquo;s deterministic
                  wave engine — with open formulas, thresholds and scoring. No
                  black boxes, no &quot;long on feel&quot;. Everything you see
                  can be recalculated by yourself.
                </>
              ),
            },
            {
              nr: "04",
              titel: "The books, whole",
              body: (
                <>
                  Every BOKMASTER covers its book chapter by chapter — not
                  summaries, not &quot;the five lessons&quot;. Graham is read
                  as Graham, Kahneman as Kahneman. {num(bokmaster)} titles,
                  and the list keeps growing.
                </>
              ),
            },
            {
              nr: "05",
              titel: "Education, never advice",
              body: (
                <>
                  Everything we publish is teaching. The calculator, the wave
                  engine, the portfolio system — every tool carries its
                  disclaimer, because a tool that teaches you to think should
                  never tempt you to stop doing so.
                </>
              ),
            },
            {
              nr: "06",
              titel: "Generosity as a business idea",
              body: (
                <>
                  We do not lock knowledge in. Phase 1 is <em>all</em> content
                  — every course, every book, every tool — free of charge,
                  forever. We do not profit from you learning; we profit from
                  what you choose to do with the knowledge.
                </>
              ),
            },
          ].map((l) => (
            <div
              key={l.nr}
              className="flex flex-col rounded-xl border border-gold/30 bg-card p-6"
            >
              <div className="font-serif text-sm font-black tracking-[0.2em] text-gold">
                {l.nr}
              </div>
              <h3 className="mt-2 font-serif text-xl font-bold">{l.titel}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {l.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3 · THE METHODOLOGY ──────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-serif text-3xl font-bold">The methodology</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The system rests on two pillars: the fundamental side and the
          market side — both deterministic, both open.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col rounded-xl border border-gold/40 bg-card p-7">
            <span className="mb-2 inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
              PILLAR I · THE FUNDAMENTAL SIDE
            </span>
            <h3 className="font-serif text-2xl font-bold">
              AKM1 — The Controversial Model
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              20 variables, <strong>V01–V20</strong>, grouped into{" "}
              <strong>7 categories</strong> — profitability, growth,
              stability, moat, valuation, risk and catalyst. Each variable is
              scored <strong>0–5</strong> against disclosed thresholds; the{" "}
              <strong>maximum total score is 100</strong>. No gut-feel overall
              impressions: a company becomes a number you can argue about,
              line by line.
            </p>
            <Link
              href="/kurser/akm1-den-kontroversiella-modellen"
              className="mt-5 text-sm font-semibold text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
            >
              Read the whole AKM1 course →
            </Link>
          </div>
          <div className="flex flex-col rounded-xl border border-gold/40 bg-card p-7">
            <span className="mb-2 inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
              PILLAR II · THE MARKET SIDE
            </span>
            <h3 className="font-serif text-2xl font-bold">
              AK1TS — The Hierarchy of Waves
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              <strong>5 time horizons × 5 theories × 4 dimensions</strong> — a
              complete grid of market doctrines, each weighed and scored. A{" "}
              <strong>deterministic wave engine</strong>: the same input gives
              the same wave picture, every time. The theory never picks a side
              — it forces you to know which theory you are trading on.
            </p>
            <Link
              href="/kurser/ak1ts-vaglarans-hierarki"
              className="mt-5 text-sm font-semibold text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
            >
              Read the whole AK1TS course →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4 · HONESTY'S REAL TEST ──────────────────────────────────────── */}
      <section className="mt-12 rounded-xl border border-gold/30 bg-paper p-8">
        <h2 className="font-serif text-3xl font-bold">
          Honesty&rsquo;s real test
        </h2>
        <blockquote className="mt-5 border-l-4 border-gold pl-5 font-serif text-lg italic leading-relaxed text-foreground">
          &quot;The theories lack scientifically proven predictive power — the
          tool forces you to measure instead of feel.&quot;
        </blockquote>
        <p className="mt-2 text-xs text-muted-foreground">
          — From our own disclaimer, which accompanies every analysis tool.
        </p>
        <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            We stand behind that sentence on every tool in the entire system.
            Not because we doubt our craft — but because it is the most honest
            sentence that can be said about technical analysis, and anyone
            claiming otherwise is selling you something.
          </p>
          <p>
            <strong className="text-foreground">Why is that a strength?</strong>{" "}
            Because every seller of certainty has an interest in hiding the
            uncertainty. When we spell it out — in disclaimer after
            disclaimer — there is nothing left to hide. What remains is the
            method: measure instead of feel, score instead of guess, and let
            the number carry the responsibility your stomach cannot. An
            education that begins with &quot;we do not know&quot; and still
            teaches you to act in a structured way is more honest than one
            that begins with promises.
          </p>
        </div>
      </section>

      {/* ── 5 · THE FIGURES ──────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-serif text-3xl font-bold">The figures</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A manifesto should be countable. Here is where things stand right
          now — live numbers, updated with the content.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { tal: `${num(kurser)}`, etikett: "courses in the whole system — all free in Phase 1" },
            { tal: `${num(bokmaster)}`, etikett: "BOKMASTER — books covered chapter by chapter" },
            {
              tal: num(quiz),
              etikett: "quiz questions that activate the knowledge you just read",
            },
            { tal: "140", etikett: "flashcards with spaced repetition (Ebbinghaus/SM-2)" },
            { tal: "10", etikett: "chart types in the analysis tools" },
            { tal: "201", etikett: "case studies in the lab — successes and failures" },
          ].map((s) => (
            <div
              key={s.etikett}
              className="rounded-xl border border-gold/30 bg-card p-5 text-center"
            >
              <div className="font-serif text-3xl font-black text-gold">
                {s.tal}
              </div>
              <div className="mt-1 text-[11px] leading-tight text-muted-foreground">
                {s.etikett}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5b · SOCIAL PROOF — figures and student voices ───────────────── */}
      <section className="marin-panel mt-12 rounded-2xl p-6 sm:p-10">
        <div className="relative">
          <div className="flex items-center gap-2">
            <VarumarkesLogo storlek="sm" medText={false} klass="scale-75 origin-left" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              AK1A Research Lab · in numbers and student voices
            </p>
          </div>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight text-[#EDE6D6] sm:text-4xl">
            The whole library. Zero kronor. Built so that you actually
            understand.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
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
            ].map((e) => (
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
          <p className="mt-4 text-center text-xs text-[#EDE6D6]/70 opacity-50">
            No card details. No selling. Phase 1 is free — forever. Student
            voices are shown with first names and real levels.
          </p>
        </div>
      </section>

      {/* ── 6 · THE PATH ─────────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-serif text-3xl font-bold">The path</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Four steps, one single watchword: generosity. We do not profit from
          you learning — we profit from what you become.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              steg: "Step 1",
              titel: "Phase 1 — free, forever",
              body: (
                <>
                  All {num(kurser)} courses, all BOKMASTER, all tools. Free of
                  charge, unlimited, without reservations. Not a taster — the
                  whole table.
                </>
              ),
            },
            {
              steg: "Step 2",
              titel: "Level 25 — proof to yourself",
              body: (
                <>
                  When you reach level 25 you have put in the work — and you
                  have the numbers to show it. No roadblock, no paywall: just
                  a signal, to yourself, that the foundation sits.
                </>
              ),
            },
            {
              steg: "Step 3",
              titel: "Phase 2 — education with the founder",
              body: (
                <>
                  SEK 9,999, application required, 90-day satisfaction
                  guarantee (payment only after 90 days if you remain
                  satisfied). The fundamental path to independent analyst:
                  nothing new — the same 20 analytical indicators, now weighed
                  together the right way. 18 masterworks with a human at your
                  side, unlimited hours — and the chance to become a
                  representative of AK1nvestor.
                </>
              ),
            },
            {
              steg: "Step 4",
              titel: "Representative — work with us",
              body: (
                <>
                  For those who want to go further: work with AK1nvestor. Our
                  model cultivates independent analysts — sometimes they
                  become colleagues. That is the point.
                </>
              ),
            },
          ].map((s) => (
            <div
              key={s.steg}
              className="flex flex-col rounded-xl border border-gold/30 bg-card p-6"
            >
              <span className="inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
                {s.steg}
              </span>
              <h3 className="mt-3 font-serif text-lg font-bold leading-snug">
                {s.titel}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-sm italic leading-relaxed text-muted-foreground">
          Read the whole structure — the phases, the guarantee, the
          application — on the{" "}
          <Link
            href="/en/medlemskap"
            className="text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
          >
            Membership
          </Link>{" "}
          page.
        </p>
      </section>

      {/* ── 7 · CTA ROW ──────────────────────────────────────────────────── */}
      <section className="mt-12 rounded-xl border-2 border-gold bg-card p-8 text-center shadow-lg">
        <h2 className="font-serif text-2xl font-bold">
          The manifesto has been read. Now it is your turn.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Three doors — all open, none with a price tag.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/laroplan"
            className="rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Start free — open the curriculum
          </Link>
          <Link
            href="/profil"
            className="rounded-md border border-gold/50 px-5 py-2.5 text-sm font-semibold hover:bg-gold/10"
          >
            Test your profile
          </Link>
          <Link
            href="/bibliotek"
            className="rounded-md border border-gold/50 px-5 py-2.5 text-sm font-semibold hover:bg-gold/10"
          >
            See the library
          </Link>
        </div>
      </section>

      {/* ── 8 · SIGNATURE ────────────────────────────────────────────────── */}
      <p className="mt-12 border-t border-gold/30 pt-8 text-center font-serif text-lg font-bold leading-relaxed">
        AK1A Research Lab
        <span className="mt-1 block text-sm font-medium italic text-muted-foreground">
          Deeper than a blog. Clearer than a bank. Faster than a degree.
        </span>
      </p>
    </SeoPageShell>
  );
}
