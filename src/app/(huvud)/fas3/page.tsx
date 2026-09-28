import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { StrukturData } from "@/components/seo/StrukturData";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { SocialProof } from "@/components/ak1a/social-proof";
import { Fas3Cert } from "@/components/ak1a/fas3-cert";
import { getCourseList } from "@/lib/content";
import { PRISER, kr } from "@/lib/variabler";

export const dynamic = "force-static";
// Prissida (PRISER.fas3EnGang SSR:as) — revalidate=300 som produktfamiljen
// /fas2-ansok, /medlemskap, /prenumeration; årslåset (o10 §2) dör även här.
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  path: "/fas3",
  harSpeglar: true, // Ömsesidig hreflang med /en|ar/fas3 (VÅG 63 O3 #2)
  title: "Fas 3 — Det Dynamiska Ekosystemet | AK1A",
  description:
    `Fas 3 är certifieringsfasen — praktikportfölj och tillämpning — och där fundamentalanalysen börjar röra sig: inget indikatorvärde är statiskt utan en tidsserie med egen rytm. AKM1 × AK1TS-integrationen, Vågfundamentet, Konfluensradarn, Portföljens vågor, 17 kanonverk i teknisk analys och trading-psykologi — plus dashboard, AI-koppling och rätt till alla framtida utvecklingar. ${kr(PRISER.fas3EnGang)} kr, 90 dagars nöjd-kund-garanti. Tar vid efter tillämpning av Fas 2. Pedagogisk utbildning — aldrig investeringsråd.`,
  keywords: [
    "Fas 3 ekosystem",
    "AKM1 AK1TS integration",
    "vågfundament tidsserier",
    "konfluens värde och vågor",
    "teknisk analys mästarnivå",
    "Elliott Wave utbildning",
    "trading psykologi neuroekonomi",
    "portföljens vågor",
  ],
});

/**
 * Fas 3:s 24 kurser, kategorivis (3 ekosystem-flaggskepp + 17 kanonverk i
 * teknisk analys + 4 trading-psykologi). Titlar hämtas dynamiskt ur
 * kurskatalogen (public/deep-courses.json) så listan aldrig halkar ur synk
 * med det faktiska innehållet. Spegla FAS3_KURSER i src/lib/kurs-access.ts.
 */
const FAS3_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "Ekosystem-flaggskeppen",
    pitch:
      "Där fundamentalanalysen slutar vara statisk — variablerna blir tidsserier, värde möter vågor, och delarna blir ett ekosystem.",
    slugs: [
      "ak1ts-vaglarans-hierarki",
      "vagfundament-variablerna-som-tidsserier",
      "konfluens-varde-moter-vagor",
    ],
  },
  {
    kategori: "Teknisk analys på mästarnivå",
    pitch:
      "De 17 kanonverken — Elliott, Murphy, Nison, Bollinger, Edwards & Magee, Bulkowski, DeMark, Pring, Elder, Torssell och trendföljarna. I Fas 3 läses de inte som historia utan som instrument i ekosystemet.",
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
    kategori: "Trading-psykologi & neuroekonomi",
    pitch:
      "Fienden sitter vid ditt eget skrivbord — Douglas, Coates, Shull och Zweig lär dig känna igen honom.",
    slugs: [
      "trading-in-the-zone",
      "the-hour-between-dog-and-wolf",
      "market-mind-games",
      "your-money-and-your-brain",
    ],
  },
];

