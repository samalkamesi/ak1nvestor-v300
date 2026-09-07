/**
 * FAS-ÅTKOMST — access-motorn för kurser som kräver Fas 2- eller Fas 3-medlemskap.
 *
 * MODELL (användarens direktiv 2026-09-03 — Fas-inversionen):
 *  - FAS 1 (gratis, för alltid): hela grundbiblioteket — fundamental grunder,
 *    V01–V20, bokkanonens grundnivåer.
 *  - FAS 2 (engångspris — se data/portfolj-system/priser.json + PRISER.fas2EnGang):
 *    DEN SNABBA FUNDAMENTALA VÄGEN till oberoende analytiker.
 *    Enbart avancerad fundamental analys (värdering, bokslutsanalys, redovisning,
 *    penningströmmar) + chansen att bli representant för AK1nvestor.
 *    INGEN teknisk analys, INGA vågor, INGET ekosystem — det är Fas 3.
 *  - FAS 3 (engångspris + ev. månadsprenumeration för ekosystemet efter
 *    utbildning — se priser.json + PRISER.fas3EnGang):
 *    Det dynamiska ekosystemet — fundamentalanalys som rör sig: AKM1 × AK1TS,
 *    Vågfundamentet, Konfluensradarn, Portföljens vågor, teknisk analys på
 *    mästarnivå, trading-psykologi, dashboard + AI-koppling + rapporter, och
 *    rätt till alla framtida utvecklingar.
 *
 * Integritetsvänlig local-modell (samma som member-local.ts):
 *  - `ak1a-member` i localStorage bär `member_type` ("free"|"fas2"|"fas3"|
 *    "premium"|"pro") — fas3/premium/pro öppnar BÅDA faserna (Fas 3 bygger på Fas 2).
 *  - `ak1a-fas2-override` = "true" → admin-upplåsning lokalt (granskning/test).
 *
 * Pedagogik (se pedagogik.ts): en Fas är en INBJUDAN vidare — aldrig ett stopp.
 * Gaten ska tipsa, inte stänga.
 */

/** Fas 2: avancerad FUNDAMENTAL analys — den snabba vägen till oberoende analytiker. */
export const FAS2_KURSER: Set<string> = new Set([
  // Värderingsbiblorna
  "security-analysis", // Graham & Dodd — nivå 5
  "investment-valuation", // Damodaran
  "valuation-measuring-managing", // McKinsey/Koller
  "the-theory-of-investment-value", // Williams — DCF:s födelse
  "expectations-investing", // Rappaport & Mauboussin
  // Bokslut & redovisning på analytikernivå
  "financial-statement-analysis-and-security-valuation", // Penman
  "creative-cash-flow-reporting", // Mulford & Comiskey
  "quality-of-earnings", // O'Glove
  "financial-shenanigans", // Schilit
  "interpretation-of-financial-statements", // Graham 1937
  // Företagsfinans & kapital
  "analysis-for-financial-management", // Higgins — nivå 4
  "principles-of-corporate-finance", // Brealey — nivå 5
  "distress-investing", // Whitman
  // Värdeinvesteringens mästarverk
  "margin-of-safety", // Klarman
  "value-investing-from-graham-to-buffett", // Greenwald
  "quantitative-value", // Gray & Carlisle
  "fooling-some-of-the-people", // Einhorn — kortsidans hantverk
  // Egen modell i superdjup
  "akm1-den-kontroversiella-modellen", // AKM1 V01–V20 på analysnivå
]);

/** Fas 3: det dynamiska ekosystemet — vågor, integration, mästare-TA, psykologi. */
export const FAS3_KURSER: Set<string> = new Set([
  // Ekosystem-flaggskeppen (fundamental blir dynamisk)
  "ak1ts-vaglarans-hierarki",
  "vagfundament-variablerna-som-tidsserier",
  "konfluens-varde-moter-vagor",
  // Teknisk analys på mästarnivå
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
  // Trading-psykologi & neuroekonomi
  "trading-in-the-zone",
  "the-hour-between-dog-and-wolf",
  "market-mind-games",
  "your-money-and-your-brain",
]);

/** member_type-värden: Fas 2 bärs av fas2+; Fas 3 av fas3+ (supermängd). */
const FAS2_TYPER: ReadonlySet<string> = new Set(["fas2", "fas3", "premium", "pro"]);
const FAS3_TYPER: ReadonlySet<string> = new Set(["fas3", "premium", "pro"]);

const MEMBER_KEY = "ak1a-member";
const STORE_KEY = "ak1a-store"; // zustand-persist — isAdmin lever här
const OVERRIDE_KEY = "ak1a-fas2-override";

/** Vilken fas kräver denna kurs? 0 = gratis (Fas 1), 2 eller 3. SSR-säkert. */
export function kraverFas(slug: string): 0 | 2 | 3 {
  if (FAS3_KURSER.has(slug)) return 3;
  if (FAS2_KURSER.has(slug)) return 2;
  return 0;
}

/** Kräver denna kurs Fas 2? (Rent Set-uppslag — SSR-säkert.) */
export function kraverFas2(slug: string): boolean {
  return FAS2_KURSER.has(slug);
}

