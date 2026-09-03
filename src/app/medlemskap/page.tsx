import Link from "next/link";
import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

/**
 * Fas 2: de 26 låsta kurserna, kategorivis (4 flaggskepp + 18 teknisk analys
 * + 4 psykologi). Titlar hämtas dynamiskt ur kurskatalogen så listan aldrig
 * halkar ur synk med det faktiska innehållet.
 */
const FAS2_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "Ekosystem-flaggskeppen",
    pitch: "De fyra superdjupa systemkurserna — där delarna blir en helhet.",
    slugs: [
      "ak1ts-vaglarans-hierarki",
      "akm1-den-kontroversiella-modellen",
      "vagfundament-variablerna-som-tidsserier",
      "konfluens-varde-moter-vagor",
    ],
  },
  {
    kategori: "Avancerad teknisk analys",
    pitch:
      "Elliott, Fibonacci och Bollinger i fördjupningskurserna — plus mästerverken av Frost & Prechter, Bollinger, Fischer, Pring, Murphy, Torssell, DeMark, Edwards & Magee och Bulkowski.",
    slugs: [
      "ts-01-elliott-wave",
      "ts-02-elliott-wave",
      "ts-22-elliott-wave",
      "ts-03-fibonacciretracements",
      "ts-04-fibonacciextensions",
      "ts-19-fibonaccitidszoner",
      "ts-21-fibonaccikluster",
      "ts-15-bollinger-bands",
      "elliott-wave-principle",
      "bollinger-on-bollinger-bands",
      "fibonacci-applications",
      "martin-pring-on-market-momentum",
      "intermarket-analysis",
      "teknisk-analys-med-johnny-torssell",
      "the-new-science-of-technical-analysis",
      "technical-analysis-financial-markets",
      "technical-analysis-of-stock-trends",
      "encyclopedia-of-chart-patterns",
    ],
  },
  {
    kategori: "Trading psykologi",
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

export const metadata: Metadata = pageMetadata({
  path: "/medlemskap",
  title: "Fas 1 gratis för alltid — Fas 2: utbildning med grundaren | AK1A",
  // Uppdaterad 2026-09-01: antalen räknas dynamiskt nedan (Fas 1 = totalt − 26)
  description:
    "Fas 1: alla grundläggande kurser, heltäckta böcker, AI-Mentorn, kalkylatorn och portföljsystemet — kostnadsfritt för alltid. Fas 2: 26 avancerade kurser, Portföljens vågor, AKM1 × AK1TS-integrationen och personlig utbildning med grundaren — 90 dagars nöjdhetsgaranti, 9 999 kr. Ansökan krävs.",
  keywords: [
    "gratis aktieutbildning",
    "fundamentalanalys gratis",
    "AKM1 medlemskap",
    "aktieanalys utbildning Sverige",
    "teknisk analys utbildning",
    "representant utbildning",
    "bokmaster",
  ],
});

export default function MedlemskapPage() {
  const kurserLista = getCourseList();
  const kurser = kurserLista.length;
  const fas2Slugs = new Set(FAS2_KURSLISTA.flatMap((k) => k.slugs));
  const fas2Antal = fas2Slugs.size;
  const fas1Antal = kurser - fas2Antal;
  const fas1Bokmaster = kurserLista.filter(
    (c) => c.category === "BOKMASTER" && !fas2Slugs.has(c.slug)
  ).length;
  // CourseChapter-typen saknar quiz-fältet (datan har det) — därför säker cast.
  const quiz = kurserLista
    .filter((c) => !fas2Slugs.has(c.slug))
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
        människor som vill lära sig. Fas 2 är för dig som vill gå längre — med
        grundarens coaching vid din sida.
      </p>

      {/* Värde-rad — generositeten i klartext */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { tal: `${fas1Antal}`, etikett: "kurser, alla gratis — för alltid" },
          { tal: `${fas1Bokmaster}`, etikett: "heltäckta böcker, kapitel för kapitel — gratis" },
          { tal: `${quiz.toLocaleString("sv-SE")}`, etikett: "quizfrågor med +10 XP var" },
          { tal: `${fas2Antal}`, etikett: "avancerade kurser i Fas 2 — flaggskeppen + mästerverken" },
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
          <h2 className="font-serif text-2xl font-bold">Utbildning med grundaren</h2>
          <p className="mt-1 text-sm italic text-muted-foreground">
            Från att förstå delarna — till att analysera helheten.
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {[
              `${fas2Antal} avancerade kurser — ekosystem-flaggskeppen (AKM1, AK1TS, Vågfundament, Konfluens), teknisk analys på mästarnivå och trading psykologi`,
              "Portföljens vågor — din portföljs vågprofil på mikro-, kort-, medellång-, lång- och mega-horisont (dynamisk vy efter inloggning)",
              "AKM1 × AK1TS-integrationen — den sammansatta analysen där fundamentalstyrka möter vågor",
              "Nyheter kopplade till dina aktier — en personlig nyhetsfeed",
              "Personlig utbildning med grundaren av AK1A",
              "90 dagars nöjdhetsgaranti — du betalar ingenting förrän du är nöjd",
              "Utbildning i grupp tillsammans med andra klienter",
              "Mål: utbilda framtida representanter för AK1nvestor",
              "Tips på bolag under utbildningen — testade med siffror och variabler",
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
            (nivå 25+ är en bra signal) och vill vidare — från delarna till helheten.
            Fas 1 gömmer ingenting grundläggande: allt vi kan finns gratis. Fas 2
            lägger till de {fas2Antal} avancerade kurserna och de sammansatta
            verktygen — men framför allt en människa vid din sida: coaching,
            gemenskap och representant-vägen.
          </div>
          <Link
            href="/fas2-ansok"
            className="mt-5 rounded-md border border-gold/50 px-4 py-2.5 text-center text-sm font-semibold hover:bg-gold/10"
          >
            Ansök om Fas 2 → kostnadsfritt, 2 minuter
          </Link>
        </div>
      </div>

      {/* De 26 avancerade kurserna — kategorivis */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          De {fas2Antal} avancerade kurserna i Fas 2
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Fas 1 lär ut delarna — variabel för variabel, bok för bok. Fas 2 öppnar de
          kurser som kräver att delarna redan sitter: ekosystem-flaggskeppen, den
          tekniska analysens mästerverk och psykologin bakom dina egna beslut.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {FAS2_KURSLISTA.map((kat) => (
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
            {fas2Antal} avancerade kurser + de sammansatta verktygen
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              `De ${fas2Antal} avancerade kurserna — flaggskepp, teknisk mästarnivå och trading psykologi (listade ovan)`,
              "Portföljens vågor — din portföljs vågprofil på alla 5 tidshorisonter",
              "AKM1 × AK1TS-integrationen — där fundamentalstyrka möter vågor",
              "Nyheter kopplade till dina aktier — personlig nyhetsfeed",
              "Personlig utbildning, coaching i grupp och representant-vägen",
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
            <strong className="text-foreground">Fas 2</strong> är de {fas2Antal}{" "}
            avancerade kurserna, Portföljens vågor och integrationen — med
            grundaren vid din sida.
          </p>
        </div>
      </section>

      {/* FAS 3 teaser */}
      <div className="mt-6 rounded-xl border border-dashed border-gold/40 bg-paper p-6 text-center">
        <p className="font-serif text-lg font-bold">
          Fas 3 <span className="text-gold">· 13 999 kr</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Representeras snart. Fas 2-medlemmar får tillgång först — håll utkik.
        </p>
      </div>

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
