/**
 * DATASET-ASPEKTER — KONTRAKT för /dataset/[bransch]/[aspekt] (VÅG 150, fas A)
 * =====================================================================
 * Programmatiska long-tail-sidor ur forskningsuniversumets publika nyckeltal
 * (underlag: data/forskning/sokord/bransch-teman.md, våg 138 S7). Fas A =
 * KONTRAKTSSÄKRA teman (nyckeltalsdjup + land + värderingshub). Tema 2/3/5
 * i underlaget (AKM2-profil, kategoripoäng, lägesbild/vågdynamik) publicerar
 * modellpoäng och vågklasser på dataset-ytan och VÄNTAR därför på
 * A2-DATASET-KONTRAKT-omprövning — INGEN modul här får bära sådan data.
 *
 * GRÄNSDRAGNING (A2-DATASET-KONTRAKT §1 — oföränderlig princip, samma som
 * dataset-medianer.ts):
 *  - PUBLIKT: median/kvartiler/min/max av PUBLIKA marknadsnyckeltal per
 *    bransch (eller land×bransch) med n-redovisning.
 *  - ALDRIG i utdata: AKM-poäng (AKM1/AKM2/kategoripoäng), vågklasser,
 *    fvag-fält, status, golv, portV19 — och INGA bolagsnamn eller tickers.
 *    Typen AspektSida har ingenstans att bära dem (gränsvakten är
 *    strukturell); modulerna läser heller aldrig poängkällor.
 *  - Källfil är ENBAST data/portfolj-system/bolagsunivers.json (publika
 *    fält). data/stocks/** (PREC-ST:s recommendation/priceTarget —
 *    juridikrisk, bransch-teman §6 flagga 1) och korstabellen (poäng) är
 *    osynliga för denna modul och skall förbli det.
 *  - Gränsregeln (< 5 mätta ⇒ sidan publiceras ej) fattas av SLUTLED-
 *    registret (huvudagenten) via matta + MIN_MATTA — modulen räknar
 *    alltid ärligt och gissar aldrig.
 *
 * Determinism: bolagsraderna läses en gång per process (modulcache) och
 * sorteras i svensk kollation; statistiken räknas med SAMMA hjälpare
 * (sammanfatta) som dataset-medianer använder — bransch- och landstal kan
 * aldrig skilja sig åt i metod.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { median, runda1 } from "./dataset-nyckeltal";
import { percentil } from "./dataset-medianer";

// ── Typer ────────────────────────────────────────────────────────────────────

/**
 * Strukturellt utsnitt av en bolagsrad i bolagsunivers.json — ENBAST publika
 * fält (samma gränsvaktsidé som DatasetUniversumRad i dataset-medianer.ts).
 * Tickers, namn, poäng, serier och källor finns helt enkelt inte här.
 */
export type AspektUniversumRad = {
  bransch?: string | null;
  land?: string | null;
  vardering?: {
    pe?: number | null;
    pb?: number | null;
    evEbit?: number | null;
    peg?: number | null;
    fcfYield?: number | null;
    egenKapitalMultipl?: number | null;
  } | null;
  lonksamhet?: {
    roe?: number | null;
    roic?: number | null;
    bruttoMarginal?: number | null;
    nettoMarginal?: number | null;
  } | null;
  tillvaxt?: {
    omsattningCAGR5ar?: number | null;
    resultatCAGR5ar?: number | null;
    prognosTillvaxt?: number | null;
    omsattningTillvaxtTTM?: number | null;
  } | null;
  stabilitet?: {
    skuldEgenkapital?: number | null;
  } | null;
};

/** Statistikutfall — identisk metod för alla aspekter (sammanfatta nedan). */
export type AspektStat = {
  /** Antal bolag med ändligt mätt värde (grund för gränsregeln). */
  matta: number;
  median: number | null;
  p25: number | null;
  p75: number | null;
  min: number | null;
  max: number | null;
};

/**
 * En färdig aspektsida. Procenttal levereras OMVANDLADE (råandel 0,3262 →
 * 32,6, en decimal); multipler med en decimal. Disclaimern trycks av VYN
 * ("Pedagogisk analys — inte investeringsråd.") på varje sida — därför finns
 * den inte i datatypen.
 */
