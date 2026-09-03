/**
 * FAS 2-ÅTKOMST — access-motorn för kurser som kräver Fas 2-medlemskap.
 *
 * Modell (samma integritetsvänliga local-modell som member-local.ts):
 *  - `ak1a-member` i localStorage kan bära `member_type` ("free" | "premium"
 *    | "pro" från Supabase) — premium/pro motsvarar Fas 2/3-medlemskap.
 *  - `ak1a-fas2-override` = "true" → admin-upplåsning lokalt (granskning/test).
 *
 * Pedagogik (se pedagogik.ts): Fas 2 är en INBJUDAN vidare — aldrig ett stopp.
 * Fas 1 är hela gratis-biblioteket, för alltid. Gaten ska tipsa, inte stänga.
 */

/** Slugs som kräver Fas 2-åtkomst. */
export const FAS2_KURSER: Set<string> = new Set([
  // Ekosystem-flaggskepp
  "ak1ts-vaglarans-hierarki",
  "akm1-den-kontroversiella-modellen", // AKM1-djupet = Fas 2 (grunderna V01-V20 är gratis)
  "vagfundament-variablerna-som-tidsserier",
  "konfluens-varde-moter-vagor",
  // Avancerad teknisk analys BOKMASTER
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
  "trading-in-the-zone",
  "the-hour-between-dog-and-wolf",
  "market-mind-games",
  "your-money-and-your-brain",
]);

/** member_type-värden som bär Fas 2 (utbildning) eller Fas 3. */
const FAS2_TYPER: ReadonlySet<string> = new Set(["fas2", "fas3", "premium", "pro"]);

const MEMBER_KEY = "ak1a-member";
const STORE_KEY = "ak1a-store"; // zustand-persist — isAdmin lever här
const OVERRIDE_KEY = "ak1a-fas2-override";

/** Kräver denna kurs Fas 2? (Rent Set-uppslag — SSR-säker, inga biverkningar.) */
export function kraverFas2(slug: string): boolean {
  return FAS2_KURSER.has(slug);
}

/**
 * Har eleven Fas 2-åtkomst? Läser `ak1a-member` i localStorage och kontrollerar
 * member_type; admin-override (`ak1a-fas2-override=true`) öppnar också porten.
 * SSR-säker: false på servern — avgörs efter montering i klienten.
 */
export function harFas2Access(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(OVERRIDE_KEY) === "true") return true;
    const rå = localStorage.getItem(MEMBER_KEY);
    if (!rå) return false;
    const m = JSON.parse(rå) as { member_type?: unknown };
    return FAS2_TYPER.has(String(m?.member_type ?? "").toLowerCase());
  } catch {
    return false;
  }
}

/** Admin-läge? (isAdmin i localStorage — sparat av zustand-storen under ak1a-store.) */
export function arAdmin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const rå = localStorage.getItem(STORE_KEY);
    if (!rå) return false;
    const s = JSON.parse(rå) as { state?: { isAdmin?: unknown } };
    return s?.state?.isAdmin === true;
  } catch {
    return false;
  }
}

/** Admin-upplåsning: sätter override-flaggan så Fas 2-kurserna öppnas lokalt. */
export function aktiveraFas2Override(): void {
  try {
    localStorage.setItem(OVERRIDE_KEY, "true");
  } catch {}
}

// ── Låstext per kurskategori ────────────────────────────────────────────────
// ALDRIG "du får inte" — ALLTID "välkommen vidare när du är redo".

/** Flaggskeppen där ekosystemets delar förenas till helhet. */
const EKOSYSTEM_SLUGS: ReadonlySet<string> = new Set([
  "ak1ts-vaglarans-hierarki",
  "akm1-den-kontroversiella-modellen",
  "vagfundament-variablerna-som-tidsserier",
  "konfluens-varde-moter-vagor",
]);

/** Mästarverken om trader-psykologi och neuroekonomi. */
const PSYKOLOGI_SLUGS: ReadonlySet<string> = new Set([
  "trading-in-the-zone",
  "the-hour-between-dog-and-wolf",
  "market-mind-games",
  "your-money-and-your-brain",
]);

/** Anpassad låstext per kurskategori — förklarar VARFÖR detta är nästa analytiska fas. */
export function fas2LockeradText(slug: string): string {
  if (EKOSYSTEM_SLUGS.has(slug)) {
    return (
      "Här förenas AKM1:s fundamentalvariabler med AK1TS:s deterministiska vågor — " +
      "det är här eleven går från att förstå delarna till att analysera helheten. " +
      "Fas 2 är resan där variabler blir tidsserier och tidsserier blir en vågrörelse: " +
      "värde möter vågor, och konfluens blir ditt analytiska språk."
    );
  }
  if (PSYKOLOGI_SLUGS.has(slug)) {
    return (
      "Tekniken lär du dig i Fas 1 — men marknaden utkämpas i sinnet. " +
      "Dessa mästarverk om trader-psykologi och neuroekonomi är Fas 2-materialet där " +
      "tålamod, risk och beslutsandan smids till din verkliga kant: att stå kvar när andra tvekar."
    );
  }
  // Standard: bokmaster i avancerad teknisk analys
  return (
    "Detta är kanonlitteraturen i teknisk analys — Elliott, Murphy, Nison, Bollinger " +
    "och de stora trendföljarna. I Fas 2 läses de inte som historia utan som verktyg: " +
    "kapitel för kapitel, med grundaren vid din sida, tills mönstren blir ditt andra språk."
  );
}
