import Link from "next/link";
import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { SocialProof } from "@/components/ak1a/social-proof";
import { SIFFROR, tal } from "@/lib/siffror";

export const dynamic = "force-static";

/**
 * Fas 2 (nya modellen): de 18 fundamentala mästarverken, kategorivis —
 * värdering, bokslut, företagsfinans, värdeinvestering + AKM1-superdjup.
 * Kärnan är SAMMANVÄGNINGEN av de 20 analytiska indikatorerna (V01–V20).
 * Ingen teknisk analys-utbildning — endast grundläggande kunskap som
 * orientering (mästarnivå = Fas 3). Titlar hämtas dynamiskt ur
 * kurskatalogen så listan aldrig halkar ur synk med innehållet.
 * Spegla FAS2_KURSER i src/lib/kurs-access.ts.
 */
const FAS2_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "Värderingsbiblorna",
    pitch:
      "Graham & Dodd, Damodaran, McKinsey, Williams, Rappaport & Mauboussin — konsten att väga ett bolag i handen.",
    slugs: [
      "security-analysis",
      "investment-valuation",
      "valuation-measuring-managing",
      "the-theory-of-investment-value",
      "expectations-investing",
    ],
  },
  {
    kategori: "Bokslut & redovisning",
    pitch:
      "Penman, Mulford & Comiskey, O'Glove, Schilit, Graham — hitta kvaliteten i vinsten och genomskåda berättelser.",
    slugs: [
      "financial-statement-analysis-and-security-valuation",
      "creative-cash-flow-reporting",
      "quality-of-earnings",
      "financial-shenanigans",
      "interpretation-of-financial-statements",
    ],
  },
  {
    kategori: "Företagsfinans & kapital",
    pitch: "Higgins, Brealey, Whitman — kapitalstruktur och kassaflödesmatematik på MBA-nivå.",
    slugs: [
      "analysis-for-financial-management",
      "principles-of-corporate-finance",
      "distress-investing",
    ],
  },
  {
    kategori: "Värdeinvesteringens mästarverk + AKM1",
    pitch: "Klarman, Greenwald, Gray & Carlisle, Einhorn — och den egna modellen AKM1 på superdjup.",
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
 * Fas 3: det dynamiska ekosystemets 24 kurser — 3 flaggskepp + 17 kanonverk
 * i teknisk analys + 4 trading-psykologi. Spegla FAS3_KURSER i kurs-access.ts.
 */
const FAS3_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "Ekosystem-flaggskeppen",
    pitch: "Där fundamentalanalysen slutar vara statisk — variablerna blir tidsserier, värde möter vågor.",
    slugs: [
      "ak1ts-vaglarans-hierarki",
      "vagfundament-variablerna-som-tidsserier",
      "konfluens-varde-moter-vagor",
    ],
  },
  {
    kategori: "Teknisk analys på mästarnivå",
    pitch:
      "Elliott, Murphy, Nison, Bollinger, Edwards & Magee, Bulkowski, DeMark, Pring, Elder, Torssell och trendföljarna — 17 kanonverk.",
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
    pitch: "Fienden sitter vid ditt eget skrivbord — Douglas, Coates, Shull och Zweig lär dig känna igen honom.",
    slugs: [
      "trading-in-the-zone",
      "the-hour-between-dog-and-wolf",
      "market-mind-games",
      "your-money-and-your-brain",
    ],
  },
];