export type AspektSida = {
  /** Modulens egen slug (del av URL:en efter /dataset/[bransch]/). */
  aspekt: string;
  /** Bransch-slug (branschUrSlug-världen, t.ex. "teknik"). */
  bransch: string;
  /** H1 + SEO-titel — mönster ur bransch-teman §4, ALDRIG rådformulering. */
  titel: string;
  /** Meta-description, ≤ 160 tecken. */
  beskrivning: string;
  /** 2–3 meningar Du-form, siffror ur statistiken, juridiksäker ton. */
  ingress: string;
  matta: number;
  median: number | null;
  p25: number | null;
  p75: number | null;
  min: number | null;
  max: number | null;
  /** Visningsenhet för huvudtalet (vyn formaterar procent/multipel). */
  enhet: "procent" | "multipl";
  /** "Så räknas talet" — 3–6 steg, reproducerbara. */
  saRaknas: string[];
  /** "Så läser du det" — 3–6 punkter, jämförbarhetsfällor inkluderade. */
  saLaserDu: string[];
  /** 2–4 vanliga misstolkningar (pedagogiskt, aldrig råd). */
  fellerAttUndvika: string[];
  /** 3–5 internlänkar (tema 8) — hittaKurslankar ur llms-fragor. */
  kurslankar: { titel: string; url: string }[];
  /**
   * Valfri flermätastabell för hub-sidor (land, värdering): etikett + en
   * färdig median per rad. Tom/undef för enkla nyckeltalssidor.
   */
  matTabell?: { etikett: string; median: number | null; matta: number; enhet: "procent" | "multipl" }[];
  /**
   * Universumjämförelse (fabrik s2-u2): SAMMA mått sammanfattat över HELA
   * universumet (alla branscher) — samma sammanfatta, samma konvention.
   * Ännu ett aggregat av publika nyckeltal (kontraktet §1: en kvartil av
   * marknadstal bär ingen AKM-poäng). Valfritt: hubbar med flermätastabeller
   * (land, värdering) bär det ej — deras jämförelse är land×bransch mot
   * bransch. Eftersom branschens värden är en delmängd av universumets gäller
   * alltid universum.matta >= matta när sidan publiceras (gränsregeln på
   * sidnivå skyddar därmed också universumstatistiken).
   */
  universum?: AspektStat & { antalBolag: number };
};

/** En aspektmodul — varje fabrikens barn implementerar sina egna slugs. */
export type AspektModule = {
  slug: string;
  /** Sidtitel för en bransch (parametern = branschens visningsnamn). */
  titel: (branschNamn: string) => string;
  /** null = okänd bransch (404) eller matta < MIN_MATTA (opublicerad —
   *  dubbelgrind inför u5:s vit-test; SLUTLED-registret fattar ändå
   *  publiceringsbeslutet via matta + MIN_MATTA). */
  generera: (branschSlug: string) => AspektSida | null;
};

/** Gränsregeln (peer-motorns princip): under detta antal mätta redovisas aldrig. */
export const MIN_MATTA = 5;

// ── Universumet (EN källa, modulcache) ──────────────────────────────────────

let universumCache: { hamtat: string | null; rader: AspektUniversumRad[] } | null = null;

/**
 * Läs bolagsunivers.json → publikt utsnitt (100 rader), cachat i modulminnet.
 * Kastar vid oläslig fil — en aspektsida ska ALDRIG tyst rendera påhittade
 * medianer.
 */
export function lasAspektUniversum(): { hamtat: string | null; rader: AspektUniversumRad[] } {
  if (universumCache) return universumCache;
  const fil = path.join(process.cwd(), "data", "portfolj-system", "bolagsunivers.json");
  const radata = JSON.parse(readFileSync(fil, "utf8")) as Array<AspektUniversumRad & { hamtat?: string | null }>;
  const rader = (Array.isArray(radata) ? radata : []).slice();
  rader.sort((a, b) => String(a.bransch ?? "").localeCompare(String(b.bransch ?? ""), "sv"));
  let hamtat: string | null = null;
  for (const r of radata) {
    if (typeof r?.hamtat === "string" && r.hamtat > (hamtat ?? "")) hamtat = r.hamtat;
  }
  universumCache = { hamtat, rader };
  return universumCache;
}

/** Nollställ universumcachen (testbarhet). */
export function resetAspektUniversumCache(): void {
  universumCache = null;
}

