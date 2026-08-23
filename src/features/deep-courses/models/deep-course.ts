/** Type definitions for deep courses. Data is loaded via /api/kurs/[slug]. */

export interface DeepChapterBlock {
  type: "text" | "insight" | "definition";
  content: string;
}

export interface DeepChapter {
  num: number;
  minutes: number;
  title: string;
  intro: string;
  blocks: DeepChapterBlock[];
}

export interface DeepCourse {
  slug: string;
  variableId: string;
  category: string;
  weight: string;
  chapterCount: number;
  totalMinutes: number;
  title: string;
  summary: string;
  minutes: number;
  xp: number;
  level: string;
  learn: string;
  why: string;
  chapters_list: { num: number; title: string; minutes: number }[];
  history?: {
    origin: string;
    evolution: string;
    modern: string;
  };
  chapters: DeepChapter[];
}

/** Map slug → variableId (e.g. "v01-forsaljningstillvaxt" → "V01") */
export function slugToVariableId(slug: string): string {
  const match = slug.match(/^v(\d+)/);
  return match ? `V${match[1].padStart(2, "0")}` : slug.toUpperCase();
}

/** All 20 course slugs (lightweight — no data import). */
export const allCourseSlugs = [
  "v01-forsaljningstillvaxt",
  "v02-arr-tillvaxt",
  "v03-intaktsdiversifiering",
  "v04-ps",
  "v05-pb",
  "v06-ev-ebitda",
  "v07-bruttomarginal",
  "v08-ebitda-marginal",
  "v09-roe",
  "v10-skuldsattningsgrad",
  "v11-likviditet",
  "v12-intaktsstabilitet",
  "v13-patent-ip",
  "v14-varumarke",
  "v15-natverkseffekter",
  "v16-produktlanseringar",
  "v17-avtal-partnerskap",
  "v18-regulatoriska",
  "v19-kapitalforbranning",
  "v20-aterekop-egna-aktier",
  "km-001-bokforingens-grunder",
  "km-002-forvaltningsberattelsen",
  "km-003-kassaflodesanalysen",
  "km-004-noter",
  "km-005-eget-kapital-utdelningar",
  "km-006-kvartalsrapporten",
  "km-007-dcf",
  "km-008-wacc",
  "km-009-pe",
  "km-010-evebit",
  "km-011-relativ-vardering",
  "km-012-sum-of-the-parts-sotp",
  "km-013-volatilitet-standardavvikelse",
  "km-014-korrelation-diversifiering",
  "km-015-beta-capm",
  "km-016-sharpe-kvot",
  "km-017-position-sizing-kelly-kriteriet",
  "km-018-forlustaversion",
  "km-019-bekraftelsefalla",
  "km-020-ankareffekt",
  "km-021-avskrivningsprinciper",
  "km-022-goodwill-och-immateriella-tillgangar",
  "km-023-leasing",
  "km-024-segmentrapportering",
  "km-025-pensionsataganden",
  "km-026-relaterade-parter",
  "km-027-pegratio",
  "km-028-reverse-dcf",
  "km-029-scenarioanalys",
  "km-030-margin-of-safety",
  "km-031-var",
  "km-032-stresstesting-portfoljen",
  "km-033-tailrisk-hedging",
  "km-034-drawdownanalys",
  "km-035-flockbeteende",
  "km-036-overconfidence",
  "km-037-disposition-effect",
  "km-038-techsektorn",
  "km-039-pharmasektorn",
  "km-040-banksektorn",
  "km-041-industrisektorn",
  "km-042-fastighetsektorn",
  "km-043-energisektorn",
  "km-044-konsumentsektorn",
  "km-045-materialsektorn",
  "km-046-telekomsektorn",
  "km-047-utilitysektorn",
  "km-048-halsovardsektorn",
  "km-049-bolagsskatt-206",
  "km-050-utdelningsskatt-30",
  "km-051-kapitalvinstskatt",
  "km-052-isk",
  "km-053-312reglerna",
  "km-054-ranta",
  "km-055-inflation",
  "km-056-centralbanker",
  "km-057-konjunkturcykler",
  "km-058-valutor",
  "km-059-optionsgrunder",
  "km-060-covered-calls",
  "km-061-protective-puts",
  "km-062-blackscholes",
  "km-063-direktavkastning",
  "km-064-utdelningstillvaxt",
  "km-065-dogs-of-the-dow",
  "km-066-utdelning-vs-aterkop",
  "km-067-investmentbolag",
  "km-068-wallenbergsfaren",
  "km-069-orderbok-och-prissattning",
  "km-070-natmaklare-i-sverige",
  "ts-01-elliott-wave",
  "ts-02-elliott-wave",
  "ts-03-fibonacciretracements",
  "ts-04-fibonacciextensions",
  "ts-05-gannvinklar",
  "ts-06-ganncyklar",
  "ts-07-lucastalserie",
  "ts-08-volymanalys",
  "ts-09-volymprofiler",
  "ts-10-ak1ts-25cellers-matris",
  "ts-11-candlestickmonster",
  "ts-12-moving-averages",
  "ts-13-rsi",
  "ts-14-macd",
  "ts-15-bollinger-bands",
  "ts-16-stod-och-motstand",
  "ts-17-trendlinjer",
  "ts-18-chartmonster",
  "ts-19-fibonaccitidszoner",
  "ts-20-harmoniska-monster",
  "pc-01-case-atlas-copco",
  "pc-02-case-astrazeneca",
  "pc-03-case-swedbank",
  "pc-04-case-investor-ab",
  "pc-05-case-volvo-ab",
  "pc-06-case-hm",
  "pc-07-case-sinch",
  "pc-08-case-precise-biometrics",
  "pc-09-case-novo-nordisk",
  "pc-10-case-ericsson",
  "rk-01-kapitalforbranning",
  "rk-02-emissionrisk",
  "rk-03-skuldfalla",
  "rk-04-likviditetskris",
  "rk-05-cykelrisk",
  "rk-06-regulatorisk-risk",
  "rk-07-valutarisk",
  "rk-08-ranterisk",
  "rk-09-koncentrationsrisk",
  "rk-10-korrelationsrisk",
  "rk-11-bedrageririsk",
  "rk-12-black-swanrisk",
  "pf-01-portfoljbyggande",
  "pf-02-position-sizing",
  "pf-03-diversifiering",
  "pf-04-rebalansering",
  "pf-05-utdelningsstrategi",
  "pf-06-aterinvestering",
  "pf-07-krishantering",
  "pf-08-isk-vs-aktiedepa",
  "se-01-saassektorn",
  "se-02-halvledarsektorn",
  "se-03-forsvarssektorn",
  "se-04-logistiksektorn",
  "se-05-lyxsektorn",
  "sj-01-utlandsk-kallskatt",
  "sj-02-cryptobeskattning",
  "sj-03-bolagsstamma-och-rostratt",
  "bf-01-tillganglighetsfalla",
  "bf-02-sunk-cost",
  "bf-03-mental-accounting",
  "bf-04-investera-som-en-robot",
  "mk-01-bnp-och-tillvaxt",
  "mk-02-arbetsloshet",
  "mk-03-handelsbalans",
  "mk-04-statsobligationer",
  "mk-05-geopolitik",
  "vm-01-grahams-formel",
  "vm-02-intrinsic-value",
  "ud-01-payout-ratio",
  "ud-02-aterinvestering",
  "ts-21-fibonaccikluster",
  "ts-22-elliott-wave",
  "ts-23-volume-spread-analysis-vsa",
  "ts-24-order-flow",
  "ts-25-market-profile",
  "pc-11-case-boliden",
  "pc-12-case-skf",
  "pc-13-case-ssab",
  "pc-14-case-electrolux",
  "pc-15-case-kambi",
  "pc-16-case-beijer-ref",
  "pc-17-case-sandvik",
  "pc-18-case-oresund",
  "pc-19-case-hoganas",
  "pc-20-case-essity",
  "rk-13-gdpr-och-datarisk",
  "rk-14-esgrisk",
  "rk-15-cykelrisk",
  "pf-09-taxloss-harvesting",
  "pf-10-longshort",
  "pf-11-koncentrerad-portfolj",
  "pf-12-arsrapportering",
  "se-06-finanssektorn",
  "se-07-detailhandel",
  "se-08-media",
  "se-09-bil",
  "se-10-flyg",
  "se-11-krypto",
  "se-12-spel",
  "se-13-utbildning",
  "se-14-livsmedel",
  "se-15-logistik",
  "sj-04-optionsbeskattning",
  "sj-05-kapitalforsakring-vs-isk",
  "bf-05-ankareffekt",
  "bf-06-tillganglighetsheuristik",
  "bf-07-framstegseffekt",
  "bf-08-priming",
  "bf-09-haloeffekt",
  "bf-10-dunningkruger",
  "mk-06-penningpolitik",
  "mk-07-fiscal-politik",
  "mk-08-omvand-yield-curve",
  "mk-09-deflation-vs-inflation",
  "mk-10-oljepris",
  "vm-03-multipelval",
  "vm-04-cyklisk-justering",
  "vm-05-realoptioner",
  "vm-06-dividend-discount-model-ddm",
  "vm-07-free-cash-flow-yield",
  "vm-08-evsales",
  "vm-09-pricetocashflow",
  "vm-10-assetbased-valuation",
  "ud-03-dividend-aristocrats",
  "ud-04-utdelningsfallor",
  "ud-05-drip",
  "ud-06-svenska-utdelningsaktier",
  "ud-07-utdelningskalender",
  "ud-08-speciella-utdelningar",
  "pf-13-esgportfolj",
  "pf-14-pensionssparande",
  "bf-11-kognitiv-bias",
  "mk-11-kinaekonomin",
  "vm-11-waccfallor"
];

/** Check if a slug is a valid deep course slug. */
export function isDeepCourseSlug(slug: string): boolean {
  return allCourseSlugs.includes(slug);
}

/** Fetch a deep course by slug from the API. */
export async function fetchDeepCourse(slug: string): Promise<DeepCourse | null> {
  try {
    const res = await fetch(`/api/kurs/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    return { ...data, variableId: slugToVariableId(slug) };
  } catch {
    return null;
  }
}
