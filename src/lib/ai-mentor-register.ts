/**
 * AI-MENTORN 2.0 — KURSREGISTER (våg 106 H2, beslut D3).
 *
 * Deterministiskt index över samtliga kurser, byggt ur getCourses()-källan
 * (public/deep-courses.json). Per kurs: slug, titel, kategori, AKM1-variabel
 * (V01–V20), kapitelantal, quiz-antal och minuter — allt som svarsmotorn
 * (ai-mentor-svar.ts) behöver för källmärkta svar UTAN API-kostnad.
 *
 * ── VARFÖR INBAKAD DATA? ────────────────────────────────────────────────────
 * content.ts (getCourses) är server-only (fs-läsning) men chat-widget.tsx är
 * en klientkomponent — samma dilemma som kurstips.ts löste med en statisk
 * konstant ("klienten kan inte läsa filen synkront — därför en statisk
 * konstant"). Våg 106 H2 följer det vedertagna mönstret.
 *
 * ── ÄKTHETSGARANTIN ─────────────────────────────────────────────────────────
 * Datan nedan är maskinbakad ur public/deep-courses.json med EXAKT samma
 * regler som byggKursregister() nedan. `node verktyg/testa-ai-mentor.mjs`
 * verifierar på varje körning att KURSREGISTER är djupt identiskt med
 * byggKursregister(getCourses()) — registret KAN aldrig tyst glida ifrån
 * riktig kursdata. Efter kurstillägg: regenerera med
 *   node verktyg/testa-ai-mentor.mjs --baka > nya-rader.txt
 * och klistra in över arrayen nedan (t.o.m. testet visar exakt diff).
 *
 * ── DETERMINISM (våg 106 H2) ────────────────────────────────────────────────
 * Sortering sker med kodpunkts-jämförelse (a < b), INTE localeCompare —
 * localeCompare är ICU-beroende och kan skilja mellan Node och webbläsare;
 * samma fråga ska alltid ge samma svar oavsett miljö.
 */

/** En rad i kursregistret — allting svarsmotorn behöver, inget mer. */
export type RegisterRad = {
  slug: string;
  titel: string;
  kategori: string;
  /** "V01".."V20" för AKM1:s tjugo variabelkurser; undefined för övriga. */
  variabel?: string;
  kapitel: number;
  quiz: number;
  minuter: number;
  niva: string;
};

/**
 * Minimal indata-typ för byggaren — strukturellt kompatibel med Course i
 * content.ts, så Object.values(getCourses()) kan matas rakt in (server eller
 * test), utan att denna modul behöver importera fs-baserad kod.
 */
export type RegisterKalla = {
  slug: string;
  title?: string;
  category?: string;
  chapterCount?: number;
  totalMinutes?: number;
  level?: string;
  chapters?: Array<{ quiz?: unknown[] }>;
};

/**
 * AKM1:s åtta kategorier — variabelkurserna V01–V20 är utspridda på dessa
 * (dokumentation av sambandet slug ⇄ kategori; själva detektionen görs ur
 * slug-mönstret ^vNN- som är stabilt mot kategorinamnbyten).
 */
const AKM1_KATEGORIER = [
  "TILLVÄXT",
  "VÄRDERING",
  "LÖNSAMHET",
  "STABILITET",
  "MOAT",
  "KATALYSATOR",
  "RISK",
  "KAPITALSTRUKTUR",
] as const;

