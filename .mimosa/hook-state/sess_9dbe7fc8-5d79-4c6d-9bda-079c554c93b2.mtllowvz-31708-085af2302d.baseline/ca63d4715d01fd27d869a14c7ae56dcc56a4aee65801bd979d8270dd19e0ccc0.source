/**
 * AK1A FUNDAMENTAL VÅGMOTOR — "FVagAnalys" (portföljforskning, fas 1).
 *
 * Kunddirektivets kärna: "fundamental analys inte statisk, alla indikatorer
 * rör sig dynamiskt... integrera AKM1 med AK1TS... dynamisk utveckling om
 * var vi är på väg tack vare alla dessa vågor på fundamentalt sätt".
 *
 * Denna motor är den FUNDAMENTALA motparten till portfolj-vagor.ts/analys-motor.ts
 * (tekniska vågor ur pris/volym): här klassas AKM1:s 20 variabler (V01–V20) som
 * vågor ur bolagets EGNA fundamentalserier (BolagsNyckeltal.serier) per horisont,
 * plus en riktning ("var vi är på väg") via bedomDynamik.
 *
 * Konventioner ärvda från ekosystemet:
 *  - vagfundament-motor.ts: samma vågklasser, samma ärlighetsprincip (P8):
 *    saknad data => "osatt", motorn GISSAR ALDRIG.
 *  - portfolj-vagor.ts: totalText i pedagogik-ton — beskriver rytm, dömer aldrig.
 *  - typer.ts: HORIZONTER_VIKT där mikro viktas lägst enligt kunddirektiv.
 *
 * TRIPPELKONTROLL (kundkrav "dubbla och trippla kontroller"): varje
 * vågklass-slagsats röstas fram av TRE oberoende metoder —
 *   (a) teckenvändnings-andel  — andel positiva periodvärden (förändringar)
 *   (b) linjär regression       — lutning (relativt nivåskalan) + förklaringsgrad R²
 *   (c) delperiods-jämförelse  — senaste tredjedelns median mot tidigare, med
 *                                brusgrind (MAD på förändringarna)
 * Klass sätts ENDAST om minst 2 av 3 metoder håller med (majoritetsröstning);
 * annars "osatt". Metoddetaljerna redovisas kompakt per variabel i en
 * "hallbarVoting"-flik i anteckningen.
 *
 * Alla beräkningar är rena, deterministiska funktioner utan nätverk —
 * server-sida som verktyg, men även säkra att köra var som helst i Node.
 * Pedagogisk forskning — ALDRIG investeringsråd.
 */

import { HORIZONTER, HORIZONTER_VIKT } from "./typer";
import type {
  AKM1Bedomning,
  BolagsNyckeltal,
  Dynamik,
  FVagAnalys,
  Horisont,
  VagKlass,
  VariabelVagstatus,
} from "./typer";

// ── Konstanter ───────────────────────────────────────────────────────────────

/** Klass med å för löpande text (JSON-nycklarna är å-fria, texten är svenska). */
const KLASS_TEXT: Record<VagKlass, string> = {
  impulsvag: "impulsvåg", korrigering: "korrigering", basbygge: "basbygge", osatt: "osatt",
};

/** Enhetskoder för den kompakta hallbarVoting-fliken. */
const KLASS_KOD: Record<VagKlass, string> = {
  impulsvag: "I", korrigering: "K", basbygge: "B", osatt: "O",
};

/** Klass → tal för viktad sammanvägning (osatt räknas aldrig in). */
const KLASS_TAL: Record<VagKlass, number> = {
  impulsvag: 1, korrigering: -1, basbygge: 0, osatt: 0,
};

/**
 * Fönster per horisont, i ANTAL SERIEPERIODER (motorn känner inte till
 * seriens frekvens). Med kvartalsserie motsvarar mikro/kort direktivet
 * ("senaste 1–2 kvartalen" / "~1 år"); med årsdata (idag vanliga fallet i
 * BolagsNyckeltal.serier) blir mikro/kort de allra senaste årens rörelser —
 * en grov proxy som markeras i anteckningen. mega = hela serien.
 */
const FONSTER: Record<Horisont, { ta: number | null; min: number }> = {
  mikro: { ta: 3, min: 3 },
  kort: { ta: 4, min: 4 },
  medellang: { ta: 5, min: 5 },
  lang: { ta: 6, min: 6 },
  mega: { ta: null, min: 5 }, // null = hela serien
};

/** Trösklar för metod A (teckenvändnings-andel): netto = (upp − ned) / antal. */
const A_NETTO_IMPULS = 0.5;   // ≥ +0,5 → impulsvag (tydlig majoritet positiva)
const A_NETTO_KORR = -0.5;    // ≤ −0,5 → korrigering
const A_NETTO_BAS = 0.34;     // |netto| < 0,34 → basbygge; däremellan avstår metoden