/** Kräver denna kurs Fas 3? (Rent Set-uppslag — SSR-säkert.) */
export function kraverFas3(slug: string): boolean {
  return FAS3_KURSER.has(slug);
}

function lasMemberType(): string {
  if (typeof window === "undefined") return "";
  try {
    const rå = localStorage.getItem(MEMBER_KEY);
    if (!rå) return "";
    const m = JSON.parse(rå) as { member_type?: unknown };
    return String(m?.member_type ?? "").toLowerCase();
  } catch {
    return "";
  }
}

/** Har eleven Fas 2-åtkomst? (fas3/premium/pro öppnar också Fas 2.) SSR-säker. */
export function harFas2Access(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(OVERRIDE_KEY) === "true") return true;
    return FAS2_TYPER.has(lasMemberType());
  } catch {
    return false;
  }
}

/** Har eleven Fas 3-åtkomst? SSR-säker — avgörs efter montering i klienten. */
export function harFas3Access(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(OVERRIDE_KEY) === "true") return true;
    return FAS3_TYPER.has(lasMemberType());
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

/** Admin-upplåsning: sätter override-flaggan så båda faserna öppnas lokalt. */
export function aktiveraFas2Override(): void {
  try {
    localStorage.setItem(OVERRIDE_KEY, "true");
  } catch {}
}

// ── Låstext per kursgrupp ────────────────────────────────────────────────────
// ALDRIG "du får inte" — ALLTID "välkommen vidare när du är redo".

const FAS2_VARDERING = new Set([
  "security-analysis",
  "investment-valuation",
  "valuation-measuring-managing",
  "the-theory-of-investment-value",
  "expectations-investing",
]);
const FAS2_BOKSLUT = new Set([
  "financial-statement-analysis-and-security-valuation",
  "creative-cash-flow-reporting",
  "quality-of-earnings",
  "financial-shenanigans",
  "interpretation-of-financial-statements",
]);
const FAS2_FINANS = new Set([
  "analysis-for-financial-management",
  "principles-of-corporate-finance",
  "distress-investing",
]);

/** Fas 2-låstext per grupp — den fundamentala vägen till oberoende analytiker. */
export function fas2LockeradText(slug: string): string {
  if (FAS2_VARDERING.has(slug)) {
    return (
      "Värderingsbiblorna — Graham & Dodd, Damodaran, McKinsey, Williams. " +
      "Fas 2 är den snabba fundamentala vägen till oberoende analytiker: här lär du dig " +
      "väga ett bolag i handen, från bokslut till värde, tills siffrorna blir ett omdöme du kan försvara."
    );
  }
  if (FAS2_BOKSLUT.has(slug)) {
    return (
      "Bokslutets hantverk — Penman, O'Glove, Schilit. Fas 2 handlar om att läsa " +
      "redovisningen som en analytiker: hitta kvaliteten i vinsten, genomskåda kreativ " +
      "kassaflödesredovisning, och veta skillnaden på en rapport och en berättelse."
    );
  }
  if (FAS2_FINANS.has(slug)) {
    return (
      "Företagsfinansen på MBA-nivå — Higgins, Brealey, Whitman. Fas 2 ger dig " +
      "ränta-på-ränta, kapitalstruktur och kassaflödesmatematiken som gör att du " +
      "räknar som en analytiker — inte som en gissare."
    );
  }
  // Standard Fas 2: värdeinvesteringens mästarverk + AKM1-djupet
  return (
    "Fas 2 är den snabba fundamentala vägen till oberoende analytiker — och chansen " +
    "att få representera AK1nvestor med kvalitet. Här läses mästarverken kapitel för " +
    "kapitel, med grundaren vid din sida, tills ditt omdöme är ditt eget."
  );
}

/** Fas 3-låstext per grupp — det dynamiska ekosystemet. */
export function fas3LockeradText(slug: string): string {
  if (slug === "ak1ts-vaglarans-hierarki" || slug === "vagfundament-variablerna-som-tidsserier" || slug === "konfluens-varde-moter-vagor") {
    return (
      "Fas 3 är stunden då fundamentalanalysen slutar vara statisk: varje AKM1-variabel " +
      "rör sig, blir tidsserie och våg. Här förenas AKM1 med AK1TS — värde möter vågor — " +
      "och konfluens blir ditt analytiska språk. Du får också rätt till alla framtida " +
      "utvecklingar: analys av aktier och portföljer, dashboarden och AI-kopplingen."
    );
  }
  if (
    slug === "trading-in-the-zone" ||
    slug === "the-hour-between-dog-and-wolf" ||
    slug === "market-mind-games" ||
    slug === "your-money-and-your-brain"
  ) {
    return (
      "Fasenet smids i Fas 3: marknaden utkämpas i sinnet, och dessa mästarverk om " +
      "trader-psykologi och neuroekonomi hör hemma där ekosystemet lever — daglig " +
      "mätning, dagligt beteende, tålamod när vågorna kräver det."
    );
  }
  // Standard Fas 3: teknisk analys på mästarnivå
  return (
    "Teknisk analys på mästarnivå — Elliott, Murphy, Nison, Bollinger och de stora " +
    "trendföljarna. I Fas 3 läses de inte som historia utan som instrument i det " +
    "dynamiska ekosystemet: vågor som möter fundamentalt värde, kapitel för kapitel."
  );
}
