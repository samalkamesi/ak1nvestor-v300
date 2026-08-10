/**
 * Course linking helpers — enables harmony between analyses and courses.
 *
 * Maps AKM1 variable IDs (V01-V20) and AK1TS concepts to deep course slugs.
 * Used by StockAnalysisView, Labbet, Aktier, and UTBILDNING to link
 * analysis concepts directly to their deep courses.
 */

import { allCourseSlugs } from "./deep-courses-data";

/** Map AKM1 variable ID (V01-V20) → deep course slug */
export const AKM1_TO_SLUG: Record<string, string> = {
  V01: "v01-forsaljningstillvaxt",
  V02: "v02-arr-tillvaxt",
  V03: "v03-intaktsdiversifiering",
  V04: "v04-ps",
  V05: "v05-pb",
  V06: "v06-ev-ebitda",
  V07: "v07-bruttomarginal",
  V08: "v08-ebitda-marginal",
  V09: "v09-roe",
  V10: "v10-skuldsattningsgrad",
  V11: "v11-likviditet",
  V12: "v12-intaktsstabilitet",
  V13: "v13-patent-ip",
  V14: "v14-varumarke",
  V15: "v15-natverkseffekter",
  V16: "v16-produktlanseringar",
  V17: "v17-avtal-partnerskap",
  V18: "v18-regulatoriska",
  V19: "v19-kapitalforbranning",
  V20: "v20-aterekop-egna-aktier",
};

/** Map AK1TS wave theory → deep course slug */
export const AK1TS_TO_SLUG: Record<string, string> = {
  ELLIOTT: "ts-01-elliott-wave",
  ELLIOTT_KORREKTION: "ts-02-elliott-wave",
  FIBONACCI_RET: "ts-03-fibonacciretracements",
  FIBONACCI_EXT: "ts-04-fibonacciextensions",
  GANN_VINKLAR: "ts-05-gannvinklar",
  GANN_CYKLER: "ts-06-ganncyklar",
  LUCAS: "ts-07-lucastalserie",
  VOLYM: "ts-08-volymanalys",
  VOLYM_PROFILER: "ts-09-volymprofiler",
  AK1TS_MATRIS: "ts-10-ak1ts-25cellers-matris",
};

/** Map common financial concepts → deep course slug */
export const CONCEPT_TO_SLUG: Record<string, string> = {
  // Bokföring
  BOKFORING: "km-001-bokforingens-grunder",
  FORVALTNINGSBERATTELSE: "km-002-forvaltningsberattelsen",
  KASSAFLODE: "km-003-kassaflodesanalysen",
  NOTER: "km-004-noter",
  EGET_KAPITAL: "km-005-eget-kapital-utdelningar",
  KVARTALSRAPPORT: "km-006-kvartalsrapporten",
  // Värdering
  DCF: "km-007-dcf",
  WACC: "km-008-wacc",
  PE: "km-009-pe",
  EV_EBIT: "km-010-evebit",
  RELATIV_VARDERING: "km-011-relativ-vardering",
  SOTP: "km-012-sum-of-the-parts-sotp",
  // Risk
  VOLATILITET: "km-013-volatilitet-standardavvikelse",
  KORRELATION: "km-014-korrelation-diversifiering",
  BETA: "km-015-beta-capm",
  SHARPE: "km-016-sharpe-kvot",
  KELLY: "km-017-position-sizing-kelly-kriteriet",
  // Beteende
  FORLUSTAVERSION: "km-018-forlustaversion",
  BEKRAFTELSEFALLA: "km-019-bekraftelsefalla",
  ANKAREFFEKT: "km-020-ankareffekt",
  // Skatt
  BOLAGSSKATT: "km-049-bolagsskatt-206",
  UTDelningsSKATT: "km-050-utdelningsskatt-30",
  ISK: "km-052-isk",
  // Sectors
  TECH_SEKTOR: "km-038-techsektorn",
  PHARMA_SEKTOR: "km-039-pharmasektorn",
  BANK_SEKTOR: "km-040-banksektorn",
  INDUSTRI_SEKTOR: "km-041-industrisektorn",
  // Makro
  RANTA: "km-054-ranta",
  INFLATION: "km-055-inflation",
  CENTRALBANK: "km-056-centralbanker",
  KONJUNKTUR: "km-057-konjunkturcykler",
  // Options
  OPTIONS: "km-059-optionsgrunder",
  COVERED_CALLS: "km-060-covered-calls",
  // Utdelning
  DIREKTAVKASTNING: "km-063-direktavkastning",
  UTDelningsTILLVAXT: "km-064-utdelningstillvaxt",
  // Investmentbolag
  INVESTMENTBOLAG: "km-067-investmentbolag",
  WALLBERG: "km-068-wallenbergsfaren",
  // Portfölj
  PORTFOLJ: "pf-01-portfoljbyggande",
  POSITION_SIZING: "pf-02-position-sizing",
  DIVERSIFIERING: "pf-03-diversifiering",
  REBALANSERING: "pf-04-rebalansering",
};