/** Trösklar för metod B (regression): relativ lutning per period + min-R². */
const B_REL_LUTNING = 0.02;   // |lutning| ≥ 2 % av nivåskalan per period = riktning
const B_MIN_R2 = 0.25;        // trenden måste förklara ≥ 25 % av variansen

/** Trösklar för metod C (delperiod) och bedomDynamik. */
const C_REL_GRANS = 0.05;     // ±5 % relativ medianförskjutning = riktning
const BRUS_FAKTOR = 2;        // |medianförskjutning| ≤ 2 × brus (MAD på diffar) = inom bruset

/** Minsta sammanlagd horisontvikt för att en variabel ska få en klass
 *  (mikro ensam = 0,05 räcker inte — ärlighet framför tunna slutsatser). */
const MIN_CAST_VIKT = 0.1;

// ── Statistikhjälpmedel (medianbaserade — robusta mot outliers) ──────────────

function median(varden: number[]): number {
  if (varden.length === 0) return 0;
  const s = [...varden].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Medianabsolutavvikelse (MAD) — robust spridning. */
function mad(varden: number[]): number {
  if (varden.length === 0) return 0;
  const m = median(varden);
  return median(varden.map((v) => Math.abs(v - m)));
}

/** Periodvärden (förändringar) — metod A:s och brusgrundernas råmaterial. */
function diffar(serie: number[]): number[] {
  const ut: number[] = [];
  for (let i = 1; i < serie.length; i++) ut.push(serie[i] - serie[i - 1]);
  return ut;
}

/** OLS-linjär regression mot index: lutning + förklaringsgrad R². */
function linjarRegression(serie: number[]): { lutning: number; r2: number } {
  const n = serie.length;
  if (n < 2) return { lutning: 0, r2: 0 };
  const mx = (n - 1) / 2;
  let my = 0;
  for (const v of serie) my += v;
  my /= n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (i - mx) * (serie[i] - my);
    sxx += (i - mx) * (i - mx);
    syy += (serie[i] - my) * (serie[i] - my);
  }
  if (sxx === 0 || syy === 0) return { lutning: 0, r2: 0 }; // konstant serie → plant
  const lutning = sxy / sxx;
  return { lutning, r2: (lutning * lutning * sxx) / syy };
}

// ── De tre oberoende röstningsmetoderna ──────────────────────────────────────

export type Rost = { klass: VagKlass; detalj: string };

/** (a) Teckenvändnings-andel: andel positiva periodvärden. */
function metodTeckenvandning(fonster: number[]): Rost {
  const d = diffar(fonster);
  if (d.length < 2) return { klass: "osatt", detalj: "A: färre än 2 periodvärden" };
  let upp = 0;
  let ned = 0;
  for (const x of d) {
    if (x > 0) upp += 1;
    else if (x < 0) ned += 1;
  }
  const netto = (upp - ned) / d.length;
  const t = `A: netto ${netto >= 0 ? "+" : ""}${Math.round(netto * 100) / 100} (${upp} upp/${ned} ned av ${d.length})`;
  if (netto >= A_NETTO_IMPULS) return { klass: "impulsvag", detalj: t };
  if (netto <= A_NETTO_KORR) return { klass: "korrigering", detalj: t };
  if (Math.abs(netto) < A_NETTO_BAS) return { klass: "basbygge", detalj: t };
  return { klass: "osatt", detalj: t + " — blandat, metoden avstår" };
}

/** (b) Linjär regression: lutning relativt nivåskalan + R². */
function metodRegression(fonster: number[]): Rost {
  if (fonster.length < 3) return { klass: "osatt", detalj: "B: färre än 3 punkter" };
  const { lutning, r2 } = linjarRegression(fonster);
  const skala = median(fonster.map(Math.abs)); // robust nivåskala
  const rel = skala > 1e-12 ? lutning / skala : 0;
  const t = `B: rel lutning ${rel >= 0 ? "+" : ""}${Math.round(rel * 1000) / 1000}, R² ${Math.round(r2 * 100) / 100}`;
  if (Math.abs(rel) < B_REL_LUTNING) return { klass: "basbygge", detalj: t + " — plant" };
  if (r2 < B_MIN_R2) return { klass: "osatt", detalj: t + " — riktning utan hällbar trend" };
  return { klass: rel > 0 ? "impulsvag" : "korrigering", detalj: t };
}

/** (c) Delperiods-jämförelse: senaste tredjedelns median mot tidigare,
 *  med brusgrind (|Δmedian| ≤ 2 × MAD på förändringarna → inom bruset). */