// ── Statistik — en metod för alla moduler ────────────────────────────────────

/**
 * Median/kvartiler/min/max + matta. iProcent=true ⇒ råandel (0–1) omvandlas
 * till procenttal med en decimal; annars multiplicel med en decimal. Saknad
 * data (null/undefined/±Infinity) räknas ALDRIG som noll — matta = antal
 * ändliga tal. Samma percentilkonvention (linjär interpolation) som
 * dataset-medianer — bransch- och landstal räknas identiskt.
 */
export function sammanfatta(
  varden: ReadonlyArray<number | null | undefined>,
  iProcent: boolean,
): AspektStat {
  const rena = varden.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const omv = (v: number | null): number | null =>
    v === null ? null : runda1(iProcent ? v * 100 : v);
  return {
    matta: rena.length,
    median: omv(median(rena)),
    p25: omv(percentil(rena, 0.25)),
    p75: omv(percentil(rena, 0.75)),
    min: rena.length > 0 ? omv(Math.min(...rena)) : null,
    max: rena.length > 0 ? omv(Math.max(...rena)) : null,
  };
}

/**
 * Universumjämförelse (fabrik s2-u2): samma fältextractor + samma enhet som
 * modulen använder för branschen, men sammanfattat över ALLA universumets
 * rader — bransch- och universumtal kan aldrig skilja sig åt i metod (samma
 * determinism-princip som lasAspektUniversum). antalBolag = universumets
 * storlek (100) för vyns "av N bolag"-rad.
 */
export function sammanfattaUniversum(
  hamtaVarde: (r: AspektUniversumRad) => number | null | undefined,
  iProcent: boolean,
): AspektStat & { antalBolag: number } {
  const { rader } = lasAspektUniversum();
  return { ...sammanfatta(rader.map(hamtaVarde), iProcent), antalBolag: rader.length };
}

// ── Internlänkar (tema 8) — llms-fragornas efterfrågan ───────────────────────

type FragRad = {
  fraga?: string | null;
  kategori?: string | null;
  sokvag?: string | null;
  slug?: string | null;
  poang?: number | null;
};

let fragorCache: FragRad[] | null = null;

function lasFragor(): FragRad[] {
  if (fragorCache) return fragorCache;
  const fil = path.join(process.cwd(), "data", "llms-fragor.json");
  const radata: unknown = JSON.parse(readFileSync(fil, "utf8"));
  const lista = Array.isArray(radata)
    ? (radata as FragRad[])
    : ((Object.values(radata as Record<string, unknown>).find((v) => Array.isArray(v)) ?? []) as FragRad[]);
  fragorCache = lista;
  return lista;
}

/**
 * 3–5 kurslänkar per aspekt: matchar sökorden mot frågans kategori/frågetext
 * och rangordnar på termträffar först, sedan filens egna sökpoäng (sök-
 * volymspotential). Deterministiskt (poäng desc, sokvag asc som tie-break),
 * unika kurser. Titeln = frågetexten — den pedagogiska frågan är länktext.
 */
export function hittaKurslankar(
  sokord: ReadonlyArray<string>,
  max = 4,
): { titel: string; url: string }[] {
  const termer = sokord.map((s) => s.toLowerCase()).filter((s) => s.trim() !== "");
  const poangade: { f: FragRad; p: number }[] = [];
  for (const f of lasFragor()) {
    const kategori = String(f.kategori ?? "").toLowerCase();
    const fraga = String(f.fraga ?? "").toLowerCase();
    let traffar = 0;
    for (const t of termer) if (kategori.includes(t) || fraga.includes(t)) traffar += 1;
    if (traffar === 0) continue;
    poangade.push({ f, p: traffar * 1000 + (typeof f.poang === "number" ? f.poang : 0) });
  }
  poangade.sort(
    (a, b) => b.p - a.p || String(a.f.sokvag ?? "").localeCompare(String(b.f.sokvag ?? ""), "sv"),
  );
  const ut: { titel: string; url: string }[] = [];
  const sedda = new Set<string>();
  for (const { f } of poangade) {
    const url = String(f.sokvag ?? "");
    if (url === "" || sedda.has(url)) continue;
    sedda.add(url);
    ut.push({ titel: String(f.fraga ?? url), url });
    if (ut.length >= max) break;
  }
  return ut;
}