/** Innehållspunkterna — det Fas 3 ger dig (användarens Fas-modell 2026-09). */
const INNEHALL = [
  {
    rubrik: "AK1TS × AKM1-integrationen",
    text: "Den sammansatta analysen där fundamentalstyrka möter vågor: AKM1:s variabler och AK1TS våghierarki förenas till ett enda sammanhängande svar — inte två separata bilder, utan en.",
  },
  {
    rubrik: "Vågfundamentet",
    text: "Varje fundamentalvariabel som tidsserie. P/E, marginaler, tillväxt — inget mått är en punkt på en skala; allt är en kurva med egen rytm, och här lär du dig läsa den.",
  },
  {
    rubrik: "Konfluensradarn",
    text: "Där värde garanterat möter vågor — i fem dimensioner, som måste tala samman innan en slutsats får landa. Värdegolv först, vågor sedan.",
  },
  {
    rubrik: "Portföljens vågor",
    text: "Din portföljs vågprofil på mikro-, kort-, medellång-, lång- och mega-horisont — helheten rör sig, inte bara de enskilda bolagen.",
  },
  {
    rubrik: "Teknisk analys på mästarnivå",
    text: "17 kanonverk: Elliott, Murphy, Nison, Bollinger, Edwards & Magee, Bulkowski, Torssell och fler — lästa kapitel för kapitel som levande instrument.",
  },
  {
    rubrik: "Trading-psykologi & neuroekonomi",
    text: "Douglas, Coates, Shull och Zweig — marknaden utkämpas i sinnet, och ekosystemet mäter beteende dagligen.",
  },
  {
    rubrik: "Rätt till ALLA framtida utvecklingar",
    text: "Analys av aktier och portföljer, dashboarden, AI-kopplingen med högst kvalitet, rapporter m.m. — allt är under utveckling, och du är med från början.",
  },
] as const;

/** Kravmatrisen — sex likaviktade kriterier, vardera betyg A–F (forskning-fas3 3.7). */
const KRAV = [
  {
    kriterium: "Metodisk täckning",
    a: "Alla 24 steg genomgångna, variabler motiverade per bolag, fyra dimensioner genomgående.",
    f: "Variabler poängsatta utan motivering; steg hoppade över.",
  },
  {
    kriterium: "Statistisk ärlighet",
    a: "Oberoende röster krävs innan slutsats, kalibrering redovisad, konfluens graderad.",
    f: "”Allt pekar samma håll” utan oberoende kontroll; sannolikheter på känsla.",
  },
  {
    kriterium: "Redovisning",
    a: "Siffror spårade till källor, proforma vid regimbrott, resultatkvalitetsavsnitt på plats.",
    f: "Multipelvärden okontrollerade mot bolagets egna rapporter.",
  },
  {
    kriterium: "Falsifierbarhet",
    a: "Varje tes med brytpunkt och agerande; uppföljning poängsätter gamla prognoser.",
    f: "Scenarier utan ogiltigförklaringsvillkor; ingen uppföljning.",
  },
  {
    kriterium: "Kontrovers-öppenhet",
    a: "Motståndets argument hörda och besvarade; uppskattningar och dataluckor deklarerade.",
    f: "Enbart bekräftande resonemang.",
  },
  {
    kriterium: "Kommunikation",
    a: "Rapporten läsbar av en lekman utan att förlora stringens; riskdeklaration på plats.",
    f: "Ogenomtränglig eller vilseledande presentation.",
  },
] as const;

/** Praktikportföljen — vad som räknas (forskning-fas3 3.3). */
const PORTFOLJ = [
  {
    ikon: "🏅",
    rubrik: "10 kompletta Superanalyser",
    text: "Tio olika bolag med krav på spridning: minst 4 sektorer, minst ett storbolag och ett småbolag. Varje komplett analys du sparar i verktyget räknas automatiskt — portföljen växer fram medan du övar.",
    auto: true,
  },
  {
    ikon: "📡",
    rubrik: "Minst 4 fulla Konfluens-läsningar",
    text: "Kopplade till dina Superanalyser: värdegolv FÖRE vågor, och fem oberoende röster som måste tala samman innan en slutsats får landa.",
    auto: true,
  },
  {
    ikon: "📊",
    rubrik: "Minst 2 tryckklara rapportbyggar-rapporter",
    text: "Multipelvärdering och DCF med känslighetsmatris, tre scenarier, Monte Carlo/Bayes/Kelly, riskmatris och trigger-matris — minst en i det korta formatet på ett storbolag, för att visa att du vet när tyngre verktyg är överflödiga.",
    auto: true,
  },
  {
    ikon: "🔁",
    rubrik: "Minst 1 uppföljningsanalys",
    text: "En egen tidigare analys återöppnas: brytpunkter poängsätts och den märkta historiken redovisas. Certifieringens själsrörelse — förmågan att döma sitt eget arbete.",
    auto: false,
  },
  {
    ikon: "⚔️",
    rubrik: "Minst 1 öppen debatt-analys",
    text: "Skriftligt: hur motståndarna skulle angripa din slutsats (EMH, random walk, akademisk TA-kritik, kvantfaktor-traditionen) — och ditt svar. Kontroversiell ärlighet, omvandlad till examinationsbar kompetens.",
    auto: false,
  },
] as const;