function metodDelperiod(fonster: number[]): Rost {
  const n = fonster.length;
  if (n < 4) return { klass: "osatt", detalj: "C: färre än 4 punkter" };
  const k = Math.max(2, Math.floor(n / 3)); // senaste tredjedelen, minst 2 punkter
  const ms = median(fonster.slice(n - k));
  const mt = median(fonster.slice(0, n - k));
  const d = ms - mt;
  const brus = BRUS_FAKTOR * mad(diffar(fonster));
  const t = `C: Δmedian ${d >= 0 ? "+" : ""}${Math.round(d * 1000) / 1000} mot brus ${Math.round(brus * 1000) / 1000}`;
  if (Math.abs(d) <= brus) return { klass: "basbygge", detalj: t + " — inom bruset" };
  const skala = Math.max(Math.abs(ms), Math.abs(mt), mad(diffar(fonster)), 1e-12);
  const rel = d / skala;
  if (rel >= C_REL_GRANS) return { klass: "impulsvag", detalj: t };
  if (rel <= -C_REL_GRANS) return { klass: "korrigering", detalj: t };
  return { klass: "basbygge", detalj: t };
}

/** Trippelröstningen: klass endast om ≥ 2 av 3 metoder håller med. */
export function trippelrostning(fonster: number[]): {
  klass: VagKlass;
  a: Rost;
  b: Rost;
  c: Rost;
} {
  const a = metodTeckenvandning(fonster);
  const b = metodRegression(fonster);
  const c = metodDelperiod(fonster);
  const antal: Record<VagKlass, number> = { impulsvag: 0, korrigering: 0, basbygge: 0, osatt: 0 };
  for (const r of [a, b, c]) antal[r.klass] += 1;
  let basta: VagKlass = "osatt";
  let max = 1; // kräver minst 2 röster
  for (const k of ["impulsvag", "korrigering", "basbygge", "osatt"] as VagKlass[]) {
    if (antal[k] > max) {
      max = antal[k];
      basta = k;
    }
  }
  return { klass: basta, a, b, c };
}

// ── 1. klassaVag — fundamental vågklass ur tidsserie per horisont ───────────

/** Rensar serien på icke-ändliga värden (motorn gissar aldrig, den hoppar ärligt). */
function rensa(serie: number[]): number[] {
  return Array.isArray(serie) ? serie.filter((x) => typeof x === "number" && Number.isFinite(x)) : [];
}

/** Fönster för en horisont, eller null när underlaget är för kort. */
function fonsterFor(serie: number[], horisont: Horisont): number[] | null {
  const ren = rensa(serie);
  const f = FONSTER[horisont];
  if (ren.length < f.min) return null;
  return f.ta === null ? ren : ren.slice(-f.ta);
}

/** Detaljerad klassning (motorn använder internt; detaljerna syns i anteckningen). */
export function klassaVagDetaljerad(serie: number[], horisont: Horisont): {
  klass: VagKlass;
  rost: { a: Rost; b: Rost; c: Rost };
  punkter: number;
} {
  const fonster = fonsterFor(serie, horisont);
  if (!fonster) {
    return {
      klass: "osatt",
      rost: {
        a: { klass: "osatt", detalj: "A: inget fönster" },
        b: { klass: "osatt", detalj: "B: inget fönster" },
        c: { klass: "osatt", detalj: "C: inget fönster" },
      },
      punkter: rensa(serie).length,
    };
  }
  const { klass, a, b, c } = trippelrostning(fonster);
  return { klass, rost: { a, b, c }, punkter: fonster.length };
}

/**
 * Fundamental vågklass ur en tidsserie, per horisont:
 *  - impulsvag   = ihållande förbättringstrend
 *  - korrigering = avmattning/uttunning efter (eller utan) förbättring
 *  - basbygge    = sidledes/stabilisering (ändringar inom seriens eget brus)
 *  - osatt       = otillräcklig data eller att de tre metoderna är oense
 * Ärlighetsprincipen från portfolj-vagor.ts: motorn gissar aldrig.
 */
export function klassaVag(serie: number[], horisont: Horisont): VagKlass {
  return klassaVagDetaljerad(serie, horisont).klass;
}

// ── 2. bedomDynamik — "var vi är på väg" ─────────────────────────────────────

/**
 * Jämför senare halvan mot tidigare (medianbaserat, robust mot outliers).
 * Tolkningen är "högre senare värde = förbättring" — för variabler där lägre
 * är bättre vänder raknaFVag på resultatet (se VARIABEL_KALLA.riktning).
 * Brusgrind: skillnaden måste överstiga 2 × MAD på förändringarna.
 */
export function bedomDynamik(serie: number[]): Dynamik {
  const ren = rensa(serie);
  if (ren.length < 4) return "osatt";
  const halv = Math.floor(ren.length / 2);
  const mt = median(ren.slice(0, halv));
  const ms = median(ren.slice(halv)); // senare halvan får extra punkten vid udda längd
  const d = ms - mt;
  const brus = BRUS_FAKTOR * mad(diffar(ren));
  if (Math.abs(d) <= brus) return "stabilt";
  const skala = Math.max(Math.abs(mt), Math.abs(ms), mad(diffar(ren)), 1e-12);
  const rel = d / skala;
  if (rel >= C_REL_GRANS) return "forbattras";
  if (rel <= -C_REL_GRANS) return "forsvamras";
  return "stabilt";
}

