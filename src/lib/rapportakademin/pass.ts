/**
 * RAPPORTAKADEMIN — PASS-DEFINITIONER (det vertikala snittet, styrelsebeslut
 * styrelse-muacmgtw-qizth0 åtgärd 1+2, 2026-09-20).
 *
 * ETT pass = ett bolags A-Ö-övning på RIKTIGA tal ur bolagets rapporter:
 * eleven bedömer FÖRST (produktivt misslyckande, Kapur), bedömningen lagras
 * (minimeringslistan, LAGBESLUT STYRELSE-MUADCVYF-CG1JM2) och EXPERTLÄSNINGEN
 * exponeras först DÄREFTER (kognitivt lärlingsskap, Collins/Brown/Newman).
 *
 * SÄKERHETSKONTRAKT:
 *   · Expertläsningar och rätt svar lever ENDAST i denna servermodul — de
 *     exponeras ALDRIG i GET-skal (passSkal()) och ALDRIG i sidans props.
 *   · Korrigeringen sker server-side (korrigeraSektion) — klienten mottar
 *     aldrig facit före sin egen bedömning är lagrad.
 *   · Ett pass är statiskt innehåll (inga personuppgifter) och får ligga i
 *     kodbasen; elevernas bedömningar däremot enbart via minimeringslistan.
 *
 * Talunderlag ABB: data/analyses/ABB.ST.json (motor, verifierad 2026-08-24) +
 * granskning data/blogg-utkast/granskning/sa-laser-du-abb-q3-2026-KONTROLL-
 * 2026-09-19.md (71 kontroller, medianer mot vintage 0e399f13). Pedagogik:
 * så läser man en rapport — ALDRIG investeringsråd (2007:528 2 kap 5 §).
 */

/** AKM-variabelkopplingen per sektion (ur VARIABEL_META, src/lib/akm2/karna.ts). */
export type SektionAkm = {
  variabel: string;
  namn: string;
  kursSlug: string;
};

/** En sektion i ett pass — allt utom kalla/frag/enhet är serverhemligt. */
export type PassSektion = {
  index: number;
  rubrik: string;
  akm: SektionAkm;
  /** Faktarader ur bolagets rapport som eleven ser FÖRE sin bedömning. */
  kalla: string[];
  fraga: string;
  enhet: string;
  rattSvar: number;
  /** Absolut tolerans i samma enhet — inom → full poäng, inom dubbla → 3 p. */
  tolerans: number;
  /** Expertens läsning av samma tal — stycken, exponeras EFTER bedömning. */
  expertlasning: string[];
};

/** Ett komplett A-Ö-pass. */
export type RapportPass = {
  slug: string;
  titel: string;
  bolag: string;
  ticker: string;
  bransch: string;
  verifierad: string;
  kallor: string[];
  intro: string[];
  sektioner: PassSektion[];
};

/** Det eleven får se före bedömning — INGA facit, INGEN expertläsning. */
export type OffentligSektion = {
  index: number;
  rubrik: string;
  akm: SektionAkm;
  kalla: string[];
  fraga: string;
  enhet: string;
};

export type OffentligtPass = {
  slug: string;
  titel: string;
  bolag: string;
  ticker: string;
  bransch: string;
  verifierad: string;
  intro: string[];
  sektioner: OffentligSektion[];
};

/** Poängskala 0/3/5 (AKM:s femgradiga andas, deliberate practice). */
export type Korrigering = {
  ratt: boolean;
  poang: number;
  rattSvar: number;
  felMarginal: number;
};

