import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/transparens",
  harSpeglar: true, // Ömsesidig hreflang med /en|ar/transparens (VÅG 63 O3 #2)
  title: "Transparens — din data och dina rättigheter, enligt lagen | AK1A",
  description:
    "AK1A:s fullständiga redovisning av personuppgiftsbehandlingen enligt dataskyddsförordningens artikel 13: vilka uppgifter vi samlar in, varför vi använder dem för analys, rättslig grund, lagringstid, dina åtta rättigheter och hur du klagar hos IMY.",
  keywords: [
    "transparens",
    "GDPR",
    "personuppgifter",
    "dataskydd",
    "artikel 13",
    "dina rättigheter",
    "IMY",
    "kakor",
    "ångerrätt",
    "AK1A Research Lab",
  ],
});

type Rad = {
  vad: string;
  varfor: string;
  grund: string;
  lagring: string;
  ratt: string;
};

const REGISTER: Rad[] = [
  {
    vad: "Kontouppgifter (namn, e-post, lösenords-hash)",
    varfor:
      "Skapa och administrera ditt konto, autentisera dig, leverera det du köpt och kommunicera om din utbildning.",
    grund: "Avtal — art. 6.1 b (nödvändigt för att fullgöra vårt avtal med dig)",
    lagring: "Så länge kontot är aktivt + 12 månader (möjlighet att reklamera/fakturera), därefter radering.",
    ratt: "Tillgång, rättelse, radering, dataportabilitet, begränsning.",
  },
  {
    vad: "Kursframsteg, quiz-svar och XP",
    varfor:
      "Visa din progression, låsa upp nästa steg, räkna ut certifikatbetyg (A–D) och ge dig relevanta uppföljningsfrågor.",
    grund: "Avtal — art. 6.1 b (leverans av utbildningstjänsten)",
    lagring: "Så länge kontot är aktivt; raderas tillsammans med kontot.",
    ratt: "Tillgång, rättelse, radering, dataportabilitet.",
  },
  {
    vad: "Beteendetracer (vilka sidor och kurser du besöker, i vilken ordning)",
    varfor:
      "Analysera hur vår pedagogik används, förbättra kursordning och upptäcka där eleven fastnar. Detta är kärnan i 'att använda information för att analysera' — analysen gäller plattformens pedagogik, inte din privatliv.",
    grund: "Berättigat intresse — art. 6.1 f (produktutveckling och kvalitetssäkring av utbildningen)",
    lagring: "Rullande 90 dagar, därefter endast anonymiserad statistik.",
    ratt: "Invändning (art. 21) — vi slutar då behandla uppgifterna om dig.",
  },
  {
    vad: "Kognitiv profil (svar i AI-Diagnos: riskaptit, bias-tendenser)",
    varfor:
      "Anpassa exempel och varningar i utbildningen till din profil (t.ex. extra uppmärksamhet på bekräftelsebias).",
    grund: "Samtycke — art. 6.1 a (du svarar frivilligt; kan hoppa över diagnosen helt)",
    lagring: "Tills du återkallar samtycket eller raderar profilen — funktionen är alltid frivillig.",
    ratt: "Återkalla samtycke när som helst + radering + invändning mot profilering.",
  },
  {
    vad: "Frågor du ställer AI-Mentorn",
    varfor:
      "Besvara dina frågor, minnas samtalskontexten under sessionen och förbättra mentorns svarskvalitet i aggregerad form.",
    grund: "Berättigat intresse — art. 6.1 f (support och funktionsförbättring)",
    lagring: "Samtalsminnet lagras lokalt i din webbläsare (inte på våra servrar) och kan raderas av dig med ett klick i chatten.",
    ratt: "Radering (du kontrollerar minnet själv) + invändning.",
  },
  {
    vad: "Valda nyhetskanaler och bevakningar",
    varfor:
      "Hämta och filtrera nyhetsflöden du själv valt, samt prioritera ämnen i din profil.",
    grund: "Samtycke — art. 6.1 a (inställningar du aktivt valt)",
    lagring: "Tills du ändrar inställningarna eller kontot raderas.",
    ratt: "Återkalla samtycke, ändra, radera.",
  },
  {
    vad: "Kakor (cookies och lokal lagring)",
    varfor:
      "Nödvändiga: inloggning och säkerhet. Funktionalitet: dina val (tema, kanaler). Analys: anonym användningsstatistik.",
    grund: "Lagen (2022:482) om elektronisk kommunikation — nödvändiga kakor kräver inget samtycke; övriga kräver ditt aktiva val i kakmuren.",
    lagring: "Enligt kaklistan i kakmuren (max 12 månader).",
    ratt: "Ändra ditt val när som helst via 'Kakinställningar' i sidfoten — lika enkelt som att lämna det.",
  },
  {
    vad: "Trafikstatistik (anonym besöksmätning — ingen cookie, inga personuppgifter)",
    varfor:
      "Räkna besökare, mest lästa sidor och källor så utbildningen kan prioritera det som faktiskt används. Sida + enhetsklass + källa + språk + en slumpad, hashad sessionskod — aldrig IP, aldrig query-strängar, aldrig innehåll. Har du valt 'endast nödvändigt' mäts enbart sidväg + enhetsklass.",
    grund: "Berättigat intresse — art. 6.1 f (anonym webbstatistik utan personuppgifter; vem du är går inte att utläsa)",
    lagring: "Rullande 35 dagar, därefter raderat av retention-organet (hårt radtak).",
    ratt: "Invändning (art. 21) — välj 'endast nödvändigt' i kakmuren så mäts inget om dig utöver det helt anonyma.",
  },
  {
    vad: "Säkerhetslogg (blockerade attacker med hashad IP)",
    varfor:
      "Trafikvakten stoppar skannrar och flöden (t.ex. sökningar efter .env eller wp-admin) och loggar händelsen för att skydda tjänsten. IP-adressen hashas med salt innan lagring — den råa adressen lämnar aldrig minnet, och hashen kan inte föras tillbaka till en person.",
    grund: "Berättigat intresse — art. 6.1 f (IT-säkerhet och förebyggande av obehörig åtkomst)",
    lagring: "Rullande 35 dagar eller tills radtaket (3 000) nås — därefter radering.",
    ratt: "Invändning (art. 21) samt rätt till information — loggen innehåller ingen persondata, endast tekniska fingeravtryck.",
  },
  {
    vad: "Konverteringsintentioner (anonym aggregerad räkning — ingen personuppgift)",
    varfor:
      "När du begär aktivering av en prenumeration räknas en helt anonymiserad händelse (endast nivåns namn, period och pris) så vi kan se hur tratten från besökare till prenumeration används. Händelsen innehåller ingen e-post, inget namn, ingen IP-adress och ingen sessionskod — det går inte att utläsa vem du är eller vad du gjorde.",
    grund:
      "Berättigat intresse — art. 6.1 f (funktionsutveckling och produktstatistik; uppgifterna kan inte kopplas till en person)",
    lagring:
      "Rullande enligt systemhändelsernas retention (35 dagar, samma som trafikstatistiken), därefter radering.",
    ratt:
      "Invändning (art. 21) — eftersom händelsen saknar personuppgift finns inget om dig att begära ut eller radera; begär du aktivering via mejl i stället räknas ingen anonym händelse om du blockerar anropet.",
  },
];