/** Vänder dynamikriktning för variabler där lägre värde är bättre. */
function vandDynamik(d: Dynamik): Dynamik {
  if (d === "forbattras") return "forsvamras";
  if (d === "forsvamras") return "forbattras";
  return d;
}

// ── VARIABEL_KALLA — mappning V01–V20 mot BolagsNyckeltal ────────────────────

/** Svensk decimalform av ett tal ("2,5"); null/undefined → "saknas". */
function tal(x: number | null | undefined, decimaler = 1): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "saknas";
  const f = 10 ** decimaler;
  return String(Math.round(x * f) / f).replace(".", ",");
}

/** Decimalform (0,12 → "12") för andelar som lagras som decimaler. */
function procent(x: number | null | undefined, decimaler = 1): string {
  return x !== null && x !== undefined && Number.isFinite(x) ? tal(x * 100, decimaler) : "saknas";
}

/** Tolkning av seriens riktning: "hogre" = högre värde är bättre. */
export type VariabelRiktning = "hogre" | "lagre";

export type VariabelKalla = {
  id: string;
  namn: string;
  kategori: string;
  /** Variabelns tidsserie ur nyckeltalen — null när ingen serie kan härledas. */
  serie: (n: BolagsNyckeltal) => number[] | null;
  riktning: VariabelRiktning;
  /** Kort svensk källbeskrivning (återanvänds i anteckningen). */
  kallaText: string;
  /** Anteckning när serie saknas — med skalärkontext där nuvärden finns. */
  osattText: (n: BolagsNyckeltal) => string;
};

// — Seriehärledningar (indexvis, ärliga hopp över ogiltiga par) ————————————

/** Heltalsren omsättnings-/resultat-/ekvitet-/fcf-nivåserie. */
function nivaSerie(n: BolagsNyckeltal, falt: "omsattning" | "resultat" | "egetKapital" | "fcf"): number[] | null {
  const r = n.serier;
  if (!r || !Array.isArray(r[falt])) return null;
  const ren = rensa(r[falt]);
  return ren.length > 0 ? ren : null;
}

/** Årlig tillväxttakt (yoy) — hoppar par med icke-positiv bas (meningslös procent). */
function yoySerie(n: BolagsNyckeltal): number[] | null {
  const oms = nivaSerie(n, "omsattning");
  if (!oms) return null;
  const ut: number[] = [];
  for (let i = 1; i < oms.length; i++) {
    if (!(oms[i - 1] > 0)) continue;
    const r = oms[i] / oms[i - 1] - 1;
    if (Number.isFinite(r)) ut.push(r);
  }
  return ut.length > 0 ? ut : null;
}

/** Kvotserie tal/nämnare, indexvis; endast positiva nämnare (negativt eget
 *  kapital ger meningslös ROE — hoppas ärligt). */
function roeSerie(n: BolagsNyckeltal): number[] | null {
  const s = n.serier;
  if (!s || !Array.isArray(s.resultat) || !Array.isArray(s.egetKapital)) return null;
  const langd = Math.min(s.resultat.length, s.egetKapital.length);
  const ut: number[] = [];
  for (let i = 0; i < langd; i++) {
    const t = s.resultat[i];
    const q = s.egetKapital[i];
    if (!Number.isFinite(t) || !Number.isFinite(q) || q <= 0) continue;
    const v = t / q;
    if (Number.isFinite(v)) ut.push(v);
  }
  return ut.length > 0 ? ut : null;
}

/**
 * VARIABEL_KALLA — tabellen som mappar varje AKM1-variabel (V01–V20) mot
 * fält i BolagsNyckeltal. Fyra variabler har härledbara tidsserier idag
 * (V01, V09, V12, V19); övriga klassas ärligt som osatta med skalärkontext.
 * Tabellen är utbyggbar: när BolagsNyckeltal.serier får fler fält
 * (bruttoresultat, skuld, aktieantal, kvartalsfrekvens) tänds fler rader.
 */
