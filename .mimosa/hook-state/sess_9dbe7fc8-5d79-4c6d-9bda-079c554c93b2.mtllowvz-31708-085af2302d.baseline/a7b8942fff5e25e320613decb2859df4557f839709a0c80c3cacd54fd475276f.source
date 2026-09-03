import Link from "next/link";
import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { SocialProof } from "@/components/ak1a/social-proof";

export const dynamic = "force-static";

/**
 * Fas 2 (nya modellen): de 18 fundamentala mästarverken, kategorivis —
 * värdering, bokslut, företagsfinans, värdeinvestering + AKM1-superdjup.
 * Ingen teknisk analys — det är Fas 3. Titlar hämtas dynamiskt ur
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
  title: "Fas 1 gratis — Fas 2 fundamental väg — Fas 3 ekosystemet | AK1A",
  // Uppdaterad 2026-09-01: antalen räknas dynamiskt nedan (Fas 1 = totalt − Fas 2 − Fas 3)
  description:
    "Fas 1: alla grundläggande kurser, heltäckta böcker, AI-Mentorn, kalkylatorn och portföljsystemet — kostnadsfritt för alltid. Fas 2: den snabba fundamentala vägen till oberoende analytiker — 18 mästarverk, personlig utbildning med grundaren och chansen att bli representant för AK1nvestor. Ingen teknisk analys — det är Fas 3: det dynamiska ekosystemet där fundamentalanalysen börjar röra sig. 9 999 kr / 13 999 kr, 90 dagars nöjdhetsgaranti.",
  keywords: [
    "gratis aktieutbildning",
    "fundamentalanalys gratis",
    "AKM1 medlemskap",
    "aktieanalys utbildning Sverige",
    "värdering utbildning Damodaran",
    "teknisk analys ekosystem",
    "representant utbildning",
    "bokmaster",
  ],
});

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
        vidare — med grundarens coaching vid din sida — och Fas 3 är ekosystemet
        där analysen börjar röra sig.
      </p>

      {/* Värde-rad — generositeten i klartext */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { tal: `${fas1Antal}`, etikett: "kurser, alla gratis — för alltid" },
          { tal: `${fas1Bokmaster}`, etikett: "heltäckta böcker, kapitel för kapitel — gratis" },
          { tal: `${quiz.toLocaleString("sv-SE")}`, etikett: "quizfrågor med +10 XP var" },
          { tal: `${fas2Antal}`, etikett: "fundamentala mästarverk i Fas 2 — den snabba vägen till oberoende analytiker" },
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
              `Alla ${fas1Antal} gratis kurser — hela grundläggande AKM1-metodiken (V01–V20)`,
              `${fas1Bokmaster} BOKMASTER-böcker kapitel för kapitel — Graham, Buffett, Marks, Damodaran, Murphy, Soros, Kahneman…`,
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
            Utbildning med grundaren — till ett omdöme du kan försvara.
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {[
              `${fas2Antal} fundamentala mästarverk — värdering (Graham & Dodd, Damodaran, McKinsey), bokslut (Penman, Schilit, O'Glove), finans (Higgins, Brealey), värdeinvestering (Klarman, Greenwald, Einhorn) + AKM1 på superdjup`,
              "Ingen teknisk analys i Fas 2 — vågor och ekosystem är Fas 3",
              "Personlig utbildning med grundaren av AK1A — den snabba vägen till oberoende analytiker",
              "Utbildning i grupp tillsammans med andra klienter",
              "Representant-chansen: vägen att bli representant för AK1nvestor — att representera oss med kvalitet",
              "Tips på bolag under utbildningen — testade med siffror och variabler",
              "90 dagars nöjdhetsgaranti — du betalar ingenting förrän du är nöjd",
              "Rätt att nyttja framtida Fas 2-tjänster (utvecklas löpande)",
              "Efter utbildningen: möjlighet att arbeta med AK1nvestor.com vid stark vilja och resultat",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-gold">✓</span>
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-gold/30 bg-paper p-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">För vem?</strong> Du som gått djupt i Fas 1
            (nivå 25+ är en bra signal) och vill vidare — från delarna till det
            egna fundamentala omdömet. Fas 1 gömmer ingenting grundläggande:
            allt vi kan finns gratis. Fas 2 lägger till de {fas2Antal}
            mästarverken och människan vid din sida — coaching, gemenskap och
            representant-vägen.
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
          Fas 3 tar vid efter tillämpning av Fas 2 — först det fundamentala
          omdömet, sedan det dynamiska. Här får du tillämpa och förstå hur
          fundamentalanalys inte är statisk: alla indikatorer rör sig dynamiskt,
          som tidsserier med egen rytm. Vi integrerar AKM1 med AK1TS — vågor,
          rättare sagt.
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

      {/* De avancerade kurserna — Fas 2 och Fas 3 */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          De avancerade kurserna — {fas2Antal} fundamentala i Fas 2, {fas3Antal} i Fas 3
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Fas 1 lär ut delarna — variabel för variabel, bok för bok. Fas 2
          fördjupar det fundamentala hantverket till analytikernivå. Fas 3
          öppnar det dynamiska ekosystemet: vågorna, mästarnas tekniska analys
          och psykologin bakom dina egna beslut.
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
            {fas2Antal} fundamentala mästarverk + grundaren vid din sida
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              `De ${fas2Antal} fundamentala mästarverken — värdering, bokslut, finans, värdeinvestering + AKM1-superdjup (listade ovan)`,
              "Personlig utbildning med grundaren och coaching i grupp",
              "Representant-chansen — vägen att representera AK1nvestor med kvalitet",
              "Ingen teknisk analys — vågor och ekosystem tillhör Fas 3",
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
            fundamentala vägen — de {fas2Antal} mästarverken med grundaren vid
            din sida, och representant-chansen.{" "}
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
          fundamentalvariabler med formler och trösklar, den deterministiska vågmotorn,{" "}
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
          <li>✓ Fas 2: betala först när du är nöjd (90 dagar)</li>
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