export default function TransparensPage() {
  const lank = (href: string, text: string) => (
    <Link href={href} className="underline hover:text-foreground">
      {text}
    </Link>
  );

  return (
    <SeoPageShell breadcrumb={[{ name: "Transparens" }]}>
      <h1 className="font-serif text-4xl font-bold">
        Transparens — berättat som lagen kräver
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fastställd 2026-09-01 · lab.ak1nvestor.com · AK1A Research Lab
      </p>

      <p className="mt-6 leading-relaxed text-muted-foreground">
        Den här sidan finns för att dataskyddsförordningens (GDPR) artikel 13
        ger dig rätt att få veta exakt vad vi gör med dina personuppgifter —
        inte för att vi valt det mest bekväma sättet att berätta det. Vi
        redovisar därför hela registret: vad vi samlar in, varför, på vilken
        rättslig grund, hur länge vi sparar det och vilka rättigheter du har.
        Djupare juridiska detaljer finns i{" "}
        {lank("/privacy-policy", "integritetspolicyn")} och{" "}
        {lank("/villkor", "användarvillkoren")}.
      </p>

      {/* ── 1. Vem ansvarar ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          1. Vem är ansvarig för dina uppgifter
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Personuppgiftsansvarig är AK1A Research Lab, organisationsnummer
          [ORGANISATIONSNR], kontakt info@ak1nvestor.com (art. 13.1 a). Vi har
          för närvarande inget formellt dataskyddsombud — det är inte
          obligatoriskt för vår verksamhets storlek — utan hanterar
          integritetsfrågor direkt via kontakten ovan. Våra viktigaste
          databehandlare (leverantörer som behandlar data åt oss, art. 28) är
          vår europeiska databasleverantör och vår webbhotellsleverantör. De
          får bara behandla data efter våra instruktioner och har
          databehandlaravtal med oss.
        </p>
      </section>

      {/* ── 2. Dataregistret ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          2. Hela dataregistret — vad, varför, grund, lagring, rätt
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Art. 13.1 kräver att vi anger ändamål och rättslig grund för varje
          kategori personuppgifter när de samlas in. Detta är registret, i sin
          helhet:
        </p>
        <div className="mt-4 space-y-4">
          {REGISTER.map((r, i) => (
            <div
              key={i}
              className="rounded-lg border border-gold/30 bg-card p-4"
            >
              <h3 className="font-serif text-lg font-bold text-foreground">
                {r.vad}
              </h3>
              <dl className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-foreground">
                    Varför:
                  </dt>
                  <dd>{r.varfor}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-foreground">
                    Rättslig grund:
                  </dt>
                  <dd>{r.grund}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-foreground">
                    Lagringstid:
                  </dt>
                  <dd>{r.lagring}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-foreground">
                    Din rätt:
                  </dt>
                  <dd>{r.ratt}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Analysändamålet ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          3. Så använder vi information för att analysera — och var gränsen går
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Vi säger det rakt ut: vi analyserar hur tjänsten används. Dina quiz-
          och kursdata gör din utbildning bättre (rätt svårighetsgrad, rätt
          nästa steg, rätt certifikatbetyg). Beteendetracern visar var vår
          pedagogik brister — till exempel om många fastnar på samma kapitel.
          Kognitiv profilen gör varningarna i texterna relevanta för just dina
          tendenser. Detta kallas ändamålsbegränsning (art. 5.1 b): uppgifter
          som samlats för ett ändamål får inte användas för ett oförenligt
          sådant.
        </p>
        <div className="mt-4 rounded-lg border border-gold/30 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Gränsen, enligt lagen:</strong>{" "}
          vi säljer aldrig dina personuppgifter, vi delar dem inte med
          annonsörer, och vi använder dem inte för att profilera dig mot
          tredje part. Analysen gäller utbildningen — inte din privatliv.
          Personuppgifter lämnas bara ut om det följer av lag (t.ex. bokförings-
          och skattelagstiftningens krav på transaktionsdata) eller om du
          uttryckligen begärt det (art. 6.1 c–e).
        </div>
      </section>

      {/* ── 4. Dina rättigheter ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          4. Dina åtta rättigheter — och hur du använder dem
        </h2>
        <ul className="mt-3 space-y-2 leading-relaxed text-muted-foreground">
          {[
            ["Tillgång (art. 15)", " få en kopia på allt vi sparar om dig."],
            ["Rättelse (art. 16)", " rätta felaktiga uppgifter."],
            ["Radering (art. 17)", " 'glömma mig' — radera allt, om ingen lag tvingar oss att spara (t.ex. bokföring)."],
            ["Begränsning (art. 18)", " pausa behandlingen medan en fråga utreds."],
            ["Portabilitet (art. 20)", " få dina data i ett maskinläsbart format."],
            ["Invändning (art. 21)", " säga nej till behandling som vilar på berättigat intresse — gäller tracern."],
            ["Återkalla samtycke (art. 7.3)", " när som helst, lika enkelt som du gav det."],
            ["Klagan (art. 77)", " hos Integritetsskyddsmyndigheten (IMY), Box 8114, 104 20 Stockholm — du behöver inte gå via oss."],
          ].map(([rubrik, text], i) => (
            <li key={i} className="flex gap-2">
              <span className="text-gold" aria-hidden="true">
                ·
              </span>
              <span>
                <strong className="text-foreground">{rubrik}</strong>
                {text}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Utöva rättigheterna genom ett mejl till info@ak1nvestor.com. Vi
          svarar utan onödigt dröjsmål och senast inom en månad (art. 12.3) —
          förlänger vi (t.ex. vid omfattande utdrag) meddelar vi dig inom
          månaden och förklarar varför. Det kostar ingenting (art. 12.5).
        </p>
      </section>

      {/* ── 5. Kakor ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          5. Kakor enligt lagen (2022:482)
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          När du först besöker oss möter du en kakmur med tre kategorier:
          nödvändigt (inloggning och säkerhet — kräver inget val), funktionalitet
          (dina preferenser) och analys (anonym statistik). Kakmuren lagrar ditt
          val i 12 månader och du kan ändra det när som helst via
          &quot;Kakinställningar&quot; i sidfoten — lagen kräver att det ska vara
          lika enkelt att återkalla ett samtycke som att ge det. Se hela
          kaklistan med namn och giltighetstid i{" "}
          {lank("/cookies", "kakpolicyn")}.
        </p>
      </section>

      {/* ── 6. Ångerrätt ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          6. Ångerrätt vid köp — 14 dagar, med ett undantag du måste känna till
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Köper du Fas 2 eller Fas 3 gäller lagen (2005:59) om distansavtal och
          avtal utanför affärslokaler: 14 dagars ångerrätt från avtalets
          ingående. Men för digitalt innehåll som levereras omedelbart upphör
          ångerrätten när leveransen påbörjats — om du först samtyckt
          uttryckligen till omedelbar åtkomst och gått med på att ångerrätten
          därmed upphör (2 kap. 11 § första stycket 11 p.). Därför finns en
          särskild kryssruta innan betalning och en orderbekräftelse på
          mejlen. Fas 1 kostar ingenting — där finns inget att ånga.{" "}
          {lank("/villkor", "Läs hela ångerrättssektionen i villkoren.")}
        </p>
      </section>

      {/* ── 7. Utbildning, inte rådgivning ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          7. Utbildning — inte värdepappersrådgivning
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          AK1A är en utbildningsverksamhet. Vi lämnar aldrig personliga
          investeringsråd eller rekommendationer om köp eller försäljning —
          sådan verksamhet är tillståndspliktig enligt lagen (2007:528) om
          värdepappersmarknaden, och vi bedriver den inte. Allt innehåll, även
          AI-Mentorns svar, är allmän undervisning som inte är anpassad till
          din ekonomiska situation. Det skyddar dig (du fattar egna beslut med
          full information) och det är exakt vad lagen kräver av oss.{" "}
          {lank("/finansiell-policy", "Läs den finansiella policyn.")}
        </p>
      </section>

      {/* ── 8. Automatiserade beslut ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          8. Profilering och automatiserade beslut
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Kognitiva profilen och XP-systemet är profilering i GDPR:s mening
          (art. 4.4) — men ingen del av tjänsten fattar automatiserade beslut
          med rättsverkän eller på annat sätt påverkar dig lika långtgående
          (art. 22). Certifikatbetyg räknas maskinellt ur dina quizresultat,
          men du kan alltid begära mänsklig omprövning genom att kontakta oss.
        </p>
      </section>

      {/* ── 9. Källor till lagen ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          9. Lagarna bakom sidan
        </h2>
        <ul className="mt-3 space-y-2 leading-relaxed text-muted-foreground">
          {[
            "Dataskyddsförordningen (EU) 2016/679 — särskilt artiklarna 5, 6, 7, 12–22 (upplysningar, informationsplikt, rättigheter).",
            "Lagen (2022:482) om elektronisk kommunikation — kakor och samtycke (6 kap.).",
            "Lagen (2005:59) om distansavtal och avtal utanför affärslokaler — information före köp och 14 dagars ångerrätt (2 kap. 10–11 §§).",
            "Lagen (2022:261) om avtal om digitalt innehåll och digitala tjänster — konsumentens rätt vid digital leverans.",
            "Lagen (2007:528) om värdepappersmarknaden — gränsen mellan utbildning och tillståndspliktig rådgivning.",
            "Lagen (1960:729) om upphovsrätt till litterära och konstnärliga verk — våra kurser bygger på egna bearbetningar med källhänvisning (se /upphovsratt).",
          ].map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-gold" aria-hidden="true">
                ·
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 10. Metodrad: regimeindikatorn (AKM3) ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          10. Metodrad — så räknas regimeindikatorn (AKM3)
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          AKM3 räknar en deterministisk regimbeskrivning av
          forskningsunderlaget: samma underlag ger alltid samma regim, och
          etiketten är daterad med korstabellens{" "}
          <em>senast kontrollerad</em>-datum — aldrig &quot;marknaden just
          nu&quot. Regimen väljer aldrig poängsättningsprofil, ändrar aldrig
          bolagspoäng och är aldrig ett råd (lagen 2007:528) — den beskriver
          läget i underlaget, och varje byte loggas öppet i en hash-kedjad
          append-only logg från dag 1. Indikatorer och trösklar redovisas
          här i sin helhet:
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-gold/30 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-foreground">
                <th className="py-1.5 pr-4 font-semibold">Indikator</th>
                <th className="py-1.5 pr-4 font-semibold">Källa</th>
                <th className="py-1.5 font-semibold">Trösklar (öppna tal)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gold/10">
                <td className="py-1.5 pr-4 align-top">
                  G — grönandel (0–1)
                </td>
                <td className="py-1.5 pr-4 align-top">
                  Korstabellens 100 bolag (forskningsläget)
                </td>
                <td className="py-1.5 align-top">
                  ≥ 0,10 tillsammans med N ≥ +0,20 ⇒ expansiv; &lt; 0,08 ⇒
                  magert (inträde); ≥ 0,10 ⇒ lämnar magert
                </td>
              </tr>
              <tr className="border-t border-gold/10">
                <td className="py-1.5 pr-4 align-top">R — rödandel (0–1)</td>
                <td className="py-1.5 pr-4 align-top">
                  Korstabellens 100 bolag (forskningsläget)
                </td>
                <td className="py-1.5 align-top">
                  &gt; 0,35 ⇒ magert (inträde); ≤ 0,30 krävs för att lämna
                  magert
                </td>
              </tr>
              <tr className="border-t border-gold/10">
                <td className="py-1.5 pr-4 align-top">
                  N — netto fundamental vågbredd (−1…+1)
                </td>
                <td className="py-1.5 pr-4 align-top">
                  Senaste vågskanningen (12 vågbolag)
                </td>
                <td className="py-1.5 align-top">
                  ≤ −0,20 ⇒ korrigering; ≥ +0,20 ⇒ expansiv (kräver G ≥ 0,10);
                  redovisas som <em>osatt</em> tills minst 30 vågbolag mäts —
                  därför vilar regimen idag enbart på G/R
                </td>
              </tr>
              <tr className="border-t border-gold/10">
                <td className="py-1.5 pr-4 align-top">
                  Σu — universumets årsvolatilitet
                </td>
                <td className="py-1.5 pr-4 align-top">Vågkonen (per bolag)</td>
                <td className="py-1.5 align-top">
                  &gt; 25 % ⇒ regimebyte kräver 3 bekräftade snapshots i
                  stället för 2 (osatt värde ⇒ standard 2)
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3">
            Etiketter: <strong>balanserad</strong>, <strong>expansiv</strong>,{" "}
            <strong>magert</strong>, <strong>korrigering</strong> eller{" "}
            <strong>osatt</strong>. Hysteres: in- och utträdeströsklar är
            åtskilda (grönt band 0,08–0,10) och varje byte kräver 2
            på varandra följande kvartalssnapshots — ett enskilt nytt grönt
            bolag vippar aldrig regimen. Kadens: kvartal, följande
            korstabellens manuella leverans. Källkod:{" "}
            <code className="rounded bg-gold/10 px-1.5 py-0.5 text-xs">
              src/lib/akm3/regim.ts
            </code>
            ; logg:{" "}
            <code className="rounded bg-gold/10 px-1.5 py-0.5 text-xs">
              data/portfolj-system/regime-logg.json
            </code>{" "}
            (append-only, hash-kedjad).
          </p>
        </div>
      </section>

      <div className="mt-8 rounded-lg border border-gold/30 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Om vi ändrar.</strong> Ändras vår
        databehandling i grunden uppdaterar vi den här sidan och meddelar dig i
        plattformen — enligt art. 13.3 ska du få veta om ändamålet ändras, inte
        bara läsa det i den finstilta småtrycket. Frågor? info@ak1nvestor.com.
      </div>
    </SeoPageShell>
  );
}