export const VARIABEL_KALLA: VariabelKalla[] = [
  // — Tillväxt —
  {
    id: "V01",
    namn: "Försäljningstillväxt",
    kategori: "tillvaxt",
    serie: yoySerie,
    riktning: "hogre",
    kallaText: "källa: omsättningens tillväxttakt (yoy) ur serier.omsattning",
    osattText: (n) =>
      `Ingen omsättningsserie i underlaget (serier.omsattning saknas); nuvärden: ` +
      `5-års CAGR ${procent(n.tillvaxt?.omsattningCAGR5ar)} %, ` +
      `TTM ${procent(n.tillvaxt?.omsattningTillvaxtTTM)} % — vågklass kräver tidsserie.`,
  },
  {
    id: "V02",
    namn: "ARR-tillväxt",
    kategori: "tillvaxt",
    serie: () => null,
    riktning: "hogre",
    kallaText: "källa: ARR ingår inte i nyckeltalsunderlaget",
    osattText: () =>
      "ARR (årliga återkommande intäkter) redovisas inte i BolagsNyckeltal — klassas i AKM1:s manuella granskning, inte ur tidsserier.",
  },
  {
    id: "V03",
    namn: "Intäktsdiversifiering",
    kategori: "tillvaxt",
    serie: () => null,
    riktning: "hogre",
    kallaText: "källa: segmentdata ingår inte i nyckeltalsunderlaget",
    osattText: () =>
      "Intäktsdiversifiering (segment/kundspridning) ingår inte i BolagsNyckeltal — kvalitativ AKM1-granskning.",
  },
  // — Värdering —
  {
    id: "V04",
    namn: "P/S",
    kategori: "vardering",
    serie: () => null,
    riktning: "lagre",
    kallaText: "källa: värderingsserier saknas (bara nuvärden)",
    osattText: (n) =>
      `Värderingens våg kräver en pris-/multiplerserie över tid — sådan finns inte i BolagsNyckeltal. ` +
      `Nuvärden som kontext: P/E ${tal(n.vardering?.pe)}, EV/EBIT ${tal(n.vardering?.evEbit)}.`,
  },
  {
    id: "V05",
    namn: "P/B",
    kategori: "vardering",
    serie: () => null,
    riktning: "lagre",
    kallaText: "källa: värderingsserier saknas (bara nuvärden)",
    osattText: (n) =>
      `P/B som tidsserie saknas; nuvärde P/B ${tal(n.vardering?.pb ?? n.vardering?.egenKapitalMultipl)} ` +
      `(Grahams ≥1,5-varning gäller egenkapitalmultipln). Vågklass kräver historik.`,
  },
  {
    id: "V06",
    namn: "EV/EBITDA",
    kategori: "vardering",
    serie: () => null,
    riktning: "lagre",
    kallaText: "källa: värderingsserier saknas (bara nuvärden)",
    osattText: (n) =>
      `EV/EBITDA-serie saknas; nuvärde ${tal(n.vardering?.evEbit)}, PEG ${tal(n.vardering?.peg)}, ` +
      `FCF-avkastning ${procent(n.vardering?.fcfYield)} % — vågklass kräver tidsserie.`,
  },
  // — Lönsamhet —
  {
    id: "V07",
    namn: "Bruttomarginal",
    kategori: "lonsamhet",
    serie: () => null,
    riktning: "hogre",
    kallaText: "källa: bruttoresultatserie saknas i serier-underlaget",
    osattText: (n) =>
      `Bruttovinst per år ingår inte i serier (fält finns ej) — nuvärde bruttomarginal ` +
      `${procent(n.lonksamhet?.bruttoMarginal)} %; ` +
      `moat-fältens 5-årsdata: medel ${procent(n.moat?.bruttoMarginalMedel5ar)} %, ` +
      `spread ${procent(n.moat?.bruttoMarginalSpread5ar)} %.`,
  },
  {
    id: "V08",
    namn: "EBITDA-marginal",
    kategori: "lonsamhet",
    serie: () => null,
    riktning: "hogre",
    kallaText: "källa: EBIT/EBITDA-serie saknas i serier-underlaget",
    osattText: (n) =>
      `EBIT/EBITDA per år ingår inte i serier — nuvärde EBIT-marginal ` +
      `${procent(n.lonksamhet?.ebitMarginal)} %. Vågklass kräver tidsserie.`,
  },
  {
    id: "V09",
    namn: "ROE",
    kategori: "lonsamhet",
    serie: roeSerie,
    riktning: "hogre",
    kallaText: "källa: resultat/eget kapital per år ur serier.resultat + serier.egetKapital",
    osattText: (n) =>
      `Ingen resultat-/egenkapitalserie att härleda ROE-bana ur; nuvärde ROE ` +
      `${procent(n.lonksamhet?.roe)} %, ` +
      `5-årsmedel ${procent(n.moat?.roeMedel5ar)} % — vågklass kräver tidsserie.`,
  },
  // — Stabilitet —
  {
    id: "V10",
    namn: "Skuldsättningsgrad",
    kategori: "stabilitet",
    serie: () => null,
    riktning: "lagre",
    kallaText: "källa: skuldserie saknas i serier-underlaget",
    osattText: (n) =>
      `Skuld per år ingår inte i serier — nuvärde skuld/eget kapital ${tal(n.stabilitet?.skuldEgenkapital, 2)}, ` +
      `räntetäckning ${tal(n.stabilitet?.rantaTackning, 2)}. Vågklass kräver tidsserie.`,
  },
  {
    id: "V11",
    namn: "Likviditet",
    kategori: "stabilitet",
    serie: () => null,
    riktning: "hogre",
    kallaText: "källa: balansposter ingår inte i nyckeltalsunderlaget",
    osattText: () =>
      "Omsättningstillgångar/kortfristiga skulder ingår inte i BolagsNyckeltal — klassas i AKM1:s manuella granskning.",
  },
  {
    id: "V12",
    namn: "Intäktsstabilitet",
    kategori: "stabilitet",
    serie: (n) => nivaSerie(n, "omsattning"),
    riktning: "hogre",
    kallaText: "källa: omsättningsnivåer ur serier.omsattning (sidledes = stabilt basbygge)",
    osattText: (n) =>
      `Ingen omsättningsserie; FCF-poskvartal/-år av 5: ${tal(n.stabilitet?.fcfPositivaSenaste5, 0)} — vågklass kräver tidsserie.`,
  },
  // — Moat —
  {
    id: "V13",
    namn: "Patent & IP",
    kategori: "moat",
    serie: () => null,
    riktning: "hogre",
    kallaText: "källa: kvalitativ — ingen tidsserie",
    osattText: () =>
      "Patent & IP är kvalitativ och händelsebaserad — klassas i AKM1:s manuella granskning, inte ur tidsserier.",
  },
  {
    id: "V14",
    namn: "Varumärke & kundlojalitet",
    kategori: "moat",
    serie: () => null,
    riktning: "hogre",
    kallaText: "källa: moat-fältens 5-årsaggregat (utan tidsserie)",
    osattText: (n) =>
      `Moat-fälten är 5-årsaggregat utan årsserie: bruttomarginalmedel ` +
      `${procent(n.moat?.bruttoMarginalMedel5ar)} % ` +
      `med spread ${procent(n.moat?.bruttoMarginalSpread5ar)} % ` +
      `(låg spread = stadig vallgrav) — vågklass kräver tidsserie.`,
  },
  {
    id: "V15",
    namn: "Nätverkseffekter",
    kategori: "moat",
    serie: () => null,
    riktning: "hogre",
    kallaText: "källa: kvalitativ — ingen tidsserie",
    osattText: () =>
      "Nätverkseffekter är kvalitativa — klassas i AKM1:s manuella granskning, inte ur tidsserier.",
  },
  // — Katalysator —
  {
    id: "V16",
    namn: "Produktlanseringar",
    kategori: "katalysator",
    serie: () => null,
    riktning: "hogre",
    kallaText: "källa: händelsebaserad — ingen tidsserie",
    osattText: () =>
      "Produktlanseringar är händelsebaserade — klassas i AKM1:s manuella granskning, inte ur tidsserier.",
  },
  {
    id: "V17",
    namn: "Avtal & partnerskap",
    kategori: "katalysator",
    serie: () => null,
    riktning: "hogre",
    kallaText: "källa: händelsebaserad — ingen tidsserie",
    osattText: () =>
      "Avtal & partnerskap är händelsebaserade — klassas i AKM1:s manuella granskning, inte ur tidsserier.",
  },
  {
    id: "V18",
    namn: "Regulatoriska katalysatorer",
    kategori: "katalysator",
    serie: () => null,
    riktning: "hogre",
    kallaText: "källa: händelsebaserad — ingen tidsserie",
    osattText: () =>
      "Regulatoriska katalysatorer är händelsebaserade — klassas i AKM1:s manuella granskning, inte ur tidsserier.",
  },
  // — Risk —
  {
    id: "V19",
    namn: "Kassatäckning — nyemissionsrisk",
    kategori: "risk",
    serie: (n) => nivaSerie(n, "fcf"),
    riktning: "hogre", // högre/stigande FCF = starkare kassatäckning, lägre emissionsrisk
    kallaText: "källa: fritt kassaflöde per år ur serier.fcf (förbränningstakt)",
    osattText: (n) =>
      `Ingen FCF-serie att läsa förbränningstakt ur; kontext: kassa räcker ` +
      `${tal(n.stabilitet?.kassaManaderBurnRate, 0)} månader vid förbränning, ` +
      `nyemissioner senaste 5 åren ${tal(n.stabilitet?.nyemissionerSenaste5ar, 0)} st, ` +
      `FCF-pos perioder av 5: ${tal(n.stabilitet?.fcfPositivaSenaste5, 0)} — vågklass kräver tidsserie.`,
  },
  {
    id: "V20",
    namn: "Återköp av egna aktier",
    kategori: "risk",
    serie: () => null, // aterkop-blocket är nuvärden, ingen tidsserie
    riktning: "hogre", // högre andel återköpt = starkare kapitalåterföring
    kallaText: "källa: återköpsblocket är nuvärden (ingen tidsserie)",
    osattText: (n) =>
      `Återköpsblocket redovisar nuvärden utan årsserie: senaste året ` +
      `${tal(n.aterkop?.senasteArMdr, 2)} mdr, minskning av aktieantalet ` +
      `${procent(n.aterkop?.andelUtestande)} %, ` +
      `insiderköp senaste 6 mån ${tal(n.aterkop?.insiderkopSenaste6man, 0)} st — vågklass kräver aktieantalsserie över tid.`,
  },
];