/** Etik-modulens tre examineerbara löften (forskning-fas3 3.4). */
const LOFTEN = [
  {
    nr: "1",
    namn: "Redovisa motståndet",
    text: "Varje analys i portföljen visar hur motståndarna tänker — innan din egen slutsats. Den öppna debatt-analysen är spetsen på detta löfte.",
  },
  {
    nr: "2",
    namn: "Deklarera före resultat",
    text: "Teorivikter, poängsättningstabell och datakällor publiceras i rapporten innan slutsatsen. Rekommendationen följer tabellen — aldrig tvärtom.",
  },
  {
    nr: "3",
    namn: "Falsifierbarhet",
    text: "Ingen tes utan brytpunkt, inget scenario utan ogiltigförklaringsvillkor — och uppföljning före ny analys.",
  },
] as const;

/** ÅKU-cykeln — årligt vidmakthållande (forskning-fas3 3.8). */
const AKU = [
  {
    ikon: "🏅",
    text: "1 ny portföljanalys — Superanalys + Konfluens på ett aktuellt bolag.",
  },
  {
    ikon: "🔁",
    text: "1 valideringsrunda av egna äldre prognoser — med redovisad träffsäkerhet.",
  },
  {
    ikon: "⚖️",
    text: "1 etiksdiskussion kring ett aktuellt case (cirka 2 timmar).",
  },
] as const;

