import type { Metadata } from "next";
import Link from "next/link";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Fas2AnsokEn } from "@/components/ak1a/spegel/fas2-ansok-en";
import { getCourseList } from "@/lib/content";
import { SIFFROR } from "@/lib/siffror";
import { spegelMetadata } from "@/lib/spegel-metadata";
import { lasPriserGallande } from "@/lib/variabler-lagring";

// VÅG 80A (språk-agent 2): spegeln följer svenska originalsidans våg 79-
// kontrakt — priset läses live via lasPriserGallande() (Supabase-override,
// filen = fallback) med ISR 5 min, i stället för force-static + hårdkodat
// "SEK 9,999". Metadata behåller fil-default (SEO-stabilt), som originalet.
export const revalidate = 300;

/**
 * /en/fas2-ansok — full mirror of the Swedish /fas2-ansok flow page
 * (wave 51, agent S3). Every text is translated to professional
 * international finance English; the interactive application form is the
 * translated Fas2AnsokEn client component. Course titles are pulled
 * dynamically from the course catalogue (Swedish titles, phase 3 of the
 * language plan). Latin abbreviations (AKM1, V01–V20, AK1nvestor) and SEK
 * prices are kept.
 */

/**
 * Phase 2 (new model): the 18 fundamental masterworks, by category —
 * valuation, financial statements, corporate finance, value investing +
 * the AKM1 deep dive. Mirrors FAS2_KURSLISTA on the Swedish page.
 */
const FAS2_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "The valuation bibles",
    pitch:
      "Graham & Dodd, Damodaran, McKinsey, Williams, Rappaport & Mauboussin — the art of weighing a company in your hand, from financial statements to value.",
    slugs: [
      "security-analysis",
      "investment-valuation",
      "valuation-measuring-managing",
      "the-theory-of-investment-value",
      "expectations-investing",
    ],
  },
  {
    kategori: "Financial statements & accounting at analyst level",
    pitch:
      "Penman, Mulford & Comiskey, O'Glove, Schilit and Graham — find the quality in the earnings and see through what is only a story.",
    slugs: [
      "financial-statement-analysis-and-security-valuation",
      "creative-cash-flow-reporting",
      "quality-of-earnings",
      "financial-shenanigans",
      "interpretation-of-financial-statements",
    ],
  },
  {
    kategori: "Corporate finance & capital",
    pitch:
      "Higgins, Brealey and Whitman — capital structure, cash-flow mathematics and distressed companies at MBA level.",
    slugs: [
      "analysis-for-financial-management",
      "principles-of-corporate-finance",
      "distress-investing",
    ],
  },
  {
    kategori: "The masterworks of value investing + the AKM1 deep dive",
    pitch:
      "Klarman, Greenwald, Gray & Carlisle, Einhorn — and our own model AKM1 (V01–V20) at genuine analysis level.",
    slugs: [
      "margin-of-safety",
      "value-investing-from-graham-to-buffett",
      "quantitative-value",
      "fooling-some-of-the-people",
      "akm1-den-kontroversiella-modellen",
    ],
  },
];

export const metadata: Metadata = spegelMetadata({
  lang: "en",
  sida: "fas2-ansok",
  title: "Apply for Phase 2 — the Fundamental Path | AK1A",
  description:
    "Phase 2 is the fast fundamental path to becoming an independent analyst: nothing new — the same 20 analytical indicators (V01–V20), now weighed together the right way with the support of 18 masterworks — valuation (Graham & Dodd, Damodaran, McKinsey), financial statement analysis (Penman, Schilit, O'Glove), finance (Higgins, Brealey) and value investing (Klarman, Greenwald, Einhorn) plus AKM1 at full depth. Unlimited hours with the founder until you are worthy of the title independent analyst, and the opportunity to become a representative of AK1nvestor. No technical analysis training — the master level is Phase 3. SEK 9,999, 90-day satisfaction guarantee: payment only after 90 days if you remain satisfied.",
  keywords: [
    "Phase 2 application",
    "fundamental analysis education Sweden",
    "weighing fundamental indicators",
    "valuation Damodaran",
    "Penman financial statement analysis",
    "Klarman margin of safety",
    "independent analyst",
    "AK1nvestor representative",
    "stock analysis education",
  ],
});