// ── Aggregering ──────────────────────────────────────────────────────────────

/**
 * En variabels samlade klass: HORIZONTER_VIKT-viktad dominans över de fem
 * horisonterna (mikro väger lägst enligt kunddirektiv). Krav: ledande klass
 * har strikt mer än hälften av den röstande vikten OCH total röstvikt ≥ 0,1 —
 * annars "osatt" (variabeln pekar olika på olika horisonter).
 */
function viktadKlass(klassPerHorisont: Record<Horisont, VagKlass>): VagKlass {
  const ack: Record<"impulsvag" | "korrigering" | "basbygge", number> = { impulsvag: 0, korrigering: 0, basbygge: 0 };
  let cast = 0;
  for (const hz of HORIZONTER) {
    const k = klassPerHorisont[hz];
    if (k === "osatt") continue;
    ack[k] += HORIZONTER_VIKT[hz];
    cast += HORIZONTER_VIKT[hz];
  }
  if (cast < MIN_CAST_VIKT) return "osatt";
  const ordning: Array<"impulsvag" | "korrigering" | "basbygge"> = ["impulsvag", "korrigering", "basbygge"];
  let ledare = ordning[0];
  for (const k of ordning) if (ack[k] > ack[ledare]) ledare = k;
  return ack[ledare] / cast > 0.5 ? ledare : "osatt";
}

