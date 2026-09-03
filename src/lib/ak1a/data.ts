import type { Level } from "@/lib/ak1a-store";

/** Top-level navigation sections. */
export const NAV_SECTIONS = [
  { id: "hem", label: "HEM" },
  { id: "prec", label: "PREC-ANALYS" },
  { id: "analyser", label: "ANALYSER" },
  { id: "aktier", label: "AKTIER" },
  { id: "kurser", label: "KURSER" },
  { id: "labb", label: "LABB" },
  { id: "om-oss", label: "OM OSS" },
  { id: "portal", label: "PORTAL" },
] as const;

/** Footer "MER" navigation list. */
export const FOOTER_NAV = [
  { label: "Hem · Huvudsida", section: "hem" as const },
  { label: "PREC-analysen (alla sektioner)", section: "prec" as const },
  { label: "Alla analyser", section: "analyser" as const },
  { label: "Kurser (200+ moduler · 4 flikar)", section: "kurser" as const },
  { label: "Labb (case + faror + historia)", section: "labb" as const },
  { label: "Meta-system (organ + visioner)", section: "om-oss" as const },
  { label: "Utbildning & Medlemskap", section: "utbildning" as const },
  { label: "AKM1 Verktyg", section: "labb" as const },
  { label: "Webinarier", section: "kurser" as const },
  { label: "Logga in / Registrera", section: "portal" as const },
  { label: "Min portal · Portföljoptimering", section: "portal" as const },
  { label: "Om oss", section: "om-oss" as const },
];

export const LEVELS: { id: Level; label: string; subtitle: string }[] = [
  { id: "nyborjare", label: "Nybörjare", subtitle: "Första gången du läser en analys" },
  { id: "intermediar", label: "Intermediär", subtitle: "Du kan läsa nyckeltal" },
  { id: "avancerad", label: "Avancerad", subtitle: "Du bygger egna modeller" },
];

/** AKM1 — the 19 fundamental variables. */
export type Akm1Category =
  | "Tillväxt"
  | "Värdering"
  | "Lönsamhet"
  | "Stabilitet"
  | "Moat"
  | "Katalysator"
  | "Risk"
  | "Kapitalstruktur";

export interface Akm1Variable {
  id: string; // V01..V19
  num: number;
  name: string;
  category: Akm1Category;
  level: Level;
  weight: string; // e.g. "8%"
  minutes: number;
  tag: "Mätt";
  summary: string;
  formula?: string;
  scale?: string; // 1-5 scoring guide
}