export default async function Fas2AnsokPageEn() {
  // Pris-talet live ur variabellagret (kastar aldrig — filen är fallback);
  // klientkomponenten får det som serialiserbar prop (samma som originalet).
  const priser = await lasPriserGallande();
  const katalog = getCourseList();
  const titelFor = (slug: string) =>
    katalog.find((k) => k.slug === slug)?.title ?? slug;
  const antalFas2 = FAS2_KURSLISTA.reduce((s, k) => s + k.slugs.length, 0);

  return (
    <SeoPageShell lang="en" breadcrumb={[{ name: "Home", href: "/en" }, { name: "Phase 2 Application" }]}>
      <article className="space-y-8">
        <header className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
            {`Phase 2 · The fast fundamental path · SEK ${priser.fas2EnGang.toLocaleString("en-US")}`}
          </p>
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            Apply for Phase 2
          </h1>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            Phase 1 is the entire core library — free of charge, forever. Phase 2
            is something else: <strong>the fast fundamental path to becoming an
            independent analyst</strong>. We do not teach you anything new — it
            is the same 20 analytical indicators (V01–V20) you met in Phase 1,
            but now you learn to analyse them the right way, and above all:{" "}
            <strong>to weigh them together</strong> into a judgement that is
            your own. With a human being at your side — personal training with
            the founder and group coaching — you get unlimited hours, until you
            are worthy of the title independent stock analyst. We accept a
            limited number of students at a time, which is why an application
            is required.
          </p>
        </header>

        {/* CLEAR: no technical analysis + the representative opportunity — two promises */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="gravor-ram rounded-2xl bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Let us be clear: no technical analysis here
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We teach <strong className="text-foreground">nothing</strong> in
              technical analysis within Phase 2. Waves, Elliott and the dynamic
              ecosystem are{" "}
              <Link href="/en/fas3" className="underline hover:text-foreground">
                Phase 3
              </Link>{" "}
              — Phase 2 is the craft behind the judgement: to read, value and
              defend a company with numbers.
            </p>
          </div>
          <div className="gravor-ram rounded-2xl bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              The representative opportunity
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Phase 2 opens the path to <strong className="text-foreground">becoming
              a representative of AK1nvestor</strong> — representing us with
              quality. For the student who wants it, the education is the
              beginning of that relationship, not the end of it.
            </p>
          </div>
        </div>

        <Fas2AnsokEn prisFas2={priser.fas2EnGang} />

        {/* SOCIAL PROOF — numbers and student voices after the requirements/application part.
            English mirror of the SocialProof band (figures from src/lib/siffror). */}
        <section
          aria-label="AK1A Research Lab in numbers and student voices"
          className="marin-panel relative overflow-hidden rounded-3xl p-6 sm:p-10"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute inset-3 rounded-2xl border border-gold/20" />
          </div>
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              AK1A Research Lab · in numbers and student voices
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
                  etikett: "that make you think — not just read. That is where the knowledge sticks",
                },
                {
                  tal: "100 %",
                  huvud: "free",
                  etikett: "in Phase 1 — the entire library, free of charge, forever. We earn through trust",
                },
              ].map((s) => (
                <div key={s.huvud} className="rounded-2xl border border-gold/25 bg-black/20 p-5">
                  <p className="font-serif text-4xl font-black tabular-nums text-gold">{s.tal}</p>
                  <p className="mt-2 font-serif text-lg font-semibold">{s.huvud}</p>
                  <p className="mt-1 text-xs leading-relaxed opacity-70">{s.etikett}</p>
                </div>
              ))}
            </div>
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
                <figure key={e.namn} className="rounded-2xl border border-gold/25 bg-black/20 p-5">
                  <p className="text-sm tracking-widest" aria-label="5 out of 5 stars">
                    ⭐⭐⭐⭐⭐
                  </p>
                  <blockquote className="mt-3 font-serif text-lg italic leading-snug">
                    &ldquo;{e.citat}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-semibold">{e.namn}</span>
                    <span className="opacity-60"> · {e.typ}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-6 text-center text-xs opacity-50">
              No card details. No selling. Phase 1 is free — forever. Student
              voices are shown with first names and real levels.
            </p>
          </div>
        </section>

        {/* WHAT PHASE 2 INCLUDES */}
        <section className="space-y-5 rounded-xl border border-gold/30 bg-card p-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
            What Phase 2 includes
          </p>
          <h2 className="font-serif text-2xl font-bold">
            The synthesis — and a human being who brings it together
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            In Phase 1 you learn the parts: variable by variable, book by book,
            chapter by chapter. Phase 2 is the next decisive step:{" "}
            <strong>weighing the 20 analytical indicators together</strong> —
            the {antalFas2} masterworks are the map, the synthesis is the
            journey. It is the fast path to one day standing as a fully
            independent analyst, with a judgement that is your own. Everything
            fundamental, nothing else.
          </p>

          {/* The course list, by category */}
          <div className="space-y-4">
            {FAS2_KURSLISTA.map((kat) => (
              <div key={kat.kategori} className="rounded-lg border border-gold/20 bg-paper p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {kat.kategori}{" "}
                  <span className="font-normal text-gold">· {kat.slugs.length} courses</span>
                </h3>
                <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                  {kat.pitch}
                </p>
                <ul className="mt-2 grid gap-1 text-xs leading-relaxed text-muted-foreground sm:grid-cols-2">
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

          {/* The training beyond the courses */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                namn: "The founder at your side",
                text: "Personal training with the founder of AK1A and group coaching together with other clients — unlimited hours, until you are worthy of the title independent stock analyst.",
              },
              {
                namn: "Representative of AK1nvestor",
                text: "Phase 2 opens the path to remaining a representative of AK1nvestor — representing us with quality, when the education carries you there.",
              },
              {
                namn: "Companies tested with numbers",
                text: "Suggestions of companies during the training — tested with AKM1's variables, numbers and thresholds, never on feeling.",
              },
            ].map((v) => (
              <div key={v.namn} className="rounded-lg border border-gold/20 bg-paper p-4">
                <h4 className="font-serif text-sm font-bold text-foreground">{v.namn}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>

          {/* The Phase 1 defence */}
          <p className="rounded-lg border border-dashed border-gold/40 bg-paper p-4 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">
              Phase 1 remains free — always.
            </strong>{" "}
            Phase 2 is for the student who wants to go from understanding the
            parts to carrying a fundamental judgement of their own. Phase 1
            hides nothing: everything basic we know is free, and it stays that
            way.
          </p>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Everything in AK1A Research Lab is research-based education in stock
            analysis — never investment advice, and never tips to buy or sell.
            Analyses and courses build on open sources and declared assumptions.
          </p>
        </section>

        <section className="rounded-xl border border-dashed border-gold/40 bg-paper p-6">
          <h2 className="font-serif text-xl font-bold">What happens after you apply</h2>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">1.</strong> We read your
              application personally — together with your student status in
              Phase 1. The requirement, honestly stated: finish Phase 1, and
              have the will to succeed with fundamental stock analysis —
              without that will, it is hard to stay focused.
            </li>
            <li>
              <strong className="text-foreground">2.</strong> You receive an
              invitation to a free-of-charge meeting with the founder. No sales
              pressure — a conversation.
            </li>
            <li>
              <strong className="text-foreground">3.</strong> If you decide to
              move on, the training starts immediately — and you pay nothing
              during the first 90 days. Payment takes place only after 90 days,
              and only if you remain satisfied (90-day satisfaction guarantee).
            </li>
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Unsure?{" "}
            <Link href="/en/medlemskap" className="underline hover:text-foreground">
              Compare Phase 1, Phase 2 and Phase 3 at your own pace
            </Link>
            . Phase 1 hides nothing — everything basic we know is free, and it
            stays that way.
          </p>
        </section>
      </article>
    </SeoPageShell>
  );
}