/**
 * Dominerande klass per horisont över variablerna — konfluensregel i ekosystemets
 * anda: MINST TVÅ variabler måste peka samma håll med strikt övervikt, annars
 * "osatt" (variablerna pekar olika).
 */
function dominerandeKlass(klasser: VagKlass[]): VagKlass {
  const roster: Record<VagKlass, number> = { impulsvag: 0, korrigering: 0, basbygge: 0, osatt: 0 };
  for (const k of klasser) if (k !== "osatt") roster[k] += 1;
  const ordning: VagKlass[] = ["impulsvag", "korrigering", "basbygge"];
  let ledare: VagKlass = "osatt";
  let max = 1; // minst 2 röster krävs
  for (const k of ordning) {
    if (roster[k] > max) {
      max = roster[k];
      ledare = k;
    }
  }
  // oavgjord topp (t.ex. 2–2) => ingen tydlig ledare => osatt
  const andraplats = Math.max(...ordning.filter((k) => k !== ledare).map((k) => roster[k]));
  if (ledare !== "osatt" && roster[ledare] <= andraplats) return "osatt";
  return ledare;
}

// ── Anteckningar (kompakt hallbarVoting-flik) ────────────────────────────────

/** "mikro:impulsvåg[I,I,K]"-token per horisont. */
function votingFlik(klassHz: Record<Horisont, VagKlass>, rostHz: Record<Horisont, string>): string {
  return HORIZONTER.map(
    (hz) => `${hz}:${KLASS_TEXT[klassHz[hz]]}[${rostHz[hz]}]`
  ).join(" ");
}

// ── totalText — pedagogisk formulering (beskriver, dömer aldrig) ─────────────

function byggTotalText(
  namn: string,
  perHorisont: Record<Horisont, VagKlass>,
  perVariabel: Record<string, VariabelVagstatus>,
  klassbara: number
): string {
  if (klassbara === 0) {
    return (
      `${namn}: den fundamentala vågbilden är än så länge osatt — underlaget saknar tidsserier att läsa. ` +
      "Motorn gissar aldrig; med årsserier för omsättning, resultat, eget kapital och fritt kassaflöde växer vågrörelsen fram. " +
      "En bild att komplettera med AKM1:s manuella granskning — inte en uppmaning att agera."
    );
  }

  const HZ_FRAS: Record<Horisont, string> = {
    mikro: "mikronivån", kort: "kort sikt", medellang: "medellång sikt", lang: "lång sikt", mega: "meganivån",
  };
  const segment = HORIZONTER.map((hz) => `${KLASS_TEXT[perHorisont[hz]]} på ${HZ_FRAS[hz]}`);
  const huvudtext = segment.slice(0, -1).join(", ") + " samt " + segment[segment.length - 1];

  // Sammanvägt viktat tal (−1..+1) med HORIZONTER_VIKT över horisonter med klass
  let talSumma = 0;
  let viktSumma = 0;
  for (const hz of HORIZONTER) {
    if (perHorisont[hz] === "osatt") continue;
    talSumma += KLASS_TAL[perHorisont[hz]] * HORIZONTER_VIKT[hz];
    viktSumma += HORIZONTER_VIKT[hz];
  }
  const viktat = viktSumma > 0 ? talSumma / viktSumma : 0;
  const riktning =
    viktat > 0.3
      ? "tydligt på uppsidan — de fundamentalvågor som kan läsas förbättras ihållande"
      : viktat < -0.3
        ? "tydligt på nedsidan — de fundamentalvågor som kan läsas avmattas"
        : "blandad — olika vågor rör sig olika håll, vilket i sig är en studie i rytm";

  const forb = Object.values(perVariabel).filter((v) => v.dynamik === "forbattras").length;
  const stab = Object.values(perVariabel).filter((v) => v.dynamik === "stabilt").length;
  const fors = Object.values(perVariabel).filter((v) => v.dynamik === "forsvamras").length;

  return (
    `${namn}: den fundamentala utvecklingen rör sig i ${huvudtext}. ` +
    `Sammanvägt med horisontvikterna (mikro lägst enligt direktiv) ligger bilden ${riktning}. ` +
    `Var vi är på väg just nu — senare halvan mot tidigare, medianvis: ${forb} variabler förbättras, ` +
    `${stab} är stabila, ${fors} försvagas (övriga osatta). ` +
    `${klassbara} av 20 AKM1-variabler har tidsserier att läsa — resten redovisas osatta med anledning snarare än gissade. ` +
    "Vågorna beskriver bolagets fundamental rytm, en bild att studera och lära av — inte en uppmaning att agera."
  );
}