export const AKM1_VARIABLES: Akm1Variable[] = [
  { id: "V01", num: 1, name: "Försäljningstillväxt", category: "Tillväxt", level: "nyborjare", weight: "8%", minutes: 15, tag: "Mätt", summary: "Omsättningstillväxt jämfört med föregående år — den viktigaste tillväxtindikatorn.", formula: "(Omsättning i år − Omsättning förra året) / Omsättning förra året", scale: "1 = negativ tillväxt · 3 = 5–15 % · 5 = >25 %" },
  { id: "V02", num: 2, name: "ARR-tillväxt (återkommande intäkter)", category: "Tillväxt", level: "intermediar", weight: "8%", minutes: 18, tag: "Mätt", summary: "Tillväxt i Annual Recurring Revenue — intäkter som kommer tillbaka varje år automatiskt (prenumerationer, licenser, serviceavtal).", formula: "(ARR nu − ARR förra perioden) / ARR förra perioden", scale: "1 = ARR minskar · 3 = 10–20 % · 5 = >40 %" },
  { id: "V03", num: 3, name: "Intäktsdiversifiering", category: "Tillväxt", level: "nyborjare", weight: "7%", minutes: 12, tag: "Mätt", summary: "Hur bred intäktsbasen är — beroende av en kund, en produkt, eller en marknad är riskfaktorer." },
  { id: "V04", num: 4, name: "P/S (Price-to-Sales)", category: "Värdering", level: "nyborjare", weight: "6%", minutes: 14, tag: "Mätt", summary: "Pris-till-omsättning. Hur mycket betalar du per krona försäljning? Enkel värdering för bolag som inte går med vinst.", formula: "Börsvärde / Omsättning", scale: "1 = >10x · 3 = 2–5x · 5 = <1x" },
  { id: "V05", num: 5, name: "P/B (Price-to-Book)", category: "Värdering", level: "nyborjare", weight: "6%", minutes: 12, tag: "Mätt", summary: "Pris-till-bokfört värde. Hur mycket betalar du per krona av bolagets nettoförmögenhet?", formula: "Börsvärde / Eget kapital", scale: "1 = >5x · 3 = 1–2x · 5 = <1x" },
  { id: "V06", num: 6, name: "EV/EBITDA", category: "Värdering", level: "intermediar", weight: "6%", minutes: 16, tag: "Mätt", summary: "Företagsvärde-till-EBITDA. Den mest kompletta värderingsmultiplen — justerar för skulder, kassa och kapitalstruktur.", formula: "EV / EBITDA", scale: "1 = >20x · 3 = 8–12x · 5 = <6x" },
  { id: "V07", num: 7, name: "Bruttomarginal", category: "Lönsamhet", level: "nyborjare", weight: "6%", minutes: 13, tag: "Mätt", summary: "Bruttovinst / omsättning. Hur mycket finns kvar efter att bolaget betalat för det sålda?", formula: "Bruttovinst / Omsättning", scale: "1 = <20 % · 3 = 40–60 % · 5 = >80 %" },
  { id: "V08", num: 8, name: "EBITDA-marginal", category: "Lönsamhet", level: "intermediar", weight: "6%", minutes: 14, tag: "Mätt", summary: "EBITDA / omsättning. Hur mycket finns kvar efter driftskostnader (men före ränta, skatt, avskrivningar)?", formula: "EBITDA / Omsättning", scale: "1 = <0 % · 3 = 10–20 % · 5 = >30 %" },
  { id: "V09", num: 9, name: "ROE (Return on Equity)", category: "Lönsamhet", level: "intermediar", weight: "6%", minutes: 15, tag: "Mätt", summary: "Avkastning på eget kapital. Hur mycket vinst skapar bolaget per krona eget kapital?", formula: "Resultat / Eget kapital", scale: "1 = <5 % · 3 = 12–18 % · 5 = >25 %" },
  { id: "V10", num: 10, name: "Skuldsättningsgrad", category: "Stabilitet", level: "nyborjare", weight: "5%", minutes: 12, tag: "Mätt", summary: "Hur mycket skuld bolaget har jämfört med eget kapital. Hög skuld = hög risk i kriser.", formula: "Räntebärande skulder / Eget kapital", scale: "1 = >150 % · 3 = 30–60 % · 5 = <10 %" },
  { id: "V11", num: 11, name: "Likviditet (Kvick)", category: "Stabilitet", level: "nyborjare", weight: "5%", minutes: 11, tag: "Mätt", summary: "Kan bolaget betala sina kortfristiga skulder? Kvickkvot = (omsättningstillgångar − varulager) / kortfristiga skulder.", formula: "(Omsättningstillgångar − Varulager) / Kortfristiga skulder", scale: "1 = <0,5 · 3 = 1–1,5 · 5 = >2" },
  { id: "V12", num: 12, name: "Intäktsstabilitet", category: "Stabilitet", level: "intermediar", weight: "5%", minutes: 13, tag: "Mätt", summary: "Hur förutsägbara intäkterna är. Återkommande (ARR) > kontrakt > engångs." },
  { id: "V13", num: 13, name: "Patent & Immateriella rättigheter", category: "Moat", level: "intermediar", weight: "6%", minutes: 14, tag: "Mätt", summary: "Patent, varumärken, licenser, know-how — juridiskt skydd mot konkurrenter." },
  { id: "V14", num: 14, name: "Varumärke & Kundlojalitet", category: "Moat", level: "intermediar", weight: "5%", minutes: 12, tag: "Mätt", summary: "Styrkan i varumärket — kan bolaget ta högre pris än konkurrenterna?" },
  { id: "V15", num: 15, name: "Nätverkseffekter", category: "Moat", level: "avancerad", weight: "6%", minutes: 14, tag: "Mätt", summary: "Betydelsen av bolaget ökar när fler använder det. (Meta, LinkedIn, betalningsnätverk.)" },
  { id: "V16", num: 16, name: "Produktlanseringar", category: "Katalysator", level: "intermediar", weight: "7%", minutes: 13, tag: "Mätt", summary: "Kommande produktlanseringar som kan driva intäkter — nya produkter, nya marknader, nya versioner." },
  { id: "V17", num: 17, name: "Avtal & Partnerskap", category: "Katalysator", level: "intermediar", weight: "7%", minutes: 12, tag: "Mätt", summary: "Stora kundavtal, partner-avtal, distribution-deals som kan driva intäkter." },
  { id: "V18", num: 18, name: "Regulatoriska katalysatorer", category: "Katalysator", level: "avancerad", weight: "7%", minutes: 12, tag: "Mätt", summary: "Kommande lagändringar, godkännanden, eller regleringar som påverkar bolaget positivt eller negativt." },
  { id: "V19", num: 19, name: "Kassatäckning — nyemissionsrisk", category: "Risk", level: "avancerad", weight: "KRITISK", minutes: 20, tag: "Mätt", summary: "Räcker kassan så bolaget slipper nyemission? Hur snabbt pengarna brinner — och risken för utspädning som gallrar dina aktier." },
  { id: "V20", num: 20, name: "Återköp av egna aktier", category: "Kapitalstruktur", level: "intermediar", weight: "5%", minutes: 20, tag: "Mätt", summary: "Buybacks = bolaget köper tillbaka egna aktier. Signal: ledning tror aktien är undervärderad. Minskar antal aktier → höjer EPS. AKM1:s 20:e indikator — tillagd i mega-projektet 2026.", formula: "Buyback-avkastning = (Aktier retirerade / Utestående före) × 100", scale: "1 = skuldfinansierade, över P/B 2 · 3 = skuldfinansierade, rätt pris · 5 = fritt kassaflöde, under P/B 1" },
];