/** "V09" ur slug-mönstret "v09-roe" — primär variabel-detektor (våg 106 H2). */
export function variabelFranSlug(slug: string): string | undefined {
  const m = slug.match(/^v(\d{2})-/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return n >= 1 && n <= 20 ? `V${m[1]}` : undefined;
}

/**
 * Bygg registret ur riktig kursdata (Object.values(getCourses()) på servern,
 * eller public/deep-courses.json i testet). Regi:
 *  - variabel: ur slug-mönstret ^vNN- (AKM1:s 20 variabelkurser)
 *  - quiz: summan av kapitelquiz:en; kapitel: chapterCount; minuter: totalMinutes
 *  - nivå: tom/missing → "Alla"
 *  - sortering: kodpunktsordning på slug (deterministisk över miljöer)
 */
export function byggKursregister(kurser: RegisterKalla[]): RegisterRad[] {
  return kurser
    .map((k) => ({
      slug: k.slug,
      titel: k.title ?? k.slug,
      kategori: k.category || "ÖVRIGT",
      variabel: variabelFranSlug(k.slug),
      kapitel: k.chapterCount || (k.chapters ? k.chapters.length : 0),
      quiz: (k.chapters || []).reduce((s, ch) => s + (ch.quiz ? ch.quiz.length : 0), 0),
      minuter: k.totalMinutes || 0,
      niva: (k.level || "").trim() || "Alla",
    }))
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
}

/**
 * KURSREGISTER — maskinbakat ur public/deep-courses.json (2026-09-16, 358
 * kurser; rebake s6-u1 omgång 5: spår 5:s nio nya — ln-02, ln-04, roic-01,
 * vr-02, tx-02, am-02, st-02, mt-02, kt-02 — efter att bas-testets fall E
 * fastställt glidningen 349/358). Äktheten verifieras av
 * verktyg/testa-ai-mentor.mjs.
 */
export const KURSREGISTER: RegisterRad[] = [
  { slug: "100-baggers", titel: "100 Baggers — Mayer: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 130, niva: "Alla" },
  { slug: "a-random-walk-down-wall-street", titel: "A Random Walk Down Wall Street — Malkiel: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 18, quiz: 54, minuter: 198, niva: "Alla" },
  { slug: "against-the-gods", titel: "Against the Gods — Bernstein: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "ak1ts-vaglarans-hierarki", titel: "AK1TS — Våglärans Hierarki: SUPERDJUP", kategori: "EKOSYSTEM", variabel: undefined, kapitel: 20, quiz: 60, minuter: 220, niva: "Alla" },
  { slug: "akm1-den-kontroversiella-modellen", titel: "AKM1 — Den Kontroversiella Modellen: SUPERDJUP", kategori: "EKOSYSTEM", variabel: undefined, kapitel: 20, quiz: 60, minuter: 240, niva: "Alla" },
  { slug: "all-about-asset-allocation", titel: "All About Asset Allocation — Ferri: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 150, niva: "Alla" },
  { slug: "am-01-likviditet-och-spread", titel: "Likviditet och spread — handelns dolda kostnader", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "am-02-index-och-passivt-agande", titel: "Index och passivt ägande — hur marknadens mått blev en vara", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "am-03-lasa-aktiesidan", titel: "Läsa aktiesidan — siffrorna på skärmen före metoderna", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "am-04-marknadsstruktur", titel: "Marknadsstruktur — hur handeln faktiskt fungerar", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "am-05-handelsdagens-auktioner", titel: "Handelsdagens auktioner — öppning, löpande handel och stängning", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "am-06-kortlage-och-aktieutlaning", titel: "Kortläge och aktieutlåning — den andra sidan av orderboken", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "am-07-indexomlaggningen", titel: "Indexomläggningen — flödet som flyttar kursen utan en enda nyhet", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "am-08-etfens-inre-mekanik", titel: "ETF:ens inre mekanik — korgen, skapelsen och arbitraget som håller priset", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "am-09-marginalhandeln", titel: "Marginalhandeln — belåningskontot, marginalkravet och kaskaden", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "analysis-for-financial-management", titel: "Analysis for Financial Management — Robert C. Higgins: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 51, minuter: 214, niva: "Alla" },
  { slug: "bf-01-tillganglighetsfalla", titel: "Tillgänglighetsfälla", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 14, minuter: 16, niva: "Intermediär" },
  { slug: "bf-02-sunk-cost", titel: "Sunk cost", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 15, niva: "Nybörjare" },
  { slug: "bf-03-mental-accounting", titel: "Mental accounting", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 18, minuter: 18, niva: "Intermediär" },
  { slug: "bf-04-investera-som-en-robot", titel: "Investera som en robot", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 24, niva: "Avancerad" },
  { slug: "bf-05-ankareffekt", titel: "Ankareffekt — snitt irrelevant", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 18, niva: "Intermediär" },
  { slug: "bf-06-tillganglighetsheuristik", titel: "Tillgänglighetsheuristik", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 16, niva: "Intermediär" },
  { slug: "bf-07-framstegseffekt", titel: "Framstegseffekt", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 14, niva: "Nybörjare" },
  { slug: "bf-08-priming", titel: "Priming — omedvetna influenser", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 16, niva: "Intermediär" },
  { slug: "bf-09-haloeffekt", titel: "Halo-effekt", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 14, niva: "Nybörjare" },
  { slug: "bf-10-dunningkruger", titel: "Dunning-Kruger", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 18, niva: "Intermediär" },
  { slug: "bf-11-kognitiv-bias", titel: "Kognitiv bias — komplett lista", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 24, niva: "Intermediär" },
  { slug: "bf-12-prospektteori", titel: "Prospektteori — Kahneman & Tversky", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 18, niva: "Intermediär" },
  { slug: "bf-13-arbitragens-granser", titel: "Arbitragens gränser — varför biasen får stanna i priserna", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "bf-14-beteendeportfoljteori", titel: "Beteendeportföljteori — pyramiden med mentala konton", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "bf-15-bubblans-anatomi", titel: "Bubblans anatomi — när allas misstag blir en och samma marknad", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "bf-16-slumpens-serier", titel: "Slumpens serier — mönster i brus och lagen om små tal", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "bf-17-nutidsbias-och-den-hyperboliska-kurvan", titel: "Nutidsbias och den hyperboliska kurvan — tidens psykologi", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "bk-01-balansrakningen", titel: "Balansräkningen — bolagets karta", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "bk-02-resultatrakningen", titel: "Resultaträkningen — bolagets resedagbok", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "bk-03-kassaflodesrakningen", titel: "Kassaflödesräkningen — pengarna som faktiskt rörde sig", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "bk-04-koncernredovisningens-grunder", titel: "Koncernredovisning — bolaget som äger bolag: konsolideringens logik", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "bk-05-redovisningspolitiken", titel: "Redovisningspolitiken — siffrornas formbara rum: samma ekonomi, två rapporter", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "bk-06-obeskattade-reserver-och-avsattningar", titel: "Obeskattade reserver och avsättningar — balansräkningens tvegift", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "bk-07-lagret-och-lagervarderingen", titel: "Lagret och lagervärderingen — balansräkningens termometer", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "bk-08-intaktredovisningen", titel: "Intäktredovisningen — när intäkten föds (IFRS 15:s fem steg)", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "blue-ocean-strategy", titel: "Blue Ocean Strategy — Kim & Mauborgne: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 184, niva: "Alla" },
  { slug: "bollinger-on-bollinger-bands", titel: "Bollinger on Bollinger Bands — Bollinger: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 170, niva: "Alla" },
  { slug: "bull-a-history-of-boom-and-bust", titel: "Bull! — Maggie Mahar: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 43, minuter: 186, niva: "Alla" },
  { slug: "charlie-munger-complete-investor", titel: "Charlie Munger: The Complete Investor — Griffin: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 165, niva: "Alla" },
  { slug: "come-into-my-trading-room", titel: "Come Into My Trading Room — Elder: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 170, niva: "Alla" },
  { slug: "common-sense-on-mutual-funds", titel: "Common Sense on Mutual Funds — Bogle: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 130, niva: "Alla" },
  { slug: "common-stocks-uncommon-profits", titel: "Common Stocks and Uncommon Profits — Fisher: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 165, niva: "Alla" },
  { slug: "competition-demystified", titel: "Competition Demystified — Greenwald & Kahn: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 16, quiz: 48, minuter: 185, niva: "Alla" },
  { slug: "contrarian-investment-strategies", titel: "Contrarian Investment Strategies — Dreman: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "creative-cash-flow-reporting", titel: "Creative Cash Flow Reporting — Mulford & Comiskey: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 165, niva: "Alla" },
  { slug: "devil-take-the-hindmost", titel: "Devil Take the Hindmost — Chancellor: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 150, niva: "Alla" },
  { slug: "distress-investing", titel: "Distress Investing: Principles and Technique — Whitman & Diz: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 170, niva: "Alla" },
  { slug: "ek-01-sam-viktningen", titel: "SAM-viktningen — fem teorier röstas, en signal föds", kategori: "EKOSYSTEM", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ek-02-labbets-karta", titel: "Labbets karta — fem motorer, ett hus: orienteringen före ek-01", kategori: "EKOSYSTEM", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "ek-03-arbetsflodet-i-labbet", titel: "Arbetsflödet i labbet — fem stationer, en loggad analys: arbetet mellan kartan och ek-01", kategori: "EKOSYSTEM", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ek-04-backtestens-hantverk", titel: "Backtestens hantverk — att testa en metod mot historien utan att lura sig själv", kategori: "EKOSYSTEM", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ek-05-monte-carlo-i-motorn", titel: "Monte Carlo i motorn — tusen framtider ur en kassaflödesprognos", kategori: "EKOSYSTEM", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ek-06-bayesianska-omviktningen", titel: "Bayesianska omviktningen — hur rösterna lär sig av träffar och missar", kategori: "EKOSYSTEM", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ek-07-walk-forward-i-motorn", titel: "Walk-forward i motorn — fönstret som validerar", kategori: "EKOSYSTEM", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "elliott-wave-principle", titel: "Elliott Wave Principle — Frost & Prechter: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 16, quiz: 48, minuter: 170, niva: "Alla" },
  { slug: "encyclopedia-of-chart-patterns", titel: "Encyclopedia of Chart Patterns — Bulkowski: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "expectations-investing", titel: "Expectations Investing — Rappaport & Mauboussin: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 130, niva: "Alla" },
  { slug: "extraordinary-popular-delusions", titel: "Extraordinary Popular Delusions — Mackay: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 12, quiz: 36, minuter: 120, niva: "Alla" },
  { slug: "fibonacci-applications", titel: "Fibonacci Applications and Strategies for Traders — Fischer: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 160, niva: "Alla" },
  { slug: "financial-shenanigans", titel: "Financial Shenanigans — Schilit: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "financial-statement-analysis-and-security-valuation", titel: "Financial Statement Analysis and Security Valuation — Stephen Penman: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 17, quiz: 51, minuter: 204, niva: "Alla" },
  { slug: "flash-boys", titel: "Flash Boys — Lewis: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 12, quiz: 36, minuter: 120, niva: "Alla" },
  { slug: "fooled-by-randomness", titel: "Fooled by Randomness — Taleb: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "fooling-some-of-the-people", titel: "Fooling Some of the People All of the Time — Einhorn: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 180, niva: "Alla" },
  { slug: "foretagsvardering-med-fundamental-analys", titel: "Företagsvärdering: med fundamental analys — Hjelström, Isaksson & Nilsson: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 190, niva: "Alla" },
  { slug: "good-to-great", titel: "Good to Great — Jim Collins: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 180, niva: "Alla" },
  { slug: "how-to-make-money-in-stocks", titel: "How to Make Money in Stocks — O'Neil: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 16, quiz: 48, minuter: 176, niva: "Alla" },
  { slug: "ib-01-vad-ar-ett-investmentbolag", titel: "Vad är ett investmentbolag? — bolaget som äger bolag", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "ib-02-substansens-kvalitet", titel: "Substansens kvalitet — att granska vad substanssiffran innehåller", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ib-03-forvaltarskapet", titel: "Förvaltarskapet — röstvärde, mandat och den aktiva ägaren", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ib-04-avkastningsrakningen", titel: "Avkastningsräkningen — substans, rabatt och utdelning: varje krona har en adress", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ib-05-kostnadstrappan", titel: "Kostnadstrappan — vad som äts på vägen mellan vinsten och fickan", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ib-06-evighetskapitalet", titel: "Evighetskapitalet — ägandet utan slutdatum", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ib-07-family-officen", titel: "Familjekontoret — kapitalets tredje ägarform", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "intermarket-analysis", titel: "Intermarket Analysis — Murphy: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 16, quiz: 48, minuter: 180, niva: "Alla" },
  { slug: "interpretation-of-financial-statements", titel: "The Interpretation of Financial Statements — Graham: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 130, niva: "Alla" },
  { slug: "investment-valuation", titel: "Investment Valuation — Damodaran: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 18, quiz: 54, minuter: 198, niva: "Alla" },
  { slug: "irrational-exuberance", titel: "Irrational Exuberance — Shiller: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "japanese-candlestick-charting", titel: "Japanese Candlestick Charting — Nison: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 16, quiz: 48, minuter: 160, niva: "Alla" },
  { slug: "km-001-bokforingens-grunder", titel: "Bokföringens grunder", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 22, niva: "Nybörjare" },
  { slug: "km-002-forvaltningsberattelsen", titel: "Förvaltningsberättelsen", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 17, minuter: 18, niva: "Intermediär" },
  { slug: "km-003-kassaflodesanalysen", titel: "Kassaflödesanalysen", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 24, niva: "Intermediär" },
  { slug: "km-004-noter", titel: "Noter — den dolda informationen", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 17, minuter: 28, niva: "Avancerad" },
  { slug: "km-005-eget-kapital-utdelningar", titel: "Eget kapital & utdelningar", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 17, minuter: 16, niva: "Nybörjare" },
  { slug: "km-006-kvartalsrapporten", titel: "Kvartalsrapporten", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 16, minuter: 20, niva: "Intermediär" },
  { slug: "km-007-dcf", titel: "DCF — diskonterade kassaflöden", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 18, minuter: 35, niva: "Avancerad" },
  { slug: "km-008-wacc", titel: "WACC — vägd kapitalkostnad", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 18, minuter: 30, niva: "Avancerad" },
  { slug: "km-009-pe", titel: "P/E — Price-to-Earnings djupdykning", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 18, minuter: 14, niva: "Nybörjare" },
  { slug: "km-010-evebit", titel: "EV/EBIT — renare än P/E", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 16, minuter: 18, niva: "Intermediär" },
  { slug: "km-011-relativ-vardering", titel: "Relativ värdering — peer comps", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 18, minuter: 22, niva: "Intermediär" },
  { slug: "km-012-sum-of-the-parts-sotp", titel: "Sum-of-the-Parts (SOTP)", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 14, minuter: 26, niva: "Avancerad" },
  { slug: "km-013-volatilitet-standardavvikelse", titel: "Volatilitet & standardavvikelse", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 18, niva: "Intermediär" },
  { slug: "km-014-korrelation-diversifiering", titel: "Korrelation & diversifiering", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 20, niva: "Intermediär" },
  { slug: "km-015-beta-capm", titel: "Beta & CAPM", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 24, niva: "Avancerad" },
  { slug: "km-016-sharpe-kvot", titel: "Sharpe-kvot", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 16, niva: "Intermediär" },
  { slug: "km-017-position-sizing-kelly-kriteriet", titel: "Position sizing & Kelly-kriteriet", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 17, minuter: 28, niva: "Avancerad" },
  { slug: "km-018-forlustaversion", titel: "Förlustaversion", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 18, minuter: 15, niva: "Nybörjare" },
  { slug: "km-019-bekraftelsefalla", titel: "Bekräftelsefälla", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 13, minuter: 14, niva: "Nybörjare" },
  { slug: "km-020-ankareffekt", titel: "Ankareffekt", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 15, minuter: 16, niva: "Intermediär" },
  { slug: "km-021-avskrivningsprinciper", titel: "Avskrivningsprinciper", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 20, niva: "Intermediär" },
  { slug: "km-022-goodwill-och-immateriella-tillgangar", titel: "Goodwill och immateriella tillgångar", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 25, niva: "Avancerad" },
  { slug: "km-023-leasing", titel: "Leasing — IFRS 16", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 16, minuter: 22, niva: "Avancerad" },
  { slug: "km-024-segmentrapportering", titel: "Segmentrapportering", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 15, minuter: 18, niva: "Intermediär" },
  { slug: "km-025-pensionsataganden", titel: "Pensionsåtaganden", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 17, minuter: 24, niva: "Avancerad" },
  { slug: "km-026-relaterade-parter", titel: "Relaterade parter", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 14, minuter: 20, niva: "Avancerad" },
  { slug: "km-027-pegratio", titel: "PEG-ratio", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 16, minuter: 20, niva: "Intermediär" },
  { slug: "km-028-reverse-dcf", titel: "Reverse DCF", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 16, minuter: 28, niva: "Avancerad" },
  { slug: "km-029-scenarioanalys", titel: "Scenario-analys", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 17, minuter: 24, niva: "Intermediär" },
  { slug: "km-030-margin-of-safety", titel: "Margin of safety", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 16, minuter: 18, niva: "Nybörjare" },
  { slug: "km-031-var", titel: "VaR — Value at Risk", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 26, niva: "Avancerad" },
  { slug: "km-032-stresstesting-portfoljen", titel: "Stress-testing portföljen", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 28, niva: "Avancerad" },
  { slug: "km-033-tailrisk-hedging", titel: "Tail-risk hedging", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 24, niva: "Avancerad" },
  { slug: "km-034-drawdownanalys", titel: "Drawdown-analys", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 20, niva: "Intermediär" },
  { slug: "km-035-flockbeteende", titel: "Flockbeteende", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 20, niva: "Intermediär" },
  { slug: "km-036-overconfidence", titel: "Overconfidence", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 15, minuter: 18, niva: "Intermediär" },
  { slug: "km-037-disposition-effect", titel: "Disposition effect", kategori: "BETEENDEFINANS", variabel: undefined, kapitel: 6, quiz: 17, minuter: 20, niva: "Intermediär" },
  { slug: "km-038-techsektorn", titel: "Tech-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 15, minuter: 28, niva: "Intermediär" },
  { slug: "km-039-pharmasektorn", titel: "Pharma-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 15, minuter: 30, niva: "Avancerad" },
  { slug: "km-040-banksektorn", titel: "Bank-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 18, minuter: 28, niva: "Intermediär" },
  { slug: "km-041-industrisektorn", titel: "Industri-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 13, minuter: 26, niva: "Intermediär" },
  { slug: "km-042-fastighetsektorn", titel: "Fastighet-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 18, minuter: 28, niva: "Intermediär" },
  { slug: "km-043-energisektorn", titel: "Energi-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 14, minuter: 26, niva: "Intermediär" },
  { slug: "km-044-konsumentsektorn", titel: "Konsument-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 15, minuter: 24, niva: "Intermediär" },
  { slug: "km-045-materialsektorn", titel: "Material-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 15, minuter: 26, niva: "Intermediär" },
  { slug: "km-046-telekomsektorn", titel: "Telekom-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 16, minuter: 24, niva: "Intermediär" },
  { slug: "km-047-utilitysektorn", titel: "Utility-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 18, minuter: 20, niva: "Nybörjare" },
  { slug: "km-048-halsovardsektorn", titel: "Hälsovård-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 16, minuter: 24, niva: "Intermediär" },
  { slug: "km-049-bolagsskatt-206", titel: "Bolagsskatt 20,6%", kategori: "SVENSK BOLAGSSKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 10, minuter: 16, niva: "Nybörjare" },
  { slug: "km-050-utdelningsskatt-30", titel: "Utdelningsskatt 30%", kategori: "SVENSK BOLAGSSKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 18, minuter: 18, niva: "Nybörjare" },
  { slug: "km-051-kapitalvinstskatt", titel: "Kapitalvinstskatt", kategori: "SVENSK BOLAGSSKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 15, minuter: 18, niva: "Nybörjare" },
  { slug: "km-052-isk", titel: "ISK — schablonskatt", kategori: "SVENSK BOLAGSSKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 17, minuter: 20, niva: "Intermediär" },
  { slug: "km-053-312reglerna", titel: "3:12-reglerna", kategori: "SVENSK BOLAGSSKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 14, minuter: 26, niva: "Avancerad" },
  { slug: "km-054-ranta", titel: "Ränta — priset på pengar", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 18, minuter: 18, niva: "Nybörjare" },
  { slug: "km-055-inflation", titel: "Inflation — 2% målet", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 16, minuter: 18, niva: "Nybörjare" },
  { slug: "km-056-centralbanker", titel: "Centralbanker", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 15, minuter: 22, niva: "Intermediär" },
  { slug: "km-057-konjunkturcykler", titel: "Konjunkturcykler", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 18, minuter: 24, niva: "Intermediär" },
  { slug: "km-058-valutor", titel: "Valutor", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 16, minuter: 22, niva: "Intermediär" },
  { slug: "km-059-optionsgrunder", titel: "Options-grunder", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 17, minuter: 20, niva: "Nybörjare" },
  { slug: "km-060-covered-calls", titel: "Covered calls", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 17, minuter: 22, niva: "Intermediär" },
  { slug: "km-061-protective-puts", titel: "Protective puts", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 17, minuter: 22, niva: "Intermediär" },
  { slug: "km-062-blackscholes", titel: "Black-Scholes", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 18, minuter: 30, niva: "Avancerad" },
  { slug: "km-063-direktavkastning", titel: "Direktavkastning", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 16, niva: "Nybörjare" },
  { slug: "km-064-utdelningstillvaxt", titel: "Utdelningstillväxt", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 20, niva: "Intermediär" },
  { slug: "km-065-dogs-of-the-dow", titel: "Dogs of the Dow", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 20, niva: "Intermediär" },
  { slug: "km-066-utdelning-vs-aterkop", titel: "Utdelning vs återköp", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 22, niva: "Intermediär" },
  { slug: "km-067-investmentbolag", titel: "Investmentbolag — NAV-rabatt", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 18, minuter: 24, niva: "Intermediär" },
  { slug: "km-068-wallenbergsfaren", titel: "Wallenberg-sfären", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 16, minuter: 26, niva: "Intermediär" },
  { slug: "km-069-orderbok-och-prissattning", titel: "Orderbok och prissättning", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 10, minuter: 18, niva: "Nybörjare" },
  { slug: "km-070-natmaklare-i-sverige", titel: "Nätmäklare i Sverige", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 18, minuter: 16, niva: "Nybörjare" },
  { slug: "konfluens-varde-moter-vagor", titel: "Konfluens — Där Värde Möter Vågor: DEN SAMMANSATTA METODEN", kategori: "EKOSYSTEM", variabel: undefined, kapitel: 13, quiz: 39, minuter: 169, niva: "Alla" },
  { slug: "ks-01-kapitalstruktur-grunder", titel: "Kapitalstruktur — hur bolaget är finansierat", kategori: "KAPITALSTRUKTUR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "ks-02-kapitalallokering", titel: "Kapitalallokering — styrelsens fem vägar", kategori: "KAPITALSTRUKTUR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ks-03-skuldens-anatomi", titel: "Skuldens anatomi — löptider, bindning och covenants", kategori: "KAPITALSTRUKTUR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ks-04-emissionens-mekanik", titel: "Emissionens mekanik — kvot, teckningsrätt och utspädningens aritmetik", kategori: "KAPITALSTRUKTUR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ks-05-covenanter-och-kreditbetyg", titel: "Covenanter och kreditbetyg — skuldens spelregler och prislapp", kategori: "KAPITALSTRUKTUR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ks-06-konvertibler-och-hybridkapital", titel: "Konvertibler och hybridkapital — skulden som kan bli eget kapital", kategori: "KAPITALSTRUKTUR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ks-07-kapitalstrukturens-avvagning", titel: "Kapitalstrukturens avvägning — tre teorier om skuldens rättvikt", kategori: "KAPITALSTRUKTUR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ks-08-valutasakringen", titel: "Valutasäkringen — terminen, swappen och kronan i rapporten", kategori: "KAPITALSTRUKTUR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "kt-01-vad-ar-en-katalysator", titel: "Vad är en katalysator? — händelsen som kan flytta en aktie", kategori: "KATALYSATOR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "kt-02-forvantningsanalys-och-kalibrering", titel: "Förväntningsanalys — vad står redan i kursen?", kategori: "KATALYSATOR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "kt-03-katalysatorkedjor", titel: "Katalysatorkedjor — andra ordningens effekter när en händelse utlöser nästa", kategori: "KATALYSATOR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "kt-04-den-uteblivna-katalysatorn", titel: "Den uteblivna katalysatorn — när händelsen kommer och ingenting händer", kategori: "KATALYSATOR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "kt-05-katalysatorernas-kalender", titel: "Katalysatorernas kalender — att bygga händelsekartan och läsa klustren", kategori: "KATALYSATOR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "kt-06-guidningen", titel: "Guidningen — bolagets egen prognos som leverans och katalysator", kategori: "KATALYSATOR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "kt-07-den-tillverkade-katalysatorn", titel: "Den tillverkade katalysatorn — aktivisten och händelsen som ingen annan skulle ha orsakat", kategori: "KATALYSATOR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "kt-08-optionsforfallets-dag", titel: "Optionsförfallets dag — kalenderns inbyggda katalysator", kategori: "KATALYSATOR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "kt-09-budpremien-och-budprocessen", titel: "Budpremien och budprocessen — katalysatorns paradfall", kategori: "KATALYSATOR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "liars-poker", titel: "Liar's Poker — Lewis: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 130, niva: "Alla" },
  { slug: "ln-01-dupont-analysen", titel: "Du Pont-analysen — plocka isär ROE", kategori: "LÖNSAMHET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ln-02-resultatkvalitet-och-accruals", titel: "Resultatkvalitet — är vinsten äkta?", kategori: "LÖNSAMHET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ln-03-marginaltrappan-och-operativ-havstavng", titel: "Marginaltrappan och operativ hävstång — resultaträkningens känslighet", kategori: "LÖNSAMHET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ln-04-kapitalbindning-och-rorelsekapital", titel: "Kapitalbindning och rörelsekapital — lönsamhetens andra halva", kategori: "LÖNSAMHET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ln-05-vad-ar-lonsamhet", titel: "Vad är lönsamhet? — vinstens förståelse i sex steg", kategori: "LÖNSAMHET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "ma-01-transmissionsmekaniken", titel: "Transmissionsmekaniken — från styrränta till bolagets resultat och värdering", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ma-02-lonebildning-och-kostnadsspiralen", titel: "Lönebildningen och kostnadsspiralen — från avtal till bolagets marginal", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ma-03-realrantan", titel: "Realräntan — pengars tidsvärde efter inflation", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ma-04-konjunkturindikatorerna", titel: "Konjunkturindikatorerna — månadens siffror och bolagets nästa rapport", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ma-05-kreditpremien", titel: "Kreditpremien — varför bolagets lån kostar mer än statens", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "ma-06-aktiernas-riskpremie", titel: "Aktiernas riskpremie — varför börsen betalar mer än statsobligationen", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ma-07-valutakursens-mekanik", titel: "Valutakursens mekanik — PPP, ränteparitet och exportörens vind", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "ma-08-bostadsmarknadens-mekanik", titel: "Bostadsmarknadens mekanik — lånekraft, tröghet och vägen till börsen", kategori: "MAKROEKONOMI & RÄNTA", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "made-in-america", titel: "Made in America — Sam Walton: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 168, niva: "Alla" },
  { slug: "manias-panics-and-crashes", titel: "Manias, Panics, and Crashes — Kindleberger & Aliber: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 150, niva: "Alla" },
  { slug: "margin-of-safety", titel: "Margin of Safety — Klarman: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "market-mind-games", titel: "Market Mind Games — Shull: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 160, niva: "Alla" },
  { slug: "market-wizards", titel: "Market Wizards — Schwager: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 130, niva: "Alla" },
  { slug: "martin-pring-on-market-momentum", titel: "Martin Pring on Market Momentum — Pring: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 180, niva: "Alla" },
  { slug: "mina-basta-investeringar", titel: "Mina bästa investeringar — Peter Lynch: KOMPLETT (alla kapitel)", kategori: "BOKMASTER", variabel: undefined, kapitel: 20, quiz: 60, minuter: 180, niva: "Alla" },
  { slug: "misbehaving", titel: "Misbehaving — Thaler: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "mk-01-bnp-och-tillvaxt", titel: "BNP och tillväxt", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 11, minuter: 16, niva: "Nybörjare" },
  { slug: "mk-02-arbetsloshet", titel: "Arbetslöshet", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 12, minuter: 20, niva: "Intermediär" },
  { slug: "mk-03-handelsbalans", titel: "Handelsbalans", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 15, minuter: 20, niva: "Intermediär" },
  { slug: "mk-04-statsobligationer", titel: "Statsobligationer", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 16, minuter: 22, niva: "Intermediär" },
  { slug: "mk-05-geopolitik", titel: "Geopolitik", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 17, minuter: 26, niva: "Avancerad" },
  { slug: "mk-06-penningpolitik", titel: "Penningpolitik — QE och QT", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 17, minuter: 24, niva: "Avancerad" },
  { slug: "mk-07-fiscal-politik", titel: "Finanspolitik — statsbudget", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 13, minuter: 22, niva: "Intermediär" },
  { slug: "mk-08-omvand-yield-curve", titel: "Omvänd yield curve", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 13, minuter: 20, niva: "Avancerad" },
  { slug: "mk-09-deflation-vs-inflation", titel: "Deflation vs inflation", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 14, minuter: 20, niva: "Intermediär" },
  { slug: "mk-10-oljepris", titel: "Oljepris — makro-drivrutin", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 15, minuter: 22, niva: "Intermediär" },
  { slug: "mk-11-kinaekonomin", titel: "Kina-ekonomin", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 15, minuter: 26, niva: "Avancerad" },
  { slug: "mk-12-demografins-klocka", titel: "Demografins klocka — åldrandets aritmetik och den redan slagna prognosen", kategori: "MAKROEKONOMI", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "mt-01-vad-ar-en-moat", titel: "Vad är en moat? — bolagets försvarsmur", kategori: "MOAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "mt-02-moat-erosion-och-vallgravstest", titel: "Moat-erosion — när vallgraven grävs igen", kategori: "MOAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "mt-03-vallgraven-i-siffror", titel: "Vallgraven i siffror — att mäta en moats styrka och livslängd", kategori: "MOAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "mt-04-vallgravens-fodelse", titel: "Vallgravens födelse — hur en moat byggs sten för sten", kategori: "MOAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "mt-05-byteskostnader-och-inlasning", titel: "Byteskostnader och inlåsning — moaten som håller kunden kvar", kategori: "MOAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "mt-06-kostnadsoverlagsenhet", titel: "Kostnadsöverlägsenhet — moaten ingen ser", kategori: "MOAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "mt-07-prisfullmakten", titel: "Prisfullmakten — moatens ultimata test", kategori: "MOAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "mt-08-kvalitetspremien", titel: "Kvalitetspremien — moatens pris och framtiden som redan betalats", kategori: "MOAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "od-01-optionens-greker", titel: "Optionens greker — delta, gamma, theta och vega", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "od-02-implicit-volatilitet", titel: "Implicit volatilitet — marknadens pris på framtiden", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "od-03-warranter-och-teckningsoptioner", titel: "Warranter och teckningsoptioner — optionen möter den svenska emissionen", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "od-04-kombinerade-optionspositioner", titel: "Kombinerade optionspositioner — collar, straddle och prisspridning", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "od-05-utdelningen-och-optionen", titel: "Utdelningen och optionen — ex-dagen, pariteten och det glömda kassaflödet", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "od-06-positionen-efter-bygget", titel: "Positionen efter bygget — delta, band och förfallodagen", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "od-07-terminskontraktet", titel: "Terminskontraktet — priset idag, leveransen sedan", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "od-08-binomialtradet-och-replikeringen", titel: "Binomialträdet och replikeringen — hur optionen får sitt pris", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "od-09-forsakringsskrivandet", titel: "Försäkringsskrivandet — optionssäljarens sida", kategori: "OPTIONS & DERIVAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "of-permanent-value", titel: "Of Permanent Value — Andrew Kilpatrick: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 43, minuter: 187, niva: "Alla" },
  { slug: "one-up-on-wall-street", titel: "One Up on Wall Street — Peter Lynch: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 188, niva: "Alla" },
  { slug: "origins-of-the-crash", titel: "Origins of the Crash — Lowenstein: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 168, niva: "Alla" },
  { slug: "pc-01-case-atlas-copco", titel: "Case: Atlas Copco", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 14, minuter: 30, niva: "Intermediär" },
  { slug: "pc-02-case-astrazeneca", titel: "Case: AstraZeneca", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 15, minuter: 35, niva: "Avancerad" },
  { slug: "pc-03-case-swedbank", titel: "Case: Swedbank", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 16, minuter: 28, niva: "Intermediär" },
  { slug: "pc-04-case-investor-ab", titel: "Case: Investor AB", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 17, minuter: 26, niva: "Intermediär" },
  { slug: "pc-05-case-volvo-ab", titel: "Case: Volvo AB", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 15, minuter: 28, niva: "Intermediär" },
  { slug: "pc-06-case-hm", titel: "Case: H&M", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 17, minuter: 25, niva: "Intermediär" },
  { slug: "pc-07-case-sinch", titel: "Case: Sinch", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 10, minuter: 32, niva: "Avancerad" },
  { slug: "pc-08-case-precise-biometrics", titel: "Case: Precise Biometrics", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 13, minuter: 35, niva: "Avancerad" },
  { slug: "pc-09-case-novo-nordisk", titel: "Case: Novo Nordisk", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 16, minuter: 30, niva: "Avancerad" },
  { slug: "pc-10-case-ericsson", titel: "Case: Ericsson", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 18, minuter: 28, niva: "Intermediär" },
  { slug: "pc-11-case-boliden", titel: "Case: Boliden — gruvor", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 12, minuter: 26, niva: "Intermediär" },
  { slug: "pc-12-case-skf", titel: "Case: SKF — industri-moat", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 12, minuter: 25, niva: "Intermediär" },
  { slug: "pc-13-case-ssab", titel: "Case: SSAB — cyklisk stål", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 12, minuter: 24, niva: "Intermediär" },
  { slug: "pc-14-case-electrolux", titel: "Case: Electrolux — disruption", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 12, minuter: 26, niva: "Intermediär" },
  { slug: "pc-15-case-kambi", titel: "Case: Kambi — tech-nisch", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 12, minuter: 28, niva: "Avancerad" },
  { slug: "pc-16-case-beijer-ref", titel: "Case: Beijer Ref — kyl-distribution", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 12, minuter: 24, niva: "Intermediär" },
  { slug: "pc-17-case-sandvik", titel: "Case: Sandvik — verktyg", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 12, minuter: 25, niva: "Intermediär" },
  { slug: "pc-18-case-oresund", titel: "Case: Öresund — investmentbolag", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 12, minuter: 22, niva: "Intermediär" },
  { slug: "pc-19-case-hoganas", titel: "Case: Höganäs — järnpulver-monopol", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 12, minuter: 26, niva: "Avancerad" },
  { slug: "pc-20-case-essity", titel: "Case: Essity — hygienvaror", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 12, minuter: 25, niva: "Intermediär" },
  { slug: "pc-21-ditt-forsta-case", titel: "Ditt första case — metoden före bolagen: ett påhittat bolag, steg för steg", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "pc-22-ditt-andra-case", titel: "Ditt andra case — jämförelsen: två bolag, samma bransch, sida vid sida", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "pe-01-private-equity-fonder", titel: "Private equity-fonder — hur onoterat kapital arbetar", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "pe-02-utfasningar-och-irr-mekanik", titel: "Utfasningar och IRR-mekanik — hur fonder realiserar värde", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "pe-03-forvarvsmaskinen", titel: "Förvärvsmaskinen — hur private equity bygger (och belastar) ett bolag", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "pe-04-den-privata-agarsidan", titel: "Den privata ägarsidan — bolagens värld utanför börsen", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "pe-05-andrahandsmarknaden", titel: "Andrahandsmarknaden — LP-andelens pris när fonden inte får vänta", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "pe-06-j-kurvan-och-capital-calls", titel: "J-kurvan och capital calls — pengarnas tid i private equity", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "pe-07-co-investeringen", titel: "Co-investeringen — andelen bredvid fonden", kategori: "PRIVATE EQUITY & INVESTMENTBOLAG", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "pf-01-portfoljbyggande", titel: "Portfölj-byggande", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 20, niva: "Nybörjare" },
  { slug: "pf-02-position-sizing", titel: "Position sizing", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 18, niva: "Nybörjare" },
  { slug: "pf-03-diversifiering", titel: "Diversifiering", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 22, niva: "Intermediär" },
  { slug: "pf-04-rebalansering", titel: "Rebalansering", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 20, niva: "Intermediär" },
  { slug: "pf-05-utdelningsstrategi", titel: "Utdelnings-strategi", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 24, niva: "Intermediär" },
  { slug: "pf-06-aterinvestering", titel: "Återinvestering — portföljens ränta-på-ränta", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 17, minuter: 18, niva: "Nybörjare" },
  { slug: "pf-07-krishantering", titel: "Kris-hantering", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 24, niva: "Intermediär" },
  { slug: "pf-08-isk-vs-aktiedepa", titel: "ISK vs Aktiedepå", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 16, niva: "Nybörjare" },
  { slug: "pf-09-taxloss-harvesting", titel: "Tax-loss harvesting", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 12, minuter: 20, niva: "Intermediär" },
  { slug: "pf-10-longshort", titel: "Long/short — hedging", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 12, minuter: 28, niva: "Avancerad" },
  { slug: "pf-11-koncentrerad-portfolj", titel: "Koncentrerad portfölj — 5-10 bolag", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 26, niva: "Avancerad" },
  { slug: "pf-12-arsrapportering", titel: "Årsrapportering — portfölj-review", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 22, niva: "Intermediär" },
  { slug: "pf-13-esgportfolj", titel: "ESG-portfölj", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 24, niva: "Intermediär" },
  { slug: "pf-14-pensionssparande", titel: "Pensionssparande", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 12, minuter: 20, niva: "Nybörjare" },
  { slug: "pf-15-faktorpremierna", titel: "Faktorpremierna — värde, storlek, momentum och det tysta betat", kategori: "PORTFÖLJHANTERING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "poor-charlies-almanack", titel: "Poor Charlie's Almanack — Munger: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "portfolj-ekosystemet", titel: "Från aktie till portfölj — 5×5×4-ekosystemet i praktiken", kategori: "PRAKTISKA CASE", variabel: undefined, kapitel: 6, quiz: 17, minuter: 55, niva: "Intermediär" },
  { slug: "principles-of-corporate-finance", titel: "Principles of Corporate Finance — Brealey, Myers & Allen: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 51, minuter: 215, niva: "Alla" },
  { slug: "quality-of-earnings", titel: "Quality of Earnings — O'Glove: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 12, quiz: 36, minuter: 120, niva: "Alla" },
  { slug: "quantitative-value", titel: "Quantitative Value — Gray & Carlisle: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 165, niva: "Alla" },
  { slug: "reminiscences-of-a-stock-operator", titel: "Reminiscences of a Stock Operator — Lefèvre: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 135, niva: "Alla" },
  { slug: "rk-01-kapitalforbranning", titel: "Kapitalförbränning — runway", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 15, minuter: 22, niva: "Intermediär" },
  { slug: "rk-02-emissionrisk", titel: "Emission-risk — utspädning", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 15, minuter: 24, niva: "Intermediär" },
  { slug: "rk-03-skuldfalla", titel: "Skuldfälla", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 20, niva: "Intermediär" },
  { slug: "rk-04-likviditetskris", titel: "Likviditetskris", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 17, minuter: 26, niva: "Avancerad" },
  { slug: "rk-05-cykelrisk", titel: "Cykelrisk", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 24, niva: "Intermediär" },
  { slug: "rk-06-regulatorisk-risk", titel: "Regulatorisk risk", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 26, niva: "Avancerad" },
  { slug: "rk-07-valutarisk", titel: "Valutarisk", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 17, minuter: 22, niva: "Intermediär" },
  { slug: "rk-08-ranterisk", titel: "Ränterisk — duration", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 28, niva: "Avancerad" },
  { slug: "rk-09-koncentrationsrisk", titel: "Koncentrationsrisk", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 18, niva: "Nybörjare" },
  { slug: "rk-10-korrelationsrisk", titel: "Korrelationsrisk", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 22, niva: "Intermediär" },
  { slug: "rk-11-bedrageririsk", titel: "Bedrägeri-risk", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 14, minuter: 30, niva: "Avancerad" },
  { slug: "rk-12-black-swanrisk", titel: "Black swan-risk", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 16, minuter: 26, niva: "Avancerad" },
  { slug: "rk-13-gdpr-och-datarisk", titel: "GDPR och data-risk", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 17, minuter: 20, niva: "Intermediär" },
  { slug: "rk-14-esgrisk", titel: "ESG-risk — miljö och sociala", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 15, minuter: 22, niva: "Intermediär" },
  { slug: "rk-15-cykelrisk", titel: "Cykel-risk — konjunkturkänslighet", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 24, niva: "Intermediär" },
  { slug: "rk-16-kontrahentrisken", titel: "Kontrahentrisken — vem står på andra sidan när det blåser", kategori: "RISKHANTERING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "roic-01-avkastning-pa-investerat-kapital", titel: "ROIC — lönsamhet utan hävstångens makeup", kategori: "LÖNSAMHET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "roic-02-avkastningstrappan", titel: "Avkastningstrappan — marginal och kapitalomsättning: ROIC:s två vägar", kategori: "LÖNSAMHET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "roic-03-inkrementell-roic", titel: "Inkrementell ROIC — nästa kronas avkastning och medeltalets blindhet", kategori: "LÖNSAMHET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "roic-04-vardeekvationen", titel: "Värdeekvationen — ROIC, återinvestering och multipelns pris", kategori: "LÖNSAMHET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "roic-05-den-ekonomiska-vinsten", titel: "Den ekonomiska vinsten — EVA och tröskeln där tillväxt börjar skapa värde", kategori: "LÖNSAMHET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "rp-01-riskmattens-karta", titel: "Riskmåttens karta — fem mått, fem frågor, innan formlerna", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "rp-02-tre-matt-tre-fragor", titel: "Tre mått, tre frågor — Sharpe, Sortino och Calmar i samma portfölj", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "rp-03-riskparitet", titel: "Riskparitet — att viktta portföljen efter risk, inte kronor", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "rp-04-volatilitetsbudgeten", titel: "Volatilitetsbudgeten — portföljens risk satt i ett tal och fördelad i kronor", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "rp-05-sekvensrisken", titel: "Sekvensrisken — utfallsordningen som äger decenniet", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "rp-06-volatilitetsdraget", titel: "Volatilitetsdraget — brusets avgift på tillväxten", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "rp-07-vantan-i-svansen", titel: "Väntat fall i svansen — CVaR och måttet bakom tröskeln", kategori: "RISKHANTERING & PORTFÖLJTEORI", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "rs-01-volatilitet-och-risk", titel: "Volatilitet och risk — skilj svängningar från förlust", kategori: "RISK", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "rs-02-kundkoncentration", titel: "Kundkoncentration — när få kunder bär intäkterna", kategori: "RISK", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "rs-03-dold-samvariation", titel: "Dold samvariation — när bolagen delar samma risk", kategori: "RISK", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "rs-04-riskmatrisen", titel: "Riskmatrisen — att kartlägga osäkerheten", kategori: "RISK", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "rs-05-riskavsnittet-mellan-raderna", titel: "Riskavsnittet mellan raderna — att läsa bolagets egen riskredovisning", kategori: "RISK", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "rs-06-riskens-anatomi", titel: "Riskens anatomi — de fyra adresserna där risken bor", kategori: "RISK", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "rs-07-leverantorsrisken", titel: "Leverantörsrisken — inköpens koncentration och maktbalansen", kategori: "RISK", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "rs-08-modellrisken", titel: "Modellrisken — den femte adressen: antagandena, felmarginalen och det egna felet", kategori: "RISK", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "rs-09-personalrisken", titel: "Personalrisken — den sjätte adressen: nyckelpersonerna, kunskapen och successionen", kategori: "RISK", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "se-01-saassektorn", titel: "SaaS-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 14, minuter: 28, niva: "Avancerad" },
  { slug: "se-02-halvledarsektorn", titel: "Halvledar-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 11, minuter: 30, niva: "Avancerad" },
  { slug: "se-03-forsvarssektorn", titel: "Försvars-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 13, minuter: 24, niva: "Intermediär" },
  { slug: "se-04-logistiksektorn", titel: "Logistik-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 15, minuter: 24, niva: "Intermediär" },
  { slug: "se-05-lyxsektorn", titel: "Lyx-sektorn", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 15, minuter: 24, niva: "Intermediär" },
  { slug: "se-06-finanssektorn", titel: "Finans-sektorn — försäkring", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 26, niva: "Intermediär" },
  { slug: "se-07-detailhandel", titel: "Detaljhandel — skala och e-handel", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 26, niva: "Intermediär" },
  { slug: "se-08-media", titel: "Media — innehåll och streaming", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 24, niva: "Intermediär" },
  { slug: "se-09-bil", titel: "Bil — disruption och el", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 26, niva: "Intermediär" },
  { slug: "se-10-flyg", titel: "Flyg — cykel och bränsle", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 24, niva: "Intermediär" },
  { slug: "se-11-krypto", titel: "Krypto — extrem risk", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 18, minuter: 28, niva: "Avancerad" },
  { slug: "se-12-spel", titel: "Spel — licens och regulation", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 24, niva: "Intermediär" },
  { slug: "se-13-utbildning", titel: "Utbildning — återkommande intäkter", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 22, niva: "Intermediär" },
  { slug: "se-14-livsmedel", titel: "Livsmedel — staplar och varumärke", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 20, niva: "Nybörjare" },
  { slug: "se-15-logistik", titel: "Logistik — nätverk", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 12, minuter: 24, niva: "Intermediär" },
  { slug: "se-16-sektoranalysens-metod", titel: "Sektoranalysens metod — tre frågor till vilken sektor som helst", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "se-17-skogssektorn", titel: "Skog — massans cykel och ägd råvara", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "se-18-rederi-och-shipping", titel: "Rederi och shipping — fraktens cykel och fartyget som kapital", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "se-19-forsakringssektorn", titel: "Försäkringssektorn — combined ratio, floaten och de två motorerna", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "se-20-gruv-och-metallsektorn", titel: "Gruv- och metallsektorn — berget, kassamarginalen och den tröga cykeln", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "se-21-kemisektorn", titel: "Kemisektorn — kväve ur luft, fosfor ur berg", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "se-22-byggentreprenaden", titel: "Byggentreprenaden — fast pris, orderstocken och procenten på färdigt", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "se-23-stalsektorn", titel: "Stålsektorn — kapacitetens hävstång, malmen mot skrotet och förädlingstrappan", kategori: "SEKTORANALYS", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "security-analysis", titel: "Security Analysis — Graham & Dodd: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 20, quiz: 60, minuter: 240, niva: "Alla" },
  { slug: "shoe-dog", titel: "Shoe Dog — Phil Knight: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 12, quiz: 40, minuter: 156, niva: "Alla" },
  { slug: "sj-01-utlandsk-kallskatt", titel: "Utländsk källskatt", kategori: "SKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 18, minuter: 22, niva: "Intermediär" },
  { slug: "sj-02-cryptobeskattning", titel: "Crypto-beskattning", kategori: "SKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 17, minuter: 22, niva: "Intermediär" },
  { slug: "sj-03-bolagsstamma-och-rostratt", titel: "Bolagsstämma och rösträtt", kategori: "SKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 13, minuter: 18, niva: "Nybörjare" },
  { slug: "sj-04-optionsbeskattning", titel: "Options-beskattning", kategori: "SKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 9, minuter: 24, niva: "Avancerad" },
  { slug: "sj-05-kapitalforsakring-vs-isk", titel: "Kapitalförsäkring vs ISK", kategori: "SKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 16, minuter: 20, niva: "Intermediär" },
  { slug: "sj-06-arv-gava-och-ingaende-varde", titel: "Arv, gåva och aktiernas ingående värde", kategori: "SKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 0, minuter: 20, niva: "Intermediär" },
  { slug: "sj-07-forlustavdrag-och-kvotering", titel: "Förlustavdrag och kvotering — förlustens skattemekanik", kategori: "SKATT & JURIDIK", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "st-01-soliditet-och-rantetackning", titel: "Soliditet & räntetäckningsgrad — svensk stabilitetsstandard", kategori: "STABILITET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "st-02-kanslighetsanalys-och-stresstest", titel: "Känslighetsanalys — stresstesta balansräkningen", kategori: "STABILITET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "st-03-altman-z-score", titel: "Konkursprognos — Altman Z-score", kategori: "STABILITET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "st-04-stabilitet-genom-kreditcykeln", titel: "Stabilitet genom kreditcykeln — samma balansräkning, två världar", kategori: "STABILITET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "st-05-refinansieringsmuren", titel: "Refinansieringsmuren — när skulden förfaller i klunga", kategori: "STABILITET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "st-06-likviditetsreserven", titel: "Likviditetsreserven — kassan, faciliteten och överlevnadstiden", kategori: "STABILITET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "stocks-for-the-long-run", titel: "Stocks for the Long Run — Siegel: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 130, niva: "Alla" },
  { slug: "tanka-snabbt-och-langsamt", titel: "Tänka snabbt och långsamt — Kahneman: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 150, niva: "Alla" },
  { slug: "technical-analysis-financial-markets", titel: "Technical Analysis of the Financial Markets — Murphy: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 20, quiz: 60, minuter: 220, niva: "Alla" },
  { slug: "technical-analysis-of-stock-trends", titel: "Technical Analysis of Stock Trends — Edwards & Magee: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 150, niva: "Alla" },
  { slug: "teknisk-analys-med-johnny-torssell", titel: "Teknisk analys med Johnny Torssell — SVENSKT STANDARDVERK: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 195, niva: "Alla" },
  { slug: "the-acquirers-multiple", titel: "The Acquirer's Multiple — Tobias Carlisle: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 160, niva: "Alla" },
  { slug: "the-alchemy-of-finance", titel: "The Alchemy of Finance — Soros: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "the-art-of-short-selling", titel: "The Art of Short Selling — Staley: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 130, niva: "Alla" },
  { slug: "the-big-short", titel: "The Big Short — Lewis: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "the-black-swan", titel: "The Black Swan — Taleb: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 150, niva: "Alla" },
  { slug: "the-bogleheads-guide-to-investing", titel: "The Bogleheads' Guide to Investing — Larimore, Lindauer & LeBoeuf: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 180, niva: "Alla" },
  { slug: "the-complete-turtletrader", titel: "The Complete TurtleTrader — Covel: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 168, niva: "Alla" },
  { slug: "the-dhandho-investor", titel: "The Dhandho Investor — Pabrai: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 130, niva: "Alla" },
  { slug: "the-essays-of-warren-buffett", titel: "The Essays of Warren Buffett — Cunningham: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 150, niva: "Alla" },
  { slug: "the-everything-store", titel: "The Everything Store — Brad Stone: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 42, minuter: 169, niva: "Alla" },
  { slug: "the-five-rules-for-successful-stock-investing", titel: "The Five Rules for Successful Stock Investing — Pat Dorsey: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 17, quiz: 51, minuter: 206, niva: "Alla" },
  { slug: "the-great-crash-1929", titel: "The Great Crash 1929 — Galbraith: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 130, niva: "Alla" },
  { slug: "the-hour-between-dog-and-wolf", titel: "The Hour Between Dog and Wolf — Coates: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 168, niva: "Alla" },
  { slug: "the-innovators-dilemma", titel: "The Innovator's Dilemma — Clayton Christensen: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 180, niva: "Alla" },
  { slug: "the-intelligent-asset-allocator", titel: "The Intelligent Asset Allocator — Bernstein: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 140, niva: "Alla" },
  { slug: "the-intelligent-investor", titel: "The Intelligent Investor — Graham: KOMPLETT (alla kapitel)", kategori: "BOKMASTER", variabel: undefined, kapitel: 21, quiz: 63, minuter: 180, niva: "Alla" },
  { slug: "the-little-book-of-value-investing", titel: "The Little Book of Value Investing — Christopher Browne: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 141, niva: "Alla" },
  { slug: "the-little-book-that-beats-the-market", titel: "The Little Book That Beats the Market — Greenblatt: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 11, quiz: 33, minuter: 99, niva: "Alla" },
  { slug: "the-master-swing-trader", titel: "The Master Swing Trader — Farley: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 177, niva: "Alla" },
  { slug: "the-money-game", titel: "The Money Game — Adam Smith: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 12, quiz: 36, minuter: 120, niva: "Alla" },
  { slug: "the-most-important-thing", titel: "The Most Important Thing — Marks: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 150, niva: "Alla" },
  { slug: "the-new-science-of-technical-analysis", titel: "The New Science of Technical Analysis — DeMark: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 168, niva: "Alla" },
  { slug: "the-outsiders", titel: "The Outsiders — Thorndike: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "the-psychology-of-money", titel: "The Psychology of Money — Housel: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "the-signal-and-the-noise", titel: "The Signal and the Noise — Silver: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "the-snowball", titel: "The Snowball — Schroeder om Buffett: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 16, quiz: 48, minuter: 165, niva: "Alla" },
  { slug: "the-theory-of-investment-value", titel: "The Theory of Investment Value — Williams: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 140, niva: "Alla" },
  { slug: "the-trend-following-bible", titel: "The Trend Following Bible — Abraham: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 168, niva: "Alla" },
  { slug: "the-visual-investor", titel: "The Visual Investor — Murphy: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 170, niva: "Alla" },
  { slug: "the-warren-buffett-portfolio", titel: "The Warren Buffett Portfolio — Hagstrom: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 160, niva: "Alla" },
  { slug: "the-warren-buffett-way", titel: "The Warren Buffett Way — Hagstrom: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 16, quiz: 48, minuter: 180, niva: "Alla" },
  { slug: "this-time-is-different", titel: "This Time Is Different — Reinhart & Rogoff: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 180, niva: "Alla" },
  { slug: "trading-for-a-living", titel: "Trading for a Living — Elder: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "trading-in-the-zone", titel: "Trading in the Zone — Douglas: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 160, niva: "Alla" },
  { slug: "ts-01-elliott-wave", titel: "Elliott Wave — 5-vågs impuls", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 28, niva: "Avancerad" },
  { slug: "ts-02-elliott-wave", titel: "Elliott Wave — 3-vågs korrektion", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 25, niva: "Avancerad" },
  { slug: "ts-03-fibonacciretracements", titel: "Fibonacci-retracements", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 15, minuter: 22, niva: "Intermediär" },
  { slug: "ts-04-fibonacciextensions", titel: "Fibonacci-extensions", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 14, minuter: 20, niva: "Intermediär" },
  { slug: "ts-05-gannvinklar", titel: "Gann-vinklar", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 16, minuter: 30, niva: "Avancerad" },
  { slug: "ts-06-ganncyklar", titel: "Gann-cyklar", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 13, minuter: 26, niva: "Avancerad" },
  { slug: "ts-07-lucastalserie", titel: "Lucas-talserie", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 13, minuter: 22, niva: "Intermediär" },
  { slug: "ts-08-volymanalys", titel: "Volym-analys", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 12, minuter: 24, niva: "Intermediär" },
  { slug: "ts-09-volymprofiler", titel: "Volym-profiler — VPOC", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 11, minuter: 28, niva: "Avancerad" },
  { slug: "ts-10-ak1ts-25cellers-matris", titel: "AK1TS 25-cellers matris", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 35, niva: "Avancerad" },
  { slug: "ts-11-candlestickmonster", titel: "Candlestick-mönster", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 14, minuter: 18, niva: "Nybörjare" },
  { slug: "ts-12-moving-averages", titel: "Moving Averages", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 16, minuter: 16, niva: "Nybörjare" },
  { slug: "ts-13-rsi", titel: "RSI", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 16, minuter: 22, niva: "Intermediär" },
  { slug: "ts-14-macd", titel: "MACD", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 17, minuter: 20, niva: "Intermediär" },
  { slug: "ts-15-bollinger-bands", titel: "Bollinger Bands", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 17, minuter: 22, niva: "Intermediär" },
  { slug: "ts-16-stod-och-motstand", titel: "Stöd och motstånd", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 15, minuter: 18, niva: "Nybörjare" },
  { slug: "ts-17-trendlinjer", titel: "Trendlinjer", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 14, minuter: 16, niva: "Nybörjare" },
  { slug: "ts-18-chartmonster", titel: "Chart-mönster", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 14, minuter: 24, niva: "Intermediär" },
  { slug: "ts-19-fibonaccitidszoner", titel: "Fibonacci-tidszoner", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 13, minuter: 22, niva: "Avancerad" },
  { slug: "ts-20-harmoniska-monster", titel: "Harmoniska mönster", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 14, minuter: 30, niva: "Avancerad" },
  { slug: "ts-21-fibonaccikluster", titel: "Fibonacci-kluster", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 16, minuter: 24, niva: "Avancerad" },
  { slug: "ts-22-elliott-wave", titel: "Elliott Wave — multipla tidshorisonter", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 18, minuter: 28, niva: "Avancerad" },
  { slug: "ts-23-volume-spread-analysis-vsa", titel: "Volume Spread Analysis (VSA)", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 12, minuter: 26, niva: "Avancerad" },
  { slug: "ts-24-order-flow", titel: "Order Flow — marknadsdjup", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 12, minuter: 30, niva: "Avancerad" },
  { slug: "ts-25-market-profile", titel: "Market Profile", kategori: "AK1TS FÖRDJUPNING", variabel: undefined, kapitel: 6, quiz: 12, minuter: 28, niva: "Avancerad" },
  { slug: "tx-01-organisk-mot-forvarvad-tillvaxt", titel: "Organisk vs förvärvad tillväxt — spåra källan", kategori: "TILLVÄXT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "tx-02-volym-pris-och-mix", titel: "Volym, pris och mix — tillväxtens tre motorer", kategori: "TILLVÄXT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "tx-03-nar-skapar-tillvaxt-varde", titel: "När skapar tillväxt värde? — återinvesteringens matematik", kategori: "TILLVÄXT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "tx-04-tillvaxtens-granser", titel: "Tillväxtens gränser — S-kurvan, mättnaden och utrymmesräkningen", kategori: "TILLVÄXT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "tx-05-tillvaxtens-forsta-lasning", titel: "Tillväxtens första läsning — årtal, procent och tjocka filtar", kategori: "TILLVÄXT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "tx-06-enhetsekonomin", titel: "Enhetsekonomin — nästa kunds hela räknelära", kategori: "TILLVÄXT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "tx-07-fran-siffra-till-kassa", titel: "Från siffra till kassa — tillväxtens konverteringstest", kategori: "TILLVÄXT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "ud-01-payout-ratio", titel: "Payout ratio", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 12, minuter: 18, niva: "Intermediär" },
  { slug: "ud-02-aterinvestering", titel: "Återinvestering — utdelningens kraft", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 18, niva: "Nybörjare" },
  { slug: "ud-03-dividend-aristocrats", titel: "Dividend Aristocrats", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 22, niva: "Intermediär" },
  { slug: "ud-04-utdelningsfallor", titel: "Utdelnings-fällor", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 20, niva: "Intermediär" },
  { slug: "ud-05-drip", titel: "DRIP — automatisk återinvestering", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 12, minuter: 16, niva: "Nybörjare" },
  { slug: "ud-06-svenska-utdelningsaktier", titel: "Svenska utdelnings-aktier", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 22, niva: "Intermediär" },
  { slug: "ud-07-utdelningskalender", titel: "Utdelnings-kalender", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 16, niva: "Nybörjare" },
  { slug: "ud-08-speciella-utdelningar", titel: "Speciella utdelningar", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 18, minuter: 18, niva: "Intermediär" },
  { slug: "ud-09-utdelningens-hallbarhet", titel: "Utdelningens hållbarhet — att stressa kronorna bakom utdelningen", kategori: "UTDELNINGSSTRATEGI", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "v01-forsaljningstillvaxt", titel: "Försäljningstillväxt", kategori: "TILLVÄXT", variabel: "V01", kapitel: 11, quiz: 18, minuter: 44, niva: "Nybörjare" },
  { slug: "v02-arr-tillvaxt", titel: "ARR-tillväxt (återkommande intäkter)", kategori: "TILLVÄXT", variabel: "V02", kapitel: 11, quiz: 17, minuter: 46, niva: "Intermediär" },
  { slug: "v03-intaktsdiversifiering", titel: "Intäktsdiversifiering", kategori: "TILLVÄXT", variabel: "V03", kapitel: 11, quiz: 18, minuter: 43, niva: "Nybörjare" },
  { slug: "v04-ps", titel: "P/S (Price-to-Sales)", kategori: "VÄRDERING", variabel: "V04", kapitel: 11, quiz: 18, minuter: 44, niva: "Nybörjare" },
  { slug: "v05-pb", titel: "P/B (Price-to-Book)", kategori: "VÄRDERING", variabel: "V05", kapitel: 11, quiz: 18, minuter: 44, niva: "Nybörjare" },
  { slug: "v06-ev-ebitda", titel: "EV/EBITDA", kategori: "VÄRDERING", variabel: "V06", kapitel: 11, quiz: 18, minuter: 44, niva: "Intermediär" },
  { slug: "v07-bruttomarginal", titel: "Bruttomarginal", kategori: "LÖNSAMHET", variabel: "V07", kapitel: 11, quiz: 18, minuter: 44, niva: "Nybörjare" },
  { slug: "v08-ebitda-marginal", titel: "EBITDA-marginal", kategori: "LÖNSAMHET", variabel: "V08", kapitel: 11, quiz: 18, minuter: 44, niva: "Intermediär" },
  { slug: "v09-roe", titel: "ROE (Return on Equity)", kategori: "LÖNSAMHET", variabel: "V09", kapitel: 11, quiz: 18, minuter: 44, niva: "Intermediär" },
  { slug: "v10-skuldsattningsgrad", titel: "Skuldsättningsgrad", kategori: "STABILITET", variabel: "V10", kapitel: 11, quiz: 18, minuter: 43, niva: "Nybörjare" },
  { slug: "v11-likviditet", titel: "Likviditet (Kvick)", kategori: "STABILITET", variabel: "V11", kapitel: 11, quiz: 18, minuter: 43, niva: "Nybörjare" },
  { slug: "v12-intaktsstabilitet", titel: "Intäktsstabilitet", kategori: "STABILITET", variabel: "V12", kapitel: 11, quiz: 18, minuter: 43, niva: "Intermediär" },
  { slug: "v13-patent-ip", titel: "Patent & Immateriella rättigheter", kategori: "MOAT", variabel: "V13", kapitel: 11, quiz: 18, minuter: 48, niva: "Intermediär" },
  { slug: "v14-varumarke", titel: "Varumärke & Kundlojalitet", kategori: "MOAT", variabel: "V14", kapitel: 11, quiz: 17, minuter: 48, niva: "Intermediär" },
  { slug: "v15-natverkseffekter", titel: "Nätverkseffekter", kategori: "MOAT", variabel: "V15", kapitel: 11, quiz: 18, minuter: 48, niva: "Avancerad" },
  { slug: "v16-produktlanseringar", titel: "Produktlanseringar", kategori: "KATALYSATOR", variabel: "V16", kapitel: 11, quiz: 18, minuter: 48, niva: "Intermediär" },
  { slug: "v17-avtal-partnerskap", titel: "Avtal & Partnerskap", kategori: "KATALYSATOR", variabel: "V17", kapitel: 11, quiz: 16, minuter: 48, niva: "Intermediär" },
  { slug: "v18-regulatoriska", titel: "Regulatoriska katalysatorer", kategori: "KATALYSATOR", variabel: "V18", kapitel: 11, quiz: 16, minuter: 48, niva: "Avancerad" },
  { slug: "v19-kapitalforbranning", titel: "Kapitalförbränning & Emission-risk", kategori: "RISK", variabel: "V19", kapitel: 13, quiz: 24, minuter: 67, niva: "Avancerad" },
  { slug: "v20-aterekop-egna-aktier", titel: "Återköp av egna aktier", kategori: "KAPITALSTRUKTUR", variabel: "V20", kapitel: 11, quiz: 16, minuter: 47, niva: "Intermediär" },
  { slug: "vagfundament-variablerna-som-tidsserier", titel: "Vågfundament — Variablerna som Tidsserier", kategori: "EKOSYSTEM", variabel: undefined, kapitel: 12, quiz: 36, minuter: 144, niva: "Alla" },
  { slug: "valuation-measuring-managing", titel: "Valuation — McKinsey (Koller m.fl.): KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 16, quiz: 48, minuter: 175, niva: "Alla" },
  { slug: "value-investing-from-graham-to-buffett", titel: "Value Investing: From Graham to Buffett and Beyond — Greenwald: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 190, niva: "Alla" },
  { slug: "var-ekonomi", titel: "Vår ekonomi — Klas Eklund: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 190, niva: "Alla" },
  { slug: "vm-01-grahams-formel", titel: "Grahams formel", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 12, minuter: 22, niva: "Intermediär" },
  { slug: "vm-02-intrinsic-value", titel: "Intrinsic value", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 12, minuter: 18, niva: "Nybörjare" },
  { slug: "vm-03-multipelval", titel: "Multipel-val — när använda vilken", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 18, minuter: 22, niva: "Intermediär" },
  { slug: "vm-04-cyklisk-justering", titel: "Cyklisk justering — Shiller P/E", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 18, minuter: 24, niva: "Avancerad" },
  { slug: "vm-05-realoptioner", titel: "Realoptioner", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 12, minuter: 28, niva: "Avancerad" },
  { slug: "vm-06-dividend-discount-model-ddm", titel: "Dividend Discount Model (DDM)", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 18, minuter: 22, niva: "Intermediär" },
  { slug: "vm-07-free-cash-flow-yield", titel: "Free Cash Flow Yield", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 12, minuter: 20, niva: "Intermediär" },
  { slug: "vm-08-evsales", titel: "EV/Sales", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 18, minuter: 18, niva: "Intermediär" },
  { slug: "vm-09-pricetocashflow", titel: "Price-to-Cash-Flow", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 18, minuter: 20, niva: "Intermediär" },
  { slug: "vm-10-assetbased-valuation", titel: "Asset-based valuation", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 12, minuter: 24, niva: "Avancerad" },
  { slug: "vm-11-waccfallor", titel: "WACC-fällor", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 12, minuter: 22, niva: "Avancerad" },
  { slug: "vr-01-multipelgapet", titel: "Multipelgapet — varför lika bolag handlas olika", kategori: "VÄRDERING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "vr-02-normaliserade-multipler", titel: "Normaliserade multipler — räkna bort cykeln", kategori: "VÄRDERING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "vr-03-multipelns-anatomi", titel: "Multipelns anatomi — vad ett värderingstal innehåller", kategori: "VÄRDERING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "vr-04-avkastningens-tre-kallor", titel: "Avkastningens tre källor — vinsttillväxt, utdelning och multipelns resa: redovisningen av var avkastningen kom ifrån", kategori: "VÄRDERING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "vr-05-pris-och-varde", titel: "Pris och värde — aktiens två tal och första jämförelsen", kategori: "VÄRDERING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Nybörjare" },
  { slug: "vr-06-jamforelsebolagen", titel: "Jämförelsebolagen — urvalet bakom varje multipel", kategori: "VÄRDERING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "vr-07-terminalvardet", titel: "Terminalvärdet — DCF:s andra halva: det som händer efter prognosisperioden", kategori: "VÄRDERING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },
  { slug: "vr-08-tobins-q", titel: "Tobins Q — marknadsvärdet möter återanskaffningspriset", kategori: "VÄRDERING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "vr-09-konglomeratrabatten", titel: "Konglomeratrabatten — när helheten är värd mindre än delarna", kategori: "VÄRDERING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },
  { slug: "way-of-the-turtle", titel: "Way of the Turtle — Faith: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 168, niva: "Alla" },
  { slug: "what-works-on-wall-street", titel: "What Works on Wall Street — O'Shaughnessy: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 13, quiz: 39, minuter: 130, niva: "Alla" },
  { slug: "when-genius-failed", titel: "When Genius Failed — Lowenstein: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "winning-the-losers-game", titel: "Winning the Loser's Game — Ellis: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 15, quiz: 45, minuter: 180, niva: "Alla" },
  { slug: "you-can-be-a-stock-market-genius", titel: "You Can Be a Stock Market Genius — Greenblatt: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 140, niva: "Alla" },
  { slug: "your-money-and-your-brain", titel: "Your Money and Your Brain — Zweig: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 168, niva: "Alla" },
  { slug: "zero-to-one", titel: "Zero to One — Peter Thiel: KOMPLETT", kategori: "BOKMASTER", variabel: undefined, kapitel: 14, quiz: 42, minuter: 184, niva: "Alla" },
];

// ── Uppslag ─────────────────────────────────────────────────────────────────

/** Hitta en kurs exakt på slug. */
export function hittaKurs(register: RegisterRad[], slug: string): RegisterRad | undefined {
  return register.find((r) => r.slug === slug);
}

/**
 * Hitta AKM1:s variabelkurs — "v9", "V9", "v09", "V09" → V09-raden.
 * Koden normaliseras till tvåsiffrigt "VNN" (deterministiskt, inga gissningar).
 */
export function hittaVariabel(register: RegisterRad[], kod: string): RegisterRad | undefined {
  const m = kod.trim().match(/^v\s?0?(\d{1,2})$/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  if (n < 1 || n > 20) return undefined;
  const kanon = `V${String(n).padStart(2, "0")}`;
  return register.find((r) => r.variabel === kanon);
}

/** AKM1:s variabelkurser V01–V20 i ordning (läroplanens spår). */
export function variabelKurser(register: RegisterRad[]): RegisterRad[] {
  return register
    .filter((r) => r.variabel)
    .sort((a, b) => (a.variabel! < b.variabel! ? -1 : a.variabel! > b.variabel! ? 1 : 0));
}

/**
 * Registerns totalsiffror — interpoleras i mentorns svar (siffror.ts-principen:
 * aldrig hårdkoda tal i copy). Allt räknas ur registret vid anrop.
 */
export function registerTal(register: RegisterRad[]): { kurser: number; quiz: number; bokmaster: number } {
  return {
    kurser: register.length,
    quiz: register.reduce((s, r) => s + r.quiz, 0),
    bokmaster: register.filter((r) => r.kategori === "BOKMASTER").length,
  };
}