/** Check if a slug exists in the course catalog */
export function isValidSlug(slug: string): boolean {
  return allCourseSlugs.includes(slug);
}

/** Get slug for an AKM1 variable ID, or null if not found */
export function slugForAkm1(varId: string): string | null {
  const slug = AKM1_TO_SLUG[varId.toUpperCase()];
  return slug && isValidSlug(slug) ? slug : null;
}

/** Get slug for a concept key, or null if not found */
export function slugForConcept(key: string): string | null {
  const slug = CONCEPT_TO_SLUG[key.toUpperCase()];
  return slug && isValidSlug(slug) ? slug : null;
}

/**
 * Given an analysis ticker + AKM1 indicators, recommend 5 most relevant
 * deep courses based on the indicators' signals.
 */
export function recommendCourses(
  indicators: Record<string, { score: number; signal: string; name: string }>,
  sector?: string
): { slug: string; title: string; reason: string }[] {
  const recommendations: { slug: string; title: string; reason: string }[] = [];
  const seen = new Set<string>();

  // 1. Always recommend the AK1TS matrix course (core methodology)
  const ak1tsSlug = AK1TS_TO_SLUG.AK1TS_MATRIS;
  if (ak1tsSlug && isValidSlug(ak1tsSlug) && !seen.has(ak1tsSlug)) {
    recommendations.push({
      slug: ak1tsSlug,
      title: "AK1TS 25-cellers matris",
      reason: "Förstå våganalysen bakom rekommendationen",
    });
    seen.add(ak1tsSlug);
  }

  // 2. Recommend courses for the weakest indicators (score ≤ 2)
  const sorted = Object.entries(indicators).sort((a, b) => a[1].score - b[1].score);
  for (const [varId, ind] of sorted) {
    if (recommendations.length >= 5) break;
    if (ind.score <= 2) {
      const slug = slugForAkm1(varId);
      if (slug && !seen.has(slug)) {
        recommendations.push({
          slug,
          title: ind.name,
          reason: `Din svagaste variabel (${varId}, poäng ${ind.score}/5)`,
        });
        seen.add(slug);
      }
    }
  }

  // 3. Recommend courses for the strongest indicators (score ≥ 4)
  for (const [varId, ind] of sorted.reverse()) {
    if (recommendations.length >= 5) break;
    if (ind.score >= 4) {
      const slug = slugForAkm1(varId);
      if (slug && !seen.has(slug)) {
        recommendations.push({
          slug,
          title: ind.name,
          reason: `Din starkaste variabel (${varId}, poäng ${ind.score}/5)`,
        });
        seen.add(slug);
      }
    }
  }

  // 4. Fill with sector courses if room
  if (recommendations.length < 5 && sector) {
    const sectorLower = sector.toLowerCase();
    const sectorMap: Record<string, string> = {
      "informationsteknologi": TECH_SEKTOR_SLUG,
      "biometri": TECH_SEKTOR_SLUG,
      "programvara": TECH_SEKTOR_SLUG,
      "läkemedel": PHARMA_SEKTOR_SLUG,
      "pharma": PHARMA_SEKTOR_SLUG,
      "bank": BANK_SEKTOR_SLUG,
      "finans": BANK_SEKTOR_SLUG,
      "industri": INDUSTRI_SEKTOR_SLUG,
      "tillverkning": INDUSTRI_SEKTOR_SLUG,
    };
    for (const [key, slug] of Object.entries(sectorMap)) {
      if (sectorLower.includes(key) && isValidSlug(slug) && !seen.has(slug)) {
        recommendations.push({
          slug,
          title: slug.split("-").slice(1).join(" ").replace(/^\w/, (c) => c.toUpperCase()),
          reason: `Sektorkurs för ${sector}`,
        });
        seen.add(slug);
        break;
      }
    }
  }

  return recommendations.slice(0, 5);
}

const TECH_SEKTOR_SLUG = "km-038-techsektorn";
const PHARMA_SEKTOR_SLUG = "km-039-pharmasektorn";
const BANK_SEKTOR_SLUG = "km-040-banksektorn";
const INDUSTRI_SEKTOR_SLUG = "km-041-industrisektorn";

/**
 * Get related courses for a given AKM1 variable ID — used by Labbet cases
 * and UTBILDNING läroplan to link concepts to deep courses.
 */
export function relatedCoursesForVariable(varId: string): string[] {
  const slug = slugForAkm1(varId);
  return slug ? [slug] : [];
}

/**
 * Get the AK1TS course slugs for the 5 wave theories.
 */
export const AK1TS_COURSE_SLUGS = [
  AK1TS_TO_SLUG.ELLIOTT,
  AK1TS_TO_SLUG.FIBONACCI_RET,
  AK1TS_TO_SLUG.GANN_VINKLAR,
  AK1TS_TO_SLUG.LUCAS,
  AK1TS_TO_SLUG.VOLYM,
];