export const metadata: Metadata = pageMetadata({
  path: "/medlemskap",
  title: "Fas 1 gratis — Fas 2 sammanvägningen — Fas 3 ekosystemet | AK1A",
  // Uppdaterad 2026-09-01: antalen räknas dynamiskt nedan (Fas 1 = totalt − Fas 2 − Fas 3)
  description:
    "Fas 1: alla grundläggande kurser, heltäckta böcker, AI-Mentorn, kalkylatorn och portföljsystemet — kostnadsfritt för alltid. Fas 2: inget nytt — samma 20 analytiska indikatorer (V01–V20), nu sammanvägda på rätt sätt. Oändligt med timmar med grundaren tills du är värdig titeln oberoende aktieanalytiker. Teknisk analys utbildas inte i Fas 1/Fas 2 — mästarnivån är Fas 3. 9 999 kr / 13 999 kr, 90 dagars nöjd-kund-garanti: betalning först efter 90 dagar om du är nöjd.",
  keywords: [
    "gratis aktieutbildning",
    "fundamentalanalys gratis",
    "AKM1 medlemskap",
    "aktieanalys utbildning Sverige",
    "sammanvägning fundamentala indikatorer",
    "värdering utbildning Damodaran",
    "teknisk analys ekosystem",
    "representant utbildning",
    "bokmaster",
  ],
});

/** 90 dagars nöjd-kund-garanti — kundägarens formulering, återanvänd i Fas 2- och Fas 3-blocken. */
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
        90 dagars nöjd-kund-garanti
      </p>
      <p className="mt-1.5">
        Du kommer att bli nöjd — det garanterar vi. Annars betalar du ingenting.
        Tekniskt sett: du betalar inget under de första 90 dagarna; betalning sker
        först efter 90 dagar, och bara om du förblir nöjd.{" "}
        <Link
          href="/villkor"
          className={`underline ${mork ? "hover:text-[#EDE6D6]" : "hover:text-foreground"}`}
        >
          Villkoren (sektion 5–6)
        </Link>{" "}
        ger garantin sin juridiska hemvist — din lagstadgade ångerrätt enligt
        lagen (2005:59) kvarstår alltid parallellt.
      </p>
    </div>
  );
}

