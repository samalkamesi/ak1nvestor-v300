import type { Metadata } from "next";
import Link from "next/link";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Fas3Cert } from "@/components/ak1a/fas3-cert";
import { getCourseList } from "@/lib/content";
import { spegelMetadata, spegelWebsiteJsonLd } from "@/lib/spegel-metadata";
import { JsonLd } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * /en/fas3 — full mirror of the Swedish /fas3 flow page (wave 51, agent S3).
 * Every text translated to professional international finance English; the
 * progress widget Fas3Cert is reused as-is (client component). Course titles
 * come dynamically from the course catalogue (Swedish titles, phase 3 of the
 * language plan). Latin abbreviations (AKM1, AK1TS, EMH, DCF) and SEK prices
 * are kept.
 */

/**
 * Phase 3's 24 courses, by category (3 ecosystem flagships + 17 canon works
 * in technical analysis + 4 trading psychology). Mirrors FAS3_KURSLISTA on
 * the Swedish page.
 */
const FAS3_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "The ecosystem flagships",
    pitch:
      "Where fundamental analysis stops being static — the variables become time series, value meets waves, and the parts become an ecosystem.",
    slugs: [
      "ak1ts-vaglarans-hierarki",
      "vagfundament-variablerna-som-tidsserier",
      "konfluens-varde-moter-vagor",
    ],
  },
  {
    kategori: "Technical analysis at master level",
    pitch:
      "The 17 canon works — Elliott, Murphy, Nison, Bollinger, Edwards & Magee, Bulkowski, DeMark, Pring, Elder, Torssell and the trend followers. In Phase 3 they are read not as history but as instruments in the ecosystem.",
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
    kategori: "Trading psychology & neuroeconomics",
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

/** The content points — what Phase 3 gives you. */
const INNEHALL = [
  {
    rubrik: "The AK1TS × AKM1 integration",
    text: "The composite analysis where fundamental strength meets waves: AKM1's variables and AK1TS's wave hierarchy merge into a single coherent answer — not two separate pictures, but one.",
  },
  {
    rubrik: "The Wave Foundation",
    text: "Every fundamental variable as a time series. P/E, margins, growth — no measure is a point on a scale; everything is a curve with its own rhythm, and here you learn to read it.",
  },
  {
    rubrik: "The Confluence Radar",
    text: "Where value is guaranteed to meet waves — across five dimensions, which must speak together before a conclusion may land. Value floor first, waves second.",
  },
  {
    rubrik: "The portfolio's waves",
    text: "Your portfolio's wave profile on the micro, short, medium-long, long and mega horizons — the whole moves, not just the individual companies.",
  },
  {
    rubrik: "Technical analysis at master level",
    text: "17 canon works: Elliott, Murphy, Nison, Bollinger, Edwards & Magee, Bulkowski, Torssell and more — read chapter by chapter as living instruments.",
  },
  {
    rubrik: "Trading psychology & neuroeconomics",
    text: "Douglas, Coates, Shull and Zweig — the market is fought in the mind, and the ecosystem measures behaviour daily.",
  },
  {
    rubrik: "Rights to ALL future developments",
    text: "Analysis of stocks and portfolios, the dashboard, the highest-quality AI connection, reports and more — everything is under development, and you are in from the start.",
  },
] as const;

/** The requirements matrix — six equally weighted criteria, each graded A–F. */
const KRAV = [
  {
    kriterium: "Methodological coverage",
    a: "All 24 steps completed, variables motivated per company, four dimensions throughout.",
    f: "Variables scored without motivation; steps skipped.",
  },
  {
    kriterium: "Statistical honesty",
    a: "Independent votes required before a conclusion, calibration reported, confluence graded.",
    f: "\u201CEverything points the same way\u201D without independent control; probabilities on feeling.",
  },
  {
    kriterium: "Reporting",
    a: "Numbers traced to sources, pro forma at regime breaks, earnings-quality section in place.",
    f: "Multiple valuations unchecked against the company's own reports.",
  },
  {
    kriterium: "Falsifiability",
    a: "Every thesis with a break point and an action; follow-up scores old forecasts.",
    f: "Scenarios without invalidation conditions; no follow-up.",
  },
  {
    kriterium: "Controversy openness",
    a: "Opposing arguments heard and answered; estimates and data gaps declared.",
    f: "Only confirming reasoning.",
  },
  {
    kriterium: "Communication",
    a: "Report readable by a layperson without losing rigour; risk declaration in place.",
    f: "Impenetrable or misleading presentation.",
  },
] as const;

/** The practical portfolio — what counts. */
const PORTFOLJ = [
  {
    ikon: "🏅",
    rubrik: "10 complete Superanalyses",
    text: "Ten different companies with a spread requirement: at least 4 sectors, at least one large cap and one small cap. Every complete analysis you save in the tool counts automatically — the portfolio grows as you practise.",
    auto: true,
  },
  {
    ikon: "📡",
    rubrik: "At least 4 full Confluence readings",
    text: "Tied to your Superanalyses: value floor BEFORE waves, and five independent voices that must speak together before a conclusion may land.",
    auto: true,
  },
  {
    ikon: "📊",
    rubrik: "At least 2 print-ready Report Builder reports",
    text: "Multiple valuation and DCF with sensitivity matrix, three scenarios, Monte Carlo/Bayes/Kelly, risk matrix and trigger matrix — at least one in the short format on a large cap, to show that you know when heavier tools are superfluous.",
    auto: true,
  },
  {
    ikon: "🔁",
    rubrik: "At least 1 follow-up analysis",
    text: "One of your own earlier analyses reopened: break points scored and the marked history reported. The soul of the certification — the ability to judge your own work.",
    auto: false,
  },
  {
    ikon: "⚔️",
    rubrik: "At least 1 open debate analysis",
    text: "In writing: how the opponents would attack your conclusion (EMH, random walk, academic TA criticism, the quant-factor tradition) — and your reply. Controversial honesty, turned into examinable competence.",
    auto: false,
  },
] as const;

/** The ethics module's three examinable promises. */
const LOFTEN = [
  {
    nr: "1",
    namn: "Report the opposition",
    text: "Every analysis in the portfolio shows how the opponents think — before your own conclusion. The open debate analysis is the point of this promise.",
  },
  {
    nr: "2",
    namn: "Declare before results",
    text: "Theory weights, the scoring table and data sources are published in the report before the conclusion. The recommendation follows the table — never the other way around.",
  },
  {
    nr: "3",
    namn: "Falsifiability",
    text: "No thesis without a break point, no scenario without invalidation conditions — and follow-up before new analysis.",
  },
] as const;

/** The AKU cycle — annual maintenance of the certification. */
const AKU = [
  {
    ikon: "🏅",
    text: "1 new portfolio analysis — Superanalysis + Confluence on a current company.",
  },
  {
    ikon: "🔁",
    text: "1 validation round of your own older forecasts — with reported accuracy.",
  },
  {
    ikon: "⚖️",
    text: "1 ethics discussion around a current case (about 2 hours).",
  },
] as const;

export const metadata: Metadata = spegelMetadata({
  lang: "en",
  sida: "fas3",
  title: "Phase 3 — The Dynamic Ecosystem | AK1A",
  description:
    "Phase 3 is the certification phase — practical portfolio and application — and where fundamental analysis starts to move: no indicator value is static, but a time series with a rhythm of its own. The AKM1 × AK1TS integration, the Wave Foundation, the Confluence Radar, the portfolio's waves, 17 canon works in technical analysis and trading psychology — plus the dashboard, the AI connection and rights to all future developments. SEK 13,999, 90-day satisfaction guarantee. Begins after applying Phase 2. Research-based education — never investment advice.",
  keywords: [
    "Phase 3 ecosystem",
    "AKM1 AK1TS integration",
    "wave foundation time series",
    "confluence value and waves",
    "technical analysis master level",
    "Elliott Wave education",
    "trading psychology neuroeconomics",
    "portfolio waves",
  ],
});

export default function Fas3PageEn() {
  const katalog = getCourseList();
  const titelFor = (slug: string) =>
    katalog.find((k) => k.slug === slug)?.title ?? slug;
  const antalKurser = FAS3_KURSLISTA.reduce((s, k) => s + k.slugs.length, 0);

  return (
    <SeoPageShell
      breadcrumb={[{ name: "Home", href: "/en" }, { name: "Phase 3 — The Ecosystem" }]}
      wide
    >
      <JsonLd data={spegelWebsiteJsonLd("en")} />

      {/* ── HERO — marine panel: fundamental analysis starts to move ──────── */}
      <section className="marin-panel relative overflow-hidden rounded-3xl border-2 border-gold/60 p-7 shadow-2xl sm:p-12">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
          <span className="font-serif text-[150px] font-black tracking-tight">PHASE 3</span>
        </div>
        <div className="pointer-events-none absolute inset-2 rounded-2xl border border-[#E8C766]/30" aria-hidden />
        <div className="relative max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
            The dynamic ecosystem · Phase 3 · SEK 13,999
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#EDE6D6] sm:text-5xl">
            Phase 3 — where fundamental analysis starts to move
          </h1>
          <p className="mt-4 font-serif text-lg italic leading-relaxed text-[#E8C766] sm:text-xl">
            Indicators are not static — they are time series with a rhythm of
            their own.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#EDE6D6]/85 sm:text-base">
            In Phase 2 you learn to weigh a company in your hand — financial
            statements, value, judgement — and to weigh the 20 analytical
            indicators together into a whole. Phase 3 is the certification
            phase: a practical portfolio and application. It begins when that
            judgement stands clear, and shows what no table of numbers can
            show: that fundamental analysis is{" "}
            <strong className="text-[#EDE6D6]">never static</strong>. Every
            indicator moves — revenues, margins, multiples, all the time. Here
            we integrate AKM1 with AK1TS — waves, in other words — and the
            analysis becomes a living ecosystem.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#innehall"
              className="rounded-md bg-gold px-5 py-3 text-center text-sm font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
            >
              See the contents ↓
            </a>
            <Link
              href="#krav"
              className="rounded-md border border-[#E8C766]/50 px-5 py-3 text-center text-sm font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/10"
            >
              Requirements matrix &amp; practical portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* ── THE PRECONDITION — Phase 3 begins after applying Phase 2 ──────── */}
      <section className="gravor-ram mt-8 rounded-2xl bg-card p-6 sm:p-7">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
          The precondition — the order is not negotiable
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Phase 3 begins after applying
          Phase 2</strong> — first the fundamental judgement, then the dynamic.
          The ecosystem presumes that you can already read financial
          statements, value a company and defend a conclusion with numbers.
          Have you not taken that path? It begins with a{" "}
          <Link href="/en/fas2-ansok" className="underline hover:text-foreground">
            free-of-charge application to Phase 2
          </Link>{" "}
          — the fast fundamental path to independent analyst.
        </p>
      </section>

      {/* ── YOUR PROGRESS — the raw material of the practical portfolio, read locally ── */}
      <div className="mt-10">
        <Fas3Cert />
      </div>

      <div className="hjarlinje mt-10" />

      {/* ── THE CONTENT — what Phase 3 gives you ──────────────────────────── */}
      <section id="innehall" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">What Phase 3 gives you</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Phase 3 is the opportunity to apply — and to understand how
          fundamental analysis is not static. All indicators move dynamically,
          and here you get the tools to move with them.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {INNEHALL.map((p, i) => (
            <div
              key={p.rubrik}
              className={`relative rounded-2xl border border-gold/30 bg-card p-5 ${
                i === INNEHALL.length - 1 ? "md:col-span-2 border-gold/50" : ""
              }`}
            >
              <p className="flex items-start gap-2.5 font-serif text-lg font-bold text-foreground">
                <span className="mt-0.5 shrink-0 text-gold">✓</span>
                {p.rubrik}
              </p>
              <p className="mt-1.5 pl-7 text-xs leading-relaxed text-muted-foreground">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE 24 COURSES — by category, titles from the catalogue ───────── */}
      <section id="kurser" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">
          The {antalKurser} courses of Phase 3
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Three ecosystem flagships, seventeen canon works in technical
          analysis and four in trading psychology — everything that requires a
          mature fundamental judgement to become more than a curiosity.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {FAS3_KURSLISTA.map((kat) => (
            <div key={kat.kategori} className="rounded-xl border border-gold/30 bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">
                {kat.kategori}{" "}
                <span className="font-normal text-gold">· {kat.slugs.length} courses</span>
              </h3>
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
      </section>

      {/* ── UNDER DEVELOPMENT — you are in from the start ─────────────────── */}
      <section id="framtiden" className="mt-12 scroll-mt-24">
        <div className="marin-panel rounded-2xl border border-gold/40 p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold text-[#EDE6D6]">
            Under development — and you are in from the start
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#EDE6D6]/85">
            Phase 3 is not a finished product but a living place. As a Phase 3
            student you have{" "}
            <strong className="text-[#EDE6D6]">rights to all future
            developments</strong> within Phase 3 — everything that is built is
            built for you too:
          </p>
          <ul className="mt-4 grid gap-2.5 text-sm text-[#EDE6D6]/85 sm:grid-cols-2">
            {[
              "📊 Analysis of stocks and portfolios — deeper, faster, alive",
              "🖥️ The dashboard — the analytical ecosystem gathered in one view",
              "🤖 Direct connection to AI of the highest quality",
              "📄 Reports and more — auto-generated, traceable to sources",
            ].map((txt) => (
              <li key={txt} className="flex gap-2.5">
                <span className="text-[#E8C766]">✓</span>
                <span>{txt}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-[#EDE6D6]/70">
            We do not promise finished dates — we promise the direction, and
            that you as a Phase 3 student are in from day one. Everything is
            under development.
          </p>
        </div>
      </section>

      <div className="hjarlinje mt-12" />

      {/* ── REQUIREMENTS MATRIX — six criteria, A–F ───────────────────────── */}
      <section id="krav" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">
          The requirements matrix — six criteria, grades A–F
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The portfolio is graded on six equally weighted criteria, each A–F.
          The final grade is set on{" "}
          <strong>the portfolio as a whole — never on the person</strong>. An F
          on a criterion is a work order to do it again, not a verdict; the
          rounds have no ceiling.
        </p>
        <div className="table-wrap mt-5 w-full overflow-x-auto rounded-xl border border-gold/30 bg-card">
          <table className="w-full min-w-[640px] text-start text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gold/30 bg-gold/5">
                <th className="px-4 py-3 font-serif text-sm font-bold text-gold">Criterion</th>
                <th className="px-4 py-3 font-serif text-sm font-bold text-gold">
                  An A is recognisable by
                </th>
                <th className="px-4 py-3 font-serif text-sm font-bold text-gold">
                  An F is recognisable by
                </th>
              </tr>
            </thead>
            <tbody>
              {KRAV.map((k) => (
                <tr key={k.kriterium} className="border-b border-gold/10 last:border-b-0">
                  <td className="px-4 py-3 align-top font-semibold text-foreground">
                    {k.kriterium}
                  </td>
                  <td className="px-4 py-3 align-top leading-relaxed text-muted-foreground">
                    {k.a}
                  </td>
                  <td className="px-4 py-3 align-top leading-relaxed text-muted-foreground/80">
                    {k.f}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The scale is deliberately raised from Phase 1's certificate A–D
          (which measures level and XP) to A–F on <em>the work</em> — the same
          subjects, higher cognitive demand: integrate and apply, independently.
        </p>
      </section>

      {/* ── THE PRACTICAL PORTFOLIO — what counts ─────────────────────────── */}
      <section id="portfolj" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">
          The practical portfolio — ten complete analyses
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The core requirement of the certification, built in the platform's
          own tools — the ones you already use every week. No new tools are
          needed: the tools become the classroom. The portfolio is a half-open
          examination that grows gradually, not a single exam occasion.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {PORTFOLJ.map((p) => (
            <div
              key={p.rubrik}
              className="marin-panel relative rounded-2xl border border-gold/30 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-serif text-lg font-bold text-[#EDE6D6]">
                  {p.ikon} {p.rubrik}
                </p>
                {p.auto && (
                  <span
                    className="shrink-0 rounded-full border border-[#E8C766]/50 bg-[#E8C766]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#E8C766]"
                    title="Tracked automatically in the tool — nothing to count by hand"
                  >
                    ✓ Auto-tracked
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#EDE6D6]/85">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-gold/30 bg-paper p-4 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Elective tracks.</strong> Two of
          the ten slots may go deeper either towards special situations and
          share issues, or towards portfolio and risk work — the track appears
          on the certificate. Review takes place in two stages: AI pre-review
          against the schema, then the founder's human final judgement.
        </div>
      </section>

      <div className="hjarlinje mt-12" />

      {/* ── THE ETHICS MODULE — three examinable promises ─────────────────── */}
      <section id="etik" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">
          The ethics module — honesty as an examinable core
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Our stance is <strong>honesty over comfort</strong> — and it is not
          an attitude but three concrete promises that can be examined. They
          are taken straight from the methodology's hard rules, and they apply
          to every analysis in the portfolio:
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {LOFTEN.map((l, i) => (
            <div
              key={l.nr}
              className="relative rounded-2xl border border-gold/40 bg-card p-5 shadow-sm"
            >
              <p className="font-serif text-3xl font-bold text-gold">{l.nr}</p>
              <p className="mt-1 font-serif text-lg font-bold">{l.namn}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{l.text}</p>
              {i < LOFTEN.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-3 top-1/2 hidden -translate-y-1/2 font-serif text-2xl font-bold text-gold md:block"
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          In addition an ethics case part with dilemmas adapted to the reality
          of an analyst: &ldquo;your published analysis contains an
          arithmetic error — what do you do?&rdquo;. The answers are judged on
          the honesty of the reasoning, never on a &ldquo;right answer&rdquo; —
          an F means do it again with the questions as your compass.
        </p>
      </section>

      {/* ── THE B2B ENTITLEMENT ───────────────────────────────────────────── */}
      <section id="b2b" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">
          Certified = ready for the /pro platform
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The certification is the gateway to Phase 3's purpose: those who are
          certified are ready for <strong>the /pro platform</strong> — the
          analyst surface with portfolio import, report templates and
          rights-controlled modules — and for{" "}
          <strong>the relationship with AK1nvestor</strong>, the path to
          working with us. But the certification and the entitlement are two
          different things, and that should be said honestly:
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-gold/40 bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              The certification — anyone can reach it
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              A personal certificate: practical portfolio + ethics part with
              grades A–F. Shareable, documented and yours forever — valuable
              even if you never want to work within the ecosystem. The
              certification attests <em>craft and honesty</em>.
            </p>
          </div>
          <div className="rounded-xl border border-gold/40 bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              The entitlement — a next-step relationship
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Grade C or higher opens the /pro platform. Representing
              AK1nvestor additionally requires the founder's personal
              assessment and a signed AK1A analyst code. The certification
              alone is <strong>never</strong> an advice entitlement.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Compliance, with dignity: Phase 3 is a{" "}
          <strong>research-based competence examination</strong> — never
          investment advice, never an advisory licence in the meaning of the
          Swedish Financial Supervisory Authority. Saying this plainly is
          itself an example of the honesty Phase 3 examines. See our{" "}
          <Link href="/finansiell-policy" className="underline hover:text-foreground">
            financial policy
          </Link>
          .
        </p>
      </section>

      {/* ── AKU — knowledge is perishable ─────────────────────────────────── */}
      <section id="aku" className="mt-12 scroll-mt-24">
        <div className="marin-panel rounded-2xl border border-gold/30 p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold text-[#EDE6D6]">
            ÅKU — knowledge is perishable
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#EDE6D6]/85">
            The certification is a{" "}
            <strong className="text-[#EDE6D6]">living state</strong>, not the
            date on a diploma. Every year you top up with an annual knowledge
            update (ÅKU) adapted to your role as an analyst:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#EDE6D6]/85">
            {AKU.map((a) => (
              <li key={a.text} className="flex gap-2.5">
                <span className="text-[#E8C766]">{a.ikon}</span>
                <span>{a.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-[#EDE6D6]/70">
            A missed renewal means that the certification{" "}
            <em>rests</em> — it is never withdrawn — and it is reactivated by
            a completed ÅKU cycle. The entitlement is always kept fresh, for
            your sake and for those you work with.
          </p>
        </div>
      </section>

      {/* ── THE PRICE MODEL — one-time + honest box about the monthly plan ── */}
      <section className="mt-12 rounded-3xl border-2 border-gold bg-card p-7 text-center shadow-lg sm:p-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
          Phase 3 · The dynamic ecosystem · One-time price
        </p>
        <p className="mt-3 font-serif text-4xl font-black text-gold sm:text-5xl">
          SEK 13,999
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A one-time payment for the entire education: the {antalKurser}
          {" "}courses, the ecosystem integration, the practical portfolio,
          the certification with grades A–F — and the rights to all future
          developments within Phase 3. Nobody pays for content in Phase 1; in
          Phase 3 you pay for the ecosystem, the review and your place in the
          development.
        </p>
        {/* The honest box — plain words about the monthly plan */}
        <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-dashed border-gold/50 bg-paper p-4 text-start">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
            The honest price, stated plainly
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            After the education ends, the analytical ecosystem and the
            dashboard can continue to be used through a monthly plan
            (12 months).{" "}
            <strong className="text-foreground">The education itself is yours
            forever</strong> — the knowledge never leaves you; the tools live
            and keep developing.
          </p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The 90-day satisfaction guarantee applies here too — payment takes
          place only after 90 days, and only if you remain satisfied · Phase 2
          members move on first · All tools remain free in Phase 1, forever.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/en/fas2-ansok"
            className="rounded-md bg-gold px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Not done with Phase 2? Start there — free application
          </Link>
          <Link
            href="/en/medlemskap"
            className="rounded-md border border-gold/50 px-5 py-3 text-sm font-semibold hover:bg-gold/10"
          >
            Compare Phases 1, 2 and 3
          </Link>
        </div>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Ready to start building?{" "}
        <Link href="/superanalys" className="underline hover:text-foreground">
          Open the Superanalysis
        </Link>{" "}
        and start your practical portfolio today — every analysis you save
        counts, automatically. AK1A Research Lab provides research-based
        financial analysis — nothing here is investment advice.
      </p>
    </SeoPageShell>
  );
}