/** Registret — ett pass i det vertikala snittet; fler följer efter beviset. */
const PASS: RapportPass[] = [
  {
    slug: "abb-ar-2025",
    titel: "ABB 2025 — läs årsrapporten som en analytiker",
    bolag: "ABB Ltd",
    ticker: "ABB",
    bransch: "Industri",
    verifierad: "2026-08-24",
    kallor: [
      "ABB:s årsredovisningar 2022–2025 (via AK1A:s analysmotor)",
      "Branschmedianer: AK1A:s bolagsuniversum, industri n=12",
    ],
    intro: [
      "Här tränar du på ABB:s verkliga tal från årsredovisningarna 2022–2025. Metoden är alltid densamma: DU bedömer först — sedan visar vi hur en expert läser samma siffror. Det är medvetet: att gissa fel och sedan få se expertens tankesätt bygger djupare förståelse än att läsa facit först.",
      "Du får se råtalen från rapporten, en fråga i taget. Skriv din egen bedömning innan du låser in den — sedan kommer expertläsningen. Fem sektioner, en avslutande rubrik.",
    ],
    sektioner: [
      {
        index: 0,
        rubrik: "Sektion 1 — Omsättningens tillväxttakt",
        akm: { variabel: "V01", namn: "Försäljningstillväxt", kursSlug: "v01-forsaljningstillvaxt" },
        kalla: [
          "Nettoomsättning 2022: 29,4 miljarder kronor",
          "Nettoomsättning 2025: 33,2 miljarder kronor",
          "Under samma period växte resultatet efter skatt från 2,47 till 4,73 miljarder",
        ],
        fraga:
          "Ungefär hur många procent per år växte omsättningen mellan 2022 och 2025 (tre års sammansatt tillväxt)?",
        enhet: "% per år",
        rattSvar: 4.1,
        tolerans: 1.5,
        expertlasning: [
          "Så räknar experten: 33,2 ÷ 29,4 = 1,129. Kubikroten ur 1,129 är ungefär 1,041 — alltså cirka 4,1 procent per år. Tre år av stillsam volymtillväxt.",
          "Men notera den andra serien i rådelen: resultatet växte under SAMMA period med cirka 24 procent per år — ungefär sex gånger fortare än omsättningen. Slutsatsen experten drar: vinstökningen kommer nästan helt från marginaler och mix, inte från att bolaget sålt mycket mer. Därför läser man tillväxt och lönsamhet tillsammans — den ena serien utan den andra kan få ett bolag att se fel ut.",
          "Källan i rapporten: nettoomsättningen överst i resultaträkningen, aktuellt år och föregående år (AKM1 V01).",
        ],
      },
      {
        index: 1,
        rubrik: "Sektion 2 — Pris över kostnad: bruttomarginalen",
        akm: { variabel: "V07", namn: "Bruttomarginal", kursSlug: "v07-bruttomarginal" },
        kalla: [
          "Nettoomsättning 2025: 33,2 miljarder kronor",
          "Rörelsens kostnader exkl. personalkostnader 2025: cirka 19,8 miljarder kronor",
        ],
        fraga: "Vad blir bruttomarginalen — andelen av omsättningen som blir kvar över de rörliga kostnaderna (i procent)?",
        enhet: "%",
        rattSvar: 40.3,
        tolerans: 4,
        expertlasning: [
          "Räkningen: (33,2 − 19,8) ÷ 33,2 ≈ 0,403 — alltså 40,3 procent.",
          "Expertens nästa steg är alltid jämförelsen: 40,3 procent ligger strax över industrins median på 38,3 procent (tolv industribolag i universumet). Marginal över median tyder på prissättningskraft eller förmånlig mix — kunderna betalar lite mer per krona kostnad än hos konkurrenterna.",
          "Källan i rapporten: resultaträkningens rörelsekostnader exklusive personalkostnader (AKM1 V07). En stigande bruttomarginal över flera år är en av de tuffaste kvalitetssignalerna — men kom ihåg att den kan köpas med engångsfaktorer, så läs noterna.",
        ],
      },
      {
        index: 2,
        rubrik: "Sektion 3 — Avkastningen på ägarnas kapital",
        akm: { variabel: "V09", namn: "ROE", kursSlug: "v09-roe" },
        kalla: [
          "Resultat efter skatt 2025: 4,73 miljarder kronor",
          "Eget kapital i medeltal under året: cirka 14,5 miljarder kronor",
        ],
        fraga: "Vad blir avkastningen på eget kapital — ROE (i procent)?",
        enhet: "%",
        rattSvar: 32.6,
        tolerans: 5,
        expertlasning: [
          "Räkningen: 4,73 ÷ 14,5 ≈ 0,326 — alltså 32,6 procent. Varje hundralappa som ägarna har bundit i bolaget förräntas med drygt trettio kronor om året.",
          "Jämförelsen: industrins median ligger på 20,3 procent — ABB avkastar ungefär 1,6 gånger medianen. Men experten nöjer sig aldrig med ROE ensam: hävstång kan blåsa upp siffran. Därför kontrolleras den mot ROIC (24,2 procent hos ABB) och skuldsättningen — vilket är nästa sektion.",
          "Källan i rapporten: resultatet efter skatt i resultaträkningen; eget kapital i balansräkningen, årets början och slut — medelvärdet är nämnaren (AKM1 V09).",
        ],
      },
      {
        index: 3,
        rubrik: "Sektion 4 — Hävstången: skulderna mot eget kapital",
        akm: { variabel: "V10", namn: "Skuldsättningsgrad", kursSlug: "v10-skuldsattningsgrad" },
        kalla: [
          "Eget kapital 2025: cirka 14,5 miljarder kronor",
          "Skulder och övriga förpliktelser 2025: cirka 8,1 miljarder kronor",
        ],
        fraga: "Vad blir skuldsättningsgraden — skulder ÷ eget kapital (i gånger)?",
        enhet: "gånger",
        rattSvar: 0.56,
        tolerans: 0.15,
        expertlasning: [
          "Räkningen: 8,1 ÷ 14,5 ≈ 0,56. Skulderna är drygt hälften av det egna kapitalet — under 1, vilket i denna modell räknas som ett lagom lugnt läge.",
          "Jämförelsen: industrins median ligger på 0,46 — ABB ligger något över, men i en klass där balansräkningen fortfarande andas rådge.",
          "Nu faller pusselbiten från sektion 3 på plats: en del av ABB:s fina ROE kommer från hävstången. Med skuldsättningsgrad 0,56 är det en måttlig sådan — det är just därför man läser V09 och V10 tillsammans. Hög ROE med hög skuld är ett annat djur än hög ROE med låg skuld.",
          "Källan i rapporten: balansräkningens skuldposter och posten för eget kapital (AKM1 V10).",
        ],
      },
      {
        index: 4,
        rubrik: "Sektion 5 — Multipeln mot framtiden",
        akm: { variabel: "V06", namn: "EV/EBITDA", kursSlug: "v06-ev-ebitda" },
        kalla: [
          "P/E på senaste tolvmånadersresultatet: 35,4",
          "Prognoserad resultatökning nästa år: +12,7 procent",
        ],
        fraga: "Vad blir P/E på NÄSTA års prognosresultat — 35,4 ÷ 1,127 (i P/E-enheter)?",
        enhet: "P/E",
        rattSvar: 31.4,
        tolerans: 2,
        expertlasning: [
          "Räkningen: 35,4 ÷ 1,127 ≈ 31,4. När resultatet växer sjunker multipeln mot framtiden — det är därför tillväxtbolag kan bära höga P/E-tal utan att vara dyra, och lågtillväxtbolag kan vara billiga ändå.",
          "Jämförelsen håller experten ärlig: 31,4 ligger fortfarande över såväl industrins median (28,0) som universumets (20,2). Marknaden betalar alltså fortfarande en kvalitetspremie för ABB:s marginaler och avkastning — de starka talen från sektion 2 och 3 syns i priset.",
          "Multipeln är en förväntan, aldrig en slutsats. Här slutar utbildningspasset med metoden, inte med ett omdöme: så här vägs en multipel mot tillväxt och bransch — vad DU sedan tror om framtiden är din egen analys (det är hela poängen med utbildning, och därför är detta aldrig råd om att köpa eller sälja).",
        ],
      },
    ],
  },
];