export default function MedlemskapPage() {
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
  // CourseChapter-typen saknar quiz-fältet (datan har det) — därför säker cast.
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
    <SeoPageShell breadcrumb={[{ name: "Medlemskap" }]} wide>
      <h1 className="font-serif text-4xl font-bold">Vår vision: kunskap är en rättighet</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Fundamentalanalys ska vara tillgänglig för alla människor — som luft och vatten.
        Därför är <strong>Fas 1 helt gratis, för alltid</strong>. Vi tjänar inte på
        människor som vill lära sig. Fas 2 är den snabba fundamentala vägen
        vidare — samma 20 indikatorer, men nu <em>sammanvägda</em> på rätt sätt,
        med grundarens coaching vid din sida — och Fas 3 är ekosystemet
        där analysen börjar röra sig.
      </p>

      {/* Värde-rad — generositeten i klartext */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { tal: `${tal(SIFFROR.kurser)}`, etikett: "kurser i biblioteket — Fas 1 gratis för alltid" },
          { tal: `${tal(SIFFROR.bokmaster)}`, etikett: "heltäckta böcker, kapitel för kapitel" },
          { tal: `${tal(SIFFROR.quiz)}`, etikett: "quizfrågor med +10 XP var" },
          { tal: `${fas2Antal}`, etikett: "fundamentala mästarverk i Fas 2 — värdering, bokslut, finans och värdeinvestering: hela vägen till oberoende analytiker" },
        ].map((s) => (
          <div key={s.etikett} className="rounded-xl border border-gold/30 bg-card p-4 text-center">
            <div className="font-serif text-3xl font-black text-gold">{s.tal}</div>
            <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{s.etikett}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* FAS 1 */}
        <div className="flex flex-col rounded-xl border-2 border-gold bg-card p-7 shadow-lg">
          <span className="mb-2 inline-block w-fit rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-primary-foreground">
            FAS 1 · ALLTID GRATIS · ALLTID ÖPPET
          </span>
          <h2 className="font-serif text-2xl font-bold">Bli en oberoende aktieanalytiker</h2>
          <p className="mt-1 text-sm italic text-muted-foreground">
            ”En rättighet vi garanterar till alla människor.”
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {[
              `Hela grundläggande AKM1-metodiken (V01–V20) — ${tal(fas1Antal)} kurser direkt öppna, gratis`,
              `${tal(fas1Bokmaster)} BOKMASTER-böcker kapitel för kapitel — Graham, Buffett, Marks, Damodaran, Murphy, Soros, Kahneman…`,
              "Alla grundläggande verktyg: AI-Mentorn som känner dig + Short-Sellern som grillar dina teser",
              "140 flashcards med spaced repetition (Ebbinghaus/SM-2)",
              "AKM1-kalkylatorn + portföljsystemet med fundamentaldata per innehav",
              "Biblioteket: bokkanon mappad mot AKM1/AK1TS",
              "Certifikat, topplista, XP & nivåer 1–100",
              "Alla aktieanalyser och case studies i labbet",
              "Bli medlem med bara e-post — ingen betalning, någonsin",
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
            Börja lära dig nu — kostnadsfritt
          </Link>
        </div>

        {/* FAS 2 */}
        <div className="flex flex-col rounded-xl border border-gold/40 bg-card p-7">
          <span className="mb-2 inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
            FAS 2 · ANSÖKAN KRÄVS · 9 999 KR
          </span>
          <h2 className="font-serif text-2xl font-bold">Den snabba fundamentala vägen</h2>
          <p className="mt-1 text-sm italic text-muted-foreground">
            Sammanvägningen av de 20 indikatorerna — till ett omdöme du kan försvara.
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {[
              "De 20 analytiska indikatorerna (V01–V20) — Fas 2 utbildar dig att analysera dem på rätt sätt",
              "SAMMANVÄGNINGEN — konsten att väga indikatorerna mot varandra. Det är Fas 2:s kärna: inte tjugo enskilda svar, utan ett enda fundamentalt omdöme",
              "Inget nytt innehåll — vi utbildar inte om något nytt; vi fördjupar det du redan mött i Fas 1, på analytikernivå",
              "Oändligt med timmar med grundaren — du får den tiden det tar, tills du är värdig titeln oberoende aktieanalytiker",
              `${fas2Antal} fundamentala mästarverk — värdering (Graham & Dodd, Damodaran, McKinsey), bokslut (Penman, Schilit, O'Glove), finans (Higgins, Brealey), värdeinvestering (Klarman, Greenwald, Einhorn) + AKM1 på superdjup`,
              "Ingen teknisk analys-utbildning — i Fas 2 (som i Fas 1) berättar vi bara grundläggande kunskap om teknisk analys, som orientering. Mästarnivån är Fas 3",
              "Utbildning i grupp tillsammans med andra klienter",
              "Representant-chansen: vägen att bli representant för AK1nvestor — att representera oss med kvalitet",
              "Tips på bolag under utbildningen — testade med siffror och variabler",
              "Rätt att nyttja verktygen och framtida Fas 2-tjänster (utvecklas löpande)",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-gold">✓</span>
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>

          {/* 90 dagars nöjd-kund-garanti — kundägarens löfte, i rutan */}
          <GarantiRuta />

          <div className="mt-4 rounded-lg border border-gold/30 bg-paper p-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">För vem — och kravet.</strong>{" "}
            Fas 2 kräver att du är klar med Fas 1: grunden ska sitta (nivå 25+
            är en bra signal). Och det viktigaste av allt — <em>viljan</em> att
            lyckas med fundamental aktieanalys. Utan vilja blir det svårt att
            fokusera. Har du båda delarna tar vi dig hela vägen, oavsett tid.
          </div>
          <Link
            href="/fas2-ansok"
            className="mt-5 rounded-md border border-gold/50 px-4 py-2.5 text-center text-sm font-semibold hover:bg-gold/10"
          >
            Ansök om Fas 2 → kostnadsfritt, 2 minuter
          </Link>
        </div>
      </div>

      {/* SOCIALT BEVIS — siffror och elevröster efter Fas 1/Fas 2-översikten */}
      <SocialProof className="mt-12" />

      {/* FAS 3 — det dynamiska ekosystemet */}
      <section className="marin-panel mt-8 rounded-2xl border border-gold/40 p-7 sm:p-9">
        <span className="mb-2 inline-block w-fit rounded-full border border-[#E8C766]/50 px-3 py-0.5 text-xs font-semibold text-[#E8C766]">
          FAS 3 · EFTER TILLÄMPNING AV FAS 2 · 13 999 KR
        </span>
        <h2 className="font-serif text-2xl font-bold text-[#EDE6D6]">
          Fas 3 — det dynamiska ekosystemet
        </h2>
        <p className="mt-1 text-sm italic text-[#E8C766]">
          Där fundamentalanalysen börjar röra sig.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#EDE6D6]/85">
          Fas 3 är certifieringsfasen: praktikportfölj och tillämpning. Den tar
          vid efter tillämpning av Fas 2 — först det fundamentala omdömet (sammanvägningen
          av de 20 indikatorerna), sedan det dynamiska. Här får du tillämpa och
          förstå hur fundamentalanalys inte är statisk: alla indikatorer rör sig
          dynamiskt, som tidsserier med egen rytm. Vi integrerar AKM1 med AK1TS —
          vågor, rättare sagt.
        </p>
        <ul className="mt-5 grid gap-2.5 text-sm text-[#EDE6D6]/85 md:grid-cols-2">
          {[
            `AKM1 × AK1TS-integrationen — den sammansatta analysen där fundamentalstyrka möter vågor`,
            "Vågfundamentet — varje fundamentalvariabel som tidsserie",
            "Konfluensradarn — där värde garanterat möter vågor (fem dimensioner)",
            "Portföljens vågor — vågprofilen på mikro-, kort-, medellång-, lång- och mega-horisont",
            `Teknisk analys på mästarnivå — 17 kanonverk: Elliott, Murphy, Nison, Bollinger…`,
            "Trading-psykologi & neuroekonomi — Douglas, Coates, Shull, Zweig",
            `De ${fas3Antal} kurserna + praktikportfölj, kravmatris A–F och certifiering`,
            "Dashboard, AI-koppling med högst kvalitet och rapporter — direkt kopplat till analysen av aktier och portföljer",
            "Rätt till ALLA framtida utvecklingar inom Fas 3 — allt är under utveckling och du är med från början",
          ].map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-[#E8C766]">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* 90 dagars nöjd-kund-garanti — gäller även Fas 3 */}
        <GarantiRuta mork />

        {/* Månadsplans-notisen — det ärliga priset */}
        <div className="mt-5 rounded-xl border border-dashed border-[#E8C766]/50 bg-[#0A1422]/60 p-4 text-xs leading-relaxed text-[#EDE6D6]/80">
          <strong className="text-[#E8C766]">Det ärliga priset, rakt ut:</strong>{" "}
          efter avslutad utbildning kan det analytiska ekosystemet och
          dashboarden fortsätta nyttjas genom en månadsplan (12 månader).
          Utbildningen i sig är din för alltid.
        </div>
        <Link
          href="/fas3"
          className="mt-5 inline-block rounded-md bg-gold px-4 py-2.5 text-center text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          Utforska Fas 3 →
        </Link>
      </section>

      {/* EFTER UTBILDNINGEN — verktygen, forskningstjänsterna, utvecklingarna */}
      <section className="mt-8 rounded-xl border-2 border-gold/50 bg-card p-7">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
          Efter utbildningen
        </span>
        <h2 className="mt-2 font-serif text-2xl font-bold">
          Verktygen blir dina — och utvecklingen slutar aldrig
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Efter utbildningen får du nyttja de verktyg som ska vara tillgängliga
          för dig: analysmotorerna, kalkylatorn, portföljsystemet — och de
          forskningstjänster som växer fram ur labbet. Det kommer alltid att
          finnas nya utvecklingar: <strong>AK1nvestor.com har stora visioner</strong>,
          och du är med från början.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gold/30 bg-paper p-5">
            <h3 className="font-serif text-lg font-bold">AK1A Portföljforskning</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Forskningstjänsten för tiden efter skolbänken: tre nivåer av
              månadsvis portföljforskning med AKM1-poäng, vågstatus per
              horisont och då-vs-nu-uppföljning. Som Fas 2- eller Fas 3-elev
              får du <strong className="text-foreground">20 % rabatt</strong> — alltid
              och automatiskt. Forskning, inte rådgivning.
            </p>
            <Link
              href="/prenumeration"
              className="mt-3 inline-block rounded-md border border-gold/50 px-4 py-2 text-xs font-semibold hover:bg-gold/10"
            >
              Se Prenumeration →
            </Link>
          </div>
          <div className="rounded-xl border border-gold/30 bg-paper p-5">
            <h3 className="font-serif text-lg font-bold">Alltid nya utvecklingar</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Analys av aktier och portföljer, dashboarden, AI-kopplingen och
              rapporterna byggs vidare — löpande, med kvaliteten som måttstock.
              Din utbildning är din för alltid; verktygen och tjänsterna lever
              och utvecklas med dig.
            </p>
            <Link
              href="/fas3"
              className="mt-3 inline-block rounded-md border border-gold/50 px-4 py-2 text-xs font-semibold hover:bg-gold/10"
            >
              Se Fas 3:s utvecklingsväg →
            </Link>
          </div>
        </div>
      </section>

      {/* BIBLIOTEKET — bokkanonen och beskedet om teknisk analys */}
      <section className="mt-6 rounded-xl border border-gold/30 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">
          Biblioteket — bokkanon mappad mot AKM1/AK1TS
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Varje bok i kanon är kopplad till <strong>AKM1</strong> (V01–V20) och{" "}
          <strong>AK1TS</strong> — bokstavligt: du ser vilken variabel och vilken
          teori varje verk fördjupar. Och ett ärligt besked, rakt ut:{" "}
          <strong className="text-foreground">vi utbildar inte teknisk analys i
          Fas 1 eller Fas 2</strong>. Där berättar vi bara grundläggande kunskap
          om teknisk analys — som orientering, inte som ämne att bemästra.{" "}
          <strong className="text-foreground">Teknisk analys på mästarnivå är
          Fas 3</strong>, där den hör hemma i det dynamiska ekosystemet.
        </p>
        <Link
          href="/bibliotek"
          className="mt-4 inline-block rounded-md border border-gold/50 px-4 py-2 text-xs font-semibold hover:bg-gold/10"
        >
          Utforska Biblioteket →
        </Link>
      </section>

      {/* De avancerade kurserna — Fas 2 och Fas 3 */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          De avancerade kurserna — {fas2Antal} fundamentala i Fas 2, {fas3Antal} i Fas 3
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Fas 1 lär ut delarna — variabel för variabel, bok för bok. Fas 2 fördjupar
          det fundamentala hantverket till analytikernivå, där sammanvägningen av
          de 20 indikatorerna blir nästa viktiga steg. Fas 3 öppnar det dynamiska
          ekosystemet: vågorna, mästarnas tekniska analys och psykologin bakom
          dina egna beslut.
        </p>

        <h3 className="mt-5 font-serif text-lg font-bold">
          Fas 2 — den fundamentala vägen <span className="text-gold">· {fas2Antal} kurser</span>
        </h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {FAS2_KURSLISTA.map((kat) => (
            <div key={kat.kategori} className="rounded-xl border border-gold/30 bg-card p-5">
              <h4 className="text-sm font-semibold text-foreground">
                {kat.kategori}{" "}
                <span className="font-normal text-gold">· {kat.slugs.length} kurser</span>
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
          Fas 3 — det dynamiska ekosystemet <span className="text-gold">· {fas3Antal} kurser</span>
        </h3>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {FAS3_KURSLISTA.map((kat) => (
            <div key={kat.kategori} className="rounded-xl border border-gold/30 bg-card p-5">
              <h4 className="text-sm font-semibold text-foreground">
                {kat.kategori}{" "}
                <span className="font-normal text-gold">· {kat.slugs.length} kurser</span>
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
          Allt i AK1A Research Lab är pedagogisk utbildning i aktieanalys — aldrig
          investeringsråd, och aldrig tips om köp eller försäljning. Analyser och
          kurser bygger på öppna källor och redovisade antaganden.
        </p>
      </section>

      {/* NYTT I FAS 2 vs ALLTID GRATIS */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-gold bg-card p-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
            Alltid gratis · Fas 1
          </span>
          <h3 className="mt-2 font-serif text-xl font-bold">
            {fas1Antal} gratis kurser + alla grundläggande verktyg
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              `Alla ${fas1Antal} grundkurserna — AKM1-metodiken (V01–V20) med formler och trösklar`,
              `${fas1Bokmaster} BOKMASTER-böcker kapitel för kapitel`,
              "AI-Mentorn, Short-Sellern, kalkylatorn och portföljsystemet",
              "Flashcards, biblioteket, certifikat, XP och topplistan",
              "Alla aktieanalyser och case studies i labbet",
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
            Nytt i Fas 2
          </span>
          <h3 className="mt-2 font-serif text-xl font-bold">
            Sammanvägningen + {fas2Antal} mästarverk + grundaren vid din sida
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              "Sammanvägningen av de 20 indikatorerna — att väga dem mot varandra till ett eget fundamentalt omdöme",
              `De ${fas2Antal} fundamentala mästarverken — värdering, bokslut, finans, värdeinvestering + AKM1-superdjup (listade ovan)`,
              "Oändligt med timmar med grundaren och coaching i grupp — tills du är värdig titeln oberoende analytiker",
              "Representant-chansen — vägen att representera AK1nvestor med kvalitet",
              "Ingen teknisk analys-utbildning — endast grundläggande orientering; mästarnivån är Fas 3",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-gold">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Tydlig separation: <strong className="text-foreground">Fas 1</strong> är
            de {fas1Antal} gratis kurserna och alla grundläggande verktyg.{" "}
            <strong className="text-foreground">Fas 2</strong> är den snabba
            fundamentala vägen — inget nytt innehåll, men sammanvägningen av de 20
            indikatorerna, de {fas2Antal} mästarverken med grundaren vid din sida,
            och representant-chansen.{" "}
            <strong className="text-foreground">Fas 3</strong> är det dynamiska
            ekosystemet: vågor, teknisk analys på mästarnivå, psykologi,
            dashboard och AI.
          </p>
        </div>
      </section>

      {/* 10x-värdebeviset */}
      <section className="mt-8 rounded-xl border border-gold/30 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">Varför vi är generösa</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          En traditionell analysutbildning kostar tiotusentals kronor och ger dig en bråkdel
          av metodiken. Hos oss får du <strong>hela grundsystemet gratis</strong>: 20
          analytiska indikatorer med formler och trösklar, den deterministiska vågmotorn,{" "}
          {fas1Bokmaster} böcker kapitel för kapitel med quiz — och ärligheten om varje
          kontrovers. Vår affärsidé är inte att stänga in kunskapen: den är att utbilda
          oberoende analytiker som så småningom vill arbeta <em>med</em> oss. Ju fler som
          lär sig, desto starkare blir ekosystemet.
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-gold/30 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">Våra löften</h2>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <li>✓ Fas 1 förblir gratis — kunskap är en rättighet</li>
          <li>✓ 90 dagars nöjd-kund-garanti — betalning först efter 90 dagar om du förblir nöjd</li>
          <li>✓ Allt vi publicerar är reproducerbart — källor redovisas</li>
          <li>✓ Vi säljer aldrig din data</li>
          <li>✓ Pedagogisk finansanalys — aldrig investeringsråd</li>
          <li>✓ GDPR: din data är din, export på begäran</li>
        </ul>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Redo att börja?{" "}
        <Link href="/laroplan" className="underline hover:text-foreground">
          Öppna läroplanen
        </Link>{" "}
        eller{" "}
        <Link href="/profil" className="underline hover:text-foreground">
          testa din kognitiva profil
        </Link>{" "}
        — båda gratis, för alltid.
      </p>
    </SeoPageShell>
  );
}