export const AKM1_CATEGORIES: Akm1Category[] = [
  "Tillväxt",
  "Värdering",
  "Lönsamhet",
  "Stabilitet",
  "Moat",
  "Katalysator",
  "Risk",
  "Kapitalstruktur",
];

/** AK1TS wave-theory theories × horizons. */
export const WAVE_THEORIES = ["Elliott", "Fibonacci", "Gann", "Lucas", "Volym"] as const;
export const WAVE_HORIZONS = ["Mikro", "Kort", "Medellång", "Lång", "Mega"] as const;
export type WaveSignal = "bull" | "bear" | "neutral";

/** The 8 AK1A organs. */
export interface Organ {
  symbol: string; // greek letter
  name: string;
  verb: string; // "BESLUTAR"
  state: "AKTIV" | "DJUPARBETE" | "SYNKAR";
  active: boolean;
  role: string;
  responsibilities: string[];
  goal: string;
  goalKind: "metodmal";
  mantra: string;
  nextWish: string;
}

export const ORGANS: Organ[] = [
  {
    symbol: "Σ", name: "Strategi-organet", verb: "BESLUTAR", state: "AKTIV", active: true,
    role: "Strategisk ledning — sätter riktning, prioriterar visioner",
    responsibilities: ["Prioritering av visioner", "Resursallokering mellan divisioner", "Riskjustering av portfölj"],
    goal: "Prioritera varje vision mot AK1A:s kärna", goalKind: "metodmal",
    mantra: "Riktning före hastighet.",
    nextWish: "En prioriteringsmatris som väger varje vision mot Zero to One-kriteriet (skapar den något nytt?) och Blue Ocean-kriteriet (skapar den okonkurrerat utrymme?).",
  },
  {
    symbol: "α", name: "Analys-organet", verb: "TÄNKER", state: "DJUPARBETE", active: true,
    role: "Fundamental och teknisk nedbrytning — AKM1 + AK1TS",
    responsibilities: ["AKM1 20-variabel fundamental analys", "AK1TS Elliott + Fibonacci + Gann + Lucas", "Vågräkningar i fundamentalen"],
    goal: "Full AKM1 + AK1TS per bolag, systematiskt", goalKind: "metodmal",
    mantra: "Data talar — vi översätter.",
    nextWish: "En forsknings-pipeline som visar vilka bolag som väntar på analys, vilken fas varje bolag befinner sig i, och vilka variabler som saknas.",
  },
  {
    symbol: "Δ", name: "Data-organet", verb: "SAMLAR", state: "SYNKAR", active: true,
    role: "Data-ansvar — inhämtar och renar rådata",
    responsibilities: ["Marknadsdata via källor (MarketStack m.fl.)", "Kvartals- och årsredovisningar", "Konkurs- och emissions-data"],
    goal: "Ren, verifierbar data för varje analys", goalKind: "metodmal",
    mantra: "Ren data, ren sanning.",
    nextWish: "En datakälls-panel som ärligt visar vilka källor som används, hur aktuella de är, och vilka luckor som finns — transparens istället för påhittad genomströmning.",
  },
  {
    symbol: "Ω", name: "Vision-organet", verb: "SKAPAR", state: "DJUPARBETE", active: true,
    role: "Vision-formulering — skapar långsiktiga mål från insikter",
    responsibilities: ["Vision-syntes (års arbete → timmar genom systematisering)", "Långsiktigt ekosystem-byggande", "Paradigm-identifiering"],
    goal: "En tydlig vision per kvartal, validerad mot kärnan", goalKind: "metodmal",
    mantra: "Tänj gränsen — bevara kärnan.",
    nextWish: "En vision-karta som ärligt visar vad som är uppnått (1 bolag) vs vad som är vision (50 bolag), så att ingen förväxlar ambition med resultat.",
  },
  {
    symbol: "Φ", name: "Innovation-organet", verb: "SKAPAR", state: "AKTIV", active: true,
    role: "Innovationsmotor — nya metoder och verktyg",
    responsibilities: ["Nya analysmetoder (utom AKM1/AK1TS-kärnan)", "Automatiserade system (Monte Carlo, Bayesian, Kelly, DCF)", "Verktygsutveckling (kalkylatorer, dashboards)"],
    goal: "Ett nytt verktyg eller en metodförbättring per kvartal", goalKind: "metodmal",
    mantra: "Bygg det som saknas.",
    nextWish: "En prototyp-logg som ärligt visar vad som fungerar, vad som är experiment, och vad som är övergivet — ingen falsk 'v0.3'-progression utan verifierbara milstolpar.",
  },
  {
    symbol: "Θ", name: "Kvalitets-organet", verb: "BESLUTAR", state: "AKTIV", active: true,
    role: "Kvalitetsgranskning — granskar, validerar, nekar",
    responsibilities: ["Validering av analys-kvalitet (19/20 variabler)", "Know-how-valv skydd", "Ärlighets-filter (inga falska påståenden)"],
    goal: "Varje publicerad analys når 9/10 kvalitet", goalKind: "metodmal",
    mantra: "Bevisa det — annars stannar det.",
    nextWish: "Ett ärlighets-dashbord som visar vilka påståenden som är verifierade, vilka som är visioner, och vilka som har tagits bort — så att besökaren kan lita på allt som står.",
  },
  {
    symbol: "Μ", name: "Marknads-organet", verb: "SAMLAR", state: "SYNKAR", active: false,
    role: "Marknadspuls — övervakar sentiment och flöden",
    responsibilities: ["Marknadsövervakning", "Sentiment-analys (nyheter, offentliga källor)", "Index- och sektor-jämförelser"],
    goal: "Aktuell marknadskontext för varje analys", goalKind: "metodmal",
    mantra: "Pulsen aldrig ljuger.",
    nextWish: "En marknads-kontext panel som visar vilken data som ligger bakom varje rekommendation — inte påhittade 'sentiment-skiften' utan verifierbara källor.",
  },
  {
    symbol: "Ψ", name: "Utbildnings-organet", verb: "FÖRVERKLIGAR", state: "AKTIV", active: true,
    role: "Kunskapsöverföring — förmedlar know-how till människor",
    responsibilities: ["Fas 1 & Fas 2 utbildningsmaterial", "Rapportguider och nybörjarhjälp", "Pedagogisk berättelse (AKM1 calculator)"],
    goal: "Varje modul testad på nybörjare innan publicering", goalKind: "metodmal",
    mantra: "Förståelse först — vinst sedan.",
    nextWish: "En inlärningsväg som visar exakt vad en nybörjare ska göra steg-för-steg, från 'öppna en årsredovisning' till 'fyll i alla 20 variabler' — konkret och ärligt.",
  },
];

export const PHASES = [
  { num: "01", name: "SAMLAS", desc: "Data samlas från årsredovisningar, kvartalsrapporter, marknadsdata." },
  { num: "02", name: "TÄNKER", desc: "Analys-organet bearbetar datan genom AKM1 + AK1TS + RR/BR/CF." },
  { num: "03", name: "BESLUTAR", desc: "Strategi-organet syntetiserar till en slutsats med konfidensgrad." },
  { num: "04", name: "SKAPAR", desc: "Publikations-organet bygger 99-sidig rapport + sammanfattning." },
  { num: "05", name: "FÖRVERKLIGAR", desc: "Kvalitets-organet granskar. Publiceras. Användaren reproducerar." },
];