export default function Fas3Page() {
  const katalog = getCourseList();
  const titelFor = (slug: string) =>
    katalog.find((k) => k.slug === slug)?.title ?? slug;
  const antalKurser = FAS3_KURSLISTA.reduce((s, k) => s + k.slugs.length, 0);

  return (
    <SeoPageShell
      breadcrumb={[{ name: "Hem", href: "/" }, { name: "Fas 3 — Ekosystemet" }]}
      wide
    >
      <StrukturData id="jsonld-webbsajt" data={websiteJsonLd()} />

      {/* ── HERO — marin panel: fundamentalanalysen börjar röra sig ──────── */}
      <section className="marin-panel relative overflow-hidden rounded-3xl border-2 border-gold/60 p-7 shadow-2xl sm:p-12">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
          <span className="font-serif text-[150px] font-black tracking-tight">FAS 3</span>
        </div>
        <div className="pointer-events-none absolute inset-2 rounded-2xl border border-guld-hero/30" aria-hidden />
        <div className="relative max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-guld-hero">
            {`Det dynamiska ekosystemet · Fas 3 · ${kr(PRISER.fas3EnGang)} kr`}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-beige-hero sm:text-5xl">
            Fas 3 — där fundamentalanalysen börjar röra sig
          </h1>
          <p className="mt-4 font-serif text-lg italic leading-relaxed text-guld-hero sm:text-xl">
            Indikatorer är inte statiska — de är tidsserier med egen rytm.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-beige-hero/85 sm:text-base">
            I Fas 2 lär du dig väga ett bolag i handen — bokslut, värde, omdöme —
            och sammanväga de 20 analytiska indikatorerna till en helhet. Fas 3
            är certifieringsfasen: praktikportfölj och tillämpning. Den tar vid
            när det omdömet står klart, och visar det som ingen siffertabell
            kan visa: att fundamentalanalys <strong className="text-beige-hero">aldrig
            är statisk</strong>. Varje indikator rör sig — intäkter, marginaler,
            multiplar, hela tiden. Här integrerar vi AKM1 med AK1TS, vågor
            rättare sagt, och analysen blir ett levande ekosystem.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#innehall"
              className="btn-guld-signatur inline-flex min-h-[52px] items-center justify-center px-5 py-3 text-center text-sm"
            >
              Se innehållet ↓
            </a>
            <Link
              href="#krav"
              className="rounded-md border border-guld-hero/50 px-5 py-3 text-center text-sm font-semibold text-guld-hero transition-colors hover:bg-guld-hero/10"
            >
              Kravmatrisen & praktikportföljen
            </Link>
          </div>
        </div>
      </section>

      {/* ── FÖRUTSÄTTNINGEN — Fas 3 tar vid efter tillämpning av Fas 2 ────── */}
      <section className="gravor-ram mt-8 rounded-2xl bg-card p-6 sm:p-7">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
          Förutsättningen — ordningen är inte förhandlingsbar
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Fas 3 tar vid efter tillämpning
          av Fas 2</strong> — först det fundamentala omdömet, sedan det
          dynamiska. Ekosystemet förutsätter att du redan kan läsa ett bokslut,
          värdera ett bolag och försvara en slutsats med siffror. Har du inte
          gått den vägen? Den börjar med en{" "}
          <Link href="/fas2-ansok" className="underline hover:text-foreground">
            kostnadsfri ansökan till Fas 2
          </Link>{" "}
          — den snabba fundamentala vägen till oberoende analytiker.
        </p>
      </section>

      {/* ── DIN PROGRESS — praktikportföljens råvara, läst lokalt ─────────── */}
      <div className="mt-10">
        <Fas3Cert />
      </div>

      <div className="hjarlinje mt-10" />

      {/* ── INNEHÅLLET — vad Fas 3 ger dig ─────────────────────────────────── */}
      <section id="innehall" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">Vad Fas 3 ger dig</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Fas 3 är möjligheten att tillämpa — och att förstå hur
          fundamentalanalys inte är statisk. Alla indikatorer rör sig
          dynamiskt, och här får du verktygen att röra dig med dem.
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

      {/* ── DE 24 KURSERNA — kategorivis, titlar ur katalogen ─────────────── */}
      <section id="kurser" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">
          De {antalKurser} kurserna i Fas 3
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Tre ekosystem-flaggskepp, sjutton kanonverk i teknisk analys och fyra
          i trading-psykologi — allt det som kräver ett moget fundamentalt
          omdöme för att bli mer än kuriosa.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {FAS3_KURSLISTA.map((kat) => (
            <div key={kat.kategori} className="rounded-xl border border-gold/30 bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">
                {kat.kategori}{" "}
                <span className="font-normal text-gold">· {kat.slugs.length} kurser</span>
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

      {/* ── UNDER UTVECKLING — du är med från början ───────────────────────── */}
      <section id="framtiden" className="mt-12 scroll-mt-24">
        <div className="marin-panel rounded-2xl border border-gold/40 p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold text-beige-hero">
            Under utveckling — och du är med från början
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-beige-hero/85">
            Fas 3 är inte en färdig produkt utan en levande plats. Som Fas
            3-elev har du <strong className="text-beige-hero">rätt till alla
            framtida utvecklingar</strong> inom Fas 3 — allt som byggs, bygger
            också för dig:
          </p>
          <ul className="mt-4 grid gap-2.5 text-sm text-beige-hero/85 sm:grid-cols-2">
            {[
              "📊 Analys av aktier och portföljer — djupare, snabbare, levande",
              "🖥️ Dashboarden — det analytiska ekosystemet samlas i en vy",
              "🤖 Direkt koppling till AI med högst kvalitet",
              "📄 Rapporter m.m. — automatgenererade, spårbara till källor",
            ].map((txt) => (
              <li key={txt} className="flex gap-2.5">
                <span className="text-guld-hero">✓</span>
                <span>{txt}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-beige-hero/70">
            Vi lovar inte färdiga datum — vi lovar riktningen, och att du som
            Fas 3-elev är med från första dagen. Allt är under utveckling.
          </p>
        </div>
      </section>

      <div className="hjarlinje mt-12" />

      {/* ── KRAVMATRISEN — sex kriterier, A–F ──────────────────────────────── */}
      <section id="krav" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">Kravmatrisen — sex kriterier, betyg A–F</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Portföljen betygsätts på sex likaviktade kriterier, vardera A–F.
          Slutbetyget sätts på <strong>portföljen som helhet — aldrig på
          människan</strong>. Ett F på ett kriterium är en arbetsorder att göra
          om, inte en dom; omgångarna är utan tak.
        </p>
        <div className="table-wrap mt-5 w-full overflow-x-auto rounded-xl border border-gold/30 bg-card">
          <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gold/30 bg-gold/5">
                <th className="px-4 py-3 font-serif text-sm font-bold text-gold">Kriterium</th>
                <th className="px-4 py-3 font-serif text-sm font-bold text-gold">
                  A känns igen på
                </th>
                <th className="px-4 py-3 font-serif text-sm font-bold text-gold">
                  F känns igen på
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
          Skalan höjs medvetet från Fas 1:s certifikat A–D (som mäter nivå och
          XP) till A–F på <em>arbetet</em> — samma ämnen, högre kognitivt krav:
          integrera och tillämpa, självständigt.
        </p>
      </section>

      {/* ── PRAKTIKPORTFÖLJEN — vad som räknas ─────────────────────────────── */}
      <section id="portfolj" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">Praktikportföljen — tio kompletta analyser</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Kärnkravet i certifieringen, byggt i plattformens egna verktyg —
          redan de du använder varje vecka. Inga nya verktyg behövs: verktygen
          blir klassrummet. Portföljen är en halvöppen tentamen som växer fram
          successivt, inte ett provtillfälle.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {PORTFOLJ.map((p) => (
            <div
              key={p.rubrik}
              className="marin-panel relative rounded-2xl border border-gold/30 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-serif text-lg font-bold text-beige-hero">
                  {p.ikon} {p.rubrik}
                </p>
                {p.auto && (
                  <span
                    className="shrink-0 rounded-full border border-guld-hero/50 bg-guld-hero/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-guld-hero"
                    title="Spåras automatiskt i verktyget — inget att räkna för hand"
                  >
                    ✓ Auto-spåras
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-beige-hero/85">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-gold/30 bg-paper p-4 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Valbara spår.</strong> Två av de
          tio platserna kan fördjupas antingen mot special situations och
          emissioner, eller mot portfölj- och riskarbete — spåret syns på
          certifieringsbeviset. Granskningen sker i två led: AI-förgranskning
          mot schemat, sedan grundarens mänskliga slutbedömning.
        </div>
      </section>

      <div className="hjarlinje mt-12" />

      {/* ── ETIK-MODULEN — tre examineerbara löften ────────────────────────── */}
      <section id="etik" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">Etik-modulen — ärlighet som examinerbar kärna</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Vår hållning är <strong>ärlighet framför comfort</strong> — och den är
          inte en attityd utan tre konkreta löften som kan examineras. De är
          tagna rakt ur metodikens hårda regler, och de gäller varje analys i
          portföljen:
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
          Därtill en etik-case-del med dilemman anpassade efter verkligheten som
          analytiker: ”din publicerade analys innehåller ett räknefel — vad
          gör du?”. Svaren bedöms på resonemangets ärlighet, aldrig på ett
          ”rätt svar” — ett F betyder gör om med frågorna som kompass.
        </p>
      </section>

      {/* ── B2B-BEHÖRIGHETEN ───────────────────────────────────────────────── */}
      <section id="b2b" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">
          Certifierad = klar för /pro-plattformen
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Certifieringen är porten till Fas 3:s syfte: den som är certifierad
          är klar för <strong>/pro-plattformen</strong> — analytiker-ytan med
          portföljimport, rapportmallar och rättighetsstyrda moduler — och för
          <strong> relationen till AK1nvestor</strong>, vägen att arbeta med
          oss. Men certifieringen och behörigheten är två olika saker, och det
          ska vara ärligt sagt:
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-gold/40 bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Certifieringen — alla kan nå den
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Ett personligt bevis: praktikportfölj + etik-del med betyg A–F.
              Delbart, dokumenterat och ditt för alltid — värdefullt även om du
              aldrig vill arbeta inom ekosystemet. Certifieringen intygar{" "}
              <em>hantverk och ärlighet</em>.
            </p>
          </div>
          <div className="rounded-xl border border-gold/40 bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Behörigheten — en nästa-steg-relation
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Betyg C eller högre öppnar /pro-plattformen. Att representera
              AK1nvestor kräver dessutom grundarens personliga bedömning och en
              undertecknad AK1A-analytikerkod. Certifieringen allena är{" "}
              <strong>aldrig</strong> en rådgivningsbehörighet.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Compliance, hedvigt: Fas 3 är en <strong>pedagogisk
          kompetensprövning</strong> — aldrig investeringsråd, aldrig en
          rådgivningslicens i Finansinspektionens mening. Att säga detta rakt
          ut är själva exemplen på den ärlighet Fas 3 examinerar. Se vår{" "}
          <Link href="/finansiell-policy" className="underline hover:text-foreground">
            finansiella policy
          </Link>
          .
        </p>
      </section>

      {/* ── ÅKU — kunskap är en färskvara ──────────────────────────────────── */}
      <section id="aku" className="mt-12 scroll-mt-24">
        <div className="marin-panel rounded-2xl border border-gold/30 p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold text-beige-hero">
            ÅKU — kunskap är en färskvara
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-beige-hero/85">
            Certifieringen är ett <strong className="text-beige-hero">levande
            tillstånd</strong>, inte ett diploms datum. Varje år fyller du på
            med en kunskapsuppdatering — ÅKU — anpassad efter din roll som
            analytiker:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-beige-hero/85">
            {AKU.map((a) => (
              <li key={a.text} className="flex gap-2.5">
                <span className="text-guld-hero">{a.ikon}</span>
                <span>{a.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-beige-hero/70">
            Missad förnyelse betyder att certifieringen{" "}
            <em>vilar</em> — den indras aldrig — och den återaktiveras av en
            ifylld ÅKU-cykel. Behörigheten hålls alltid färsk, för både dig och
            dem du arbetar med.
          </p>
        </div>
      </section>

      {/* ── PRIS-MODELLEN — engång + ärlig ruta om månadsplanen ────────────── */}
      <section className="mt-12 rounded-3xl border-2 border-gold bg-card p-7 text-center shadow-lg sm:p-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
          Fas 3 · Det dynamiska ekosystemet · Engångspris
        </p>
        <p className="mt-3 font-serif text-4xl font-black text-gold sm:text-5xl">
          {kr(PRISER.fas3EnGang)} kr
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          En engångsbetalning för hela utbildningen: de {antalKurser} kurserna,
          ekosystem-integrationen, praktikportföljen, certifieringen med
          betyg A–F — och rätten till alla framtida utvecklingar inom Fas 3.
          Ingen betalar för innehåll i Fas 1; i Fas 3 betalar du för ekosystemet,
          granskningen och platsen i utvecklingen.
        </p>
        {/* Den ärliga rutan — rakt ut om månadsplanen */}
        <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-dashed border-gold/50 bg-paper p-4 text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
            Det ärliga priset, rakt ut
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Efter avslutad utbildning kan det analytiska ekosystemet och
            dashboarden fortsätta nyttjas genom en månadsplan (12 månader).{" "}
            <strong className="text-foreground">Utbildningen i sig är din för
            alltid</strong> — kunskapen lämnar aldrig dig; verktygen lever och
            utvecklas vidare.
          </p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          90 dagars nöjd-kund-garanti gäller även här — betalning sker först
          efter 90 dagar, och bara om du förblir nöjd · Fas 2-medlemmar går
          vidare först · Alla verktyg förblir gratis i Fas 1, för alltid.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/fas2-ansok"
            className="btn-guld-signatur inline-flex min-h-[52px] items-center justify-center px-5 py-3 text-sm"
          >
            Inte klar med Fas 2? Börja där — kostnadsfri ansökan
          </Link>
          <Link
            href="/medlemskap"
            className="rounded-md border border-gold/50 px-5 py-3 text-sm font-semibold hover:bg-gold/10"
          >
            Jämför Fas 1, 2 och 3
          </Link>
        </div>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Redo att börja bygga?{" "}
        <Link href="/superanalys" prefetch={false} className="underline hover:text-foreground">
          Öppna Superanalysen
        </Link>{" "}
        och börja din praktikportfölj idag — varje analys du sparar räknas,
        automatiskt. AK1A Research Lab bedriver pedagogisk finansanalys — inget
        här är investeringsråd.
      </p>

      {/* v160 (Φ) P1#5: social proof enligt BRANDING-AUDIT — siffrorna ur
          SocialProof/SIFFROR (guldkällan), aldrig påhittade tal. */}
      <SocialProof className="mt-12" />
    </SeoPageShell>
  );
}