/** Sök upp ett pass via slug — null om okänt (whitelist, inga fs-vägar). */
export function lasPass(slug: string): RapportPass | null {
  for (const p of PASS) if (p.slug === slug) return p;
  return null;
}

/** Allmaktigt skal: passet utan facit och utan expertläsningar. */
export function passSkal(p: RapportPass): OffentligtPass {
  const sektioner: OffentligSektion[] = p.sektioner.map((s) => ({
    index: s.index,
    rubrik: s.rubrik,
    akm: s.akm,
    kalla: s.kalla,
    fraga: s.fraga,
    enhet: s.enhet,
  }));
  return {
    slug: p.slug,
    titel: p.titel,
    bolag: p.bolag,
    ticker: p.ticker,
    bransch: p.bransch,
    verifierad: p.verifierad,
    intro: p.intro,
    sektioner,
  };
}

/** Korrigering med poängtrappa: inom tolerans 5 p, inom dubbla 3 p, annars 0. */
export function korrigeraSektion(s: PassSektion, elevensSvar: number): Korrigering {
  const felMarginal = Math.abs(elevensSvar - s.rattSvar);
  let poang = 0;
  if (felMarginal <= s.tolerans) poang = 5;
  else if (felMarginal <= s.tolerans * 2) poang = 3;
  return { ratt: poang > 0, poang, rattSvar: s.rattSvar, felMarginal };
}

/** Maxpoäng för hela passet (rubrikens nämnare). */
export function passMaxPoang(p: RapportPass): number {
  return p.sektioner.length * 5;
}