// ── 3. raknaFVag — huvudfunktionen ───────────────────────────────────────────

/**
 * Räknar bolagets fundamentala våganalys:
 *  - perVariabel: vågklass + dynamik per AKM1-variabel (V01–V20) ur relevanta
 *    serier enligt VARIABEL_KALLA; variabler utan data => "osatt" + anteckning.
 *    Vågklassen per variabel är HORIZONTER_VIKT-viktad över de fem horisonterna;
 *    varje horisontklass comes from trippelröstningen (≥2 av 3 metoder).
 *  - perHorisont: dominerande klass per horisont över variablerna (konfluens:
 *    minst två variabler samma håll).
 *  - totalText: pedagogisk svensk text — beskriver rytm och riktning, dömer aldrig.
 *  - akm1 (valfri): poäng och motivering citeras i anteckningarna (spårbarhet).
 */
export function raknaFVag(nyckeltal: BolagsNyckeltal, akm1?: AKM1Bedomning): FVagAnalys {
  const ticker = nyckeltal?.ticker || "okänd";
  const namn = nyckeltal?.namn || ticker;
  const arsdata = Boolean(nyckeltal?.serier?.ar && (nyckeltal.serier.ar as string[]).length > 0);

  const perVariabel: Record<string, VariabelVagstatus> = {};
  const klassMatris: Record<string, Record<Horisont, VagKlass>> = {};
  let klassbara = 0;

  for (const vk of VARIABEL_KALLA) {
    const serie = nyckeltal ? vk.serie(nyckeltal) : null;
    const poang = akm1?.poang?.[vk.id];

    if (!serie || serie.length < 3) {
      // Ingen serie alls — ärligt osatt med skalärkontext (motorn gissar aldrig)
      perVariabel[vk.id] = {
        klass: "osatt",
        dynamik: "osatt",
        anteckning:
          (nyckeltal ? vk.osattText(nyckeltal) : "Inget nyckeltalsunderlag.") +
          (poang !== undefined ? ` AKM1 ${vk.id}: ${poang}/5 p.` : ""),
      };
      continue;
    }

    // Klassning per horisont med trippelröstning
    const klassHz = {} as Record<Horisont, VagKlass>;
    const rostHz = {} as Record<Horisont, string>;
    for (const hz of HORIZONTER) {
      const { klass, rost } = klassaVagDetaljerad(serie, hz);
      klassHz[hz] = klass;
      rostHz[hz] = `${KLASS_KOD[rost.a.klass]},${KLASS_KOD[rost.b.klass]},${KLASS_KOD[rost.c.klass]}`;
    }
    klassMatris[vk.id] = klassHz;

    const klass = viktadKlass(klassHz);
    if (klass !== "osatt") klassbara += 1;

    const dynRå = bedomDynamik(serie);
    const dynamik: Dynamik = vk.riktning === "lagre" ? vandDynamik(dynRå) : dynRå;

    const delar = [
      `${vk.namn}: ${vk.kallaText} (${serie.length} punkter)`,
      `hallbarVoting: ${votingFlik(klassHz, rostHz)}; slutklass ${KLASS_TEXT[klass]}`,
      `dynamik ${dynamik}`,
    ];
    if (arsdata) delar.push("årsdata: mikro/kort är närmaste-periods-proxy");
    if (poang !== undefined) delar.push(`AKM1 ${poang}/5 p`);
    if (akm1?.motivering?.[vk.id]) delar.push(`"${akm1.motivering[vk.id]}"`);

    perVariabel[vk.id] = { klass, dynamik, anteckning: delar.join(" · ") };
  }

  const perHorisont = {} as Record<Horisont, VagKlass>;
  for (const hz of HORIZONTER) {
    const klasser: VagKlass[] = [];
    for (const vk of VARIABEL_KALLA) {
      const k = klassMatris[vk.id]?.[hz];
      if (k && k !== "osatt") klasser.push(k);
    }
    perHorisont[hz] = dominerandeKlass(klasser);
  }

  return {
    ticker,
    perVariabel,
    perHorisont,
    totalText: byggTotalText(namn, perHorisont, perVariabel, klassbara),
    datum: nyckeltal?.hamtat || new Date().toISOString().slice(0, 10),
  };
}
