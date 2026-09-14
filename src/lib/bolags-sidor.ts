import { readFileSync } from "node:fs";
import path from "node:path";

// ── BOLAGSSIDORNA (VÅG 149 — B1 i SOKORDSINVENTERING-2026) ─────────────────
//
// Datalager för /bolag + /bolag/{slug}: 100 programmatiska nyckeltalssidor,
// en per rad i data/portfolj-system/bolagsunivers.json.
//
// GRÄNSVAKT (A2-DATASET-KONTRAKT §1): publik yta = bolagets RÅNYCKELTAL +
// avvikelse mot branschmedian + källor + datering. AKM2-komposit, band,
// per-kategori-poäng och allt annat som bär AKM-poäng syndikeras ALDRIG
// hit (kontraktet: "gränsen dras vid poänglagen" — poänglagret är
// prenumerationsvärdet och levereras endast via /portfolj-forskning).
// Därför läser detta lager ENBAST bolagsunivers.json — data/cache/akm2-*
// är gitignore:ade och berörs aldrig. Typen nedan är den andra vakten:
// ett strukturellt utsnitt av publika nyckeltal — precis som
// DatasetUniversumRad i dataset-medianer.ts finns ingen väg hit från
// poängfält, serier eller noteringar.
//
// STOPPREGEL B (SOKORDSINVENTERING-2026 §3): PREC.ST:s recommendation/
// priceTarget-fält får ALDRIG syndikeras till programmatiska sidor.
// Verifierat 2026-09-14: bolagsunivers.json innehåller inga recommendation-,
// priceTarget-, rekommendation- eller kursmålsfält (de lever i
// data/analyses/ och data/stocks/, som detta lager aldrig berör).
//
// All visning är utbildningsdata (nyckeltal + avvikelse mot branschmedian),
// ALDRIG investeringsråd (lagen 2007:528 — juridikgrinden).

/** Publikt nyckeltalsutsnitt av en rad i bolagsunivers.json. */
type UniversumRad = {
  ticker?: string;
  namn?: string;
  bransch?: string;
  land?: string;
  valuta?: string;
  hamtat?: string;
  kallor?: Array<{ namn?: string } | null> | null;
  pris?: number | null;
  marknadsKapitalMdr?: number | null;
  vardering?: {
    pe?: number | null;
    pb?: number | null;
    evEbit?: number | null;
    peg?: number | null;
    fcfYield?: number | null;
  } | null;
  lonksamhet?: {
    roe?: number | null;
    roic?: number | null;
    bruttoMarginal?: number | null;
    ebitMarginal?: number | null;
    nettoMarginal?: number | null;
    fcfMarginal?: number | null;
  } | null;
  tillvaxt?: {
    omsattningCAGR5ar?: number | null;
    resultatCAGR5ar?: number | null;
    omsattningTillvaxtTTM?: number | null;
    prognosTillvaxt?: number | null;
  } | null;
  stabilitet?: { skuldEgenkapital?: number | null } | null;
};

/** En färdig bolagssida — universumradens publika nyckeltal, inget annat. */
export type BolagSida = {
  /** Ticker med punkt (HM-B.ST) — kanonisk nyckel, aldrig URL. */
  ticker: string;
  /** URL-slug: ticker lowercase med punkter → streck (hm-b-st). */
  slug: string;
  namn: string;
  bransch: string;
  land: string;
  valuta: string;
  hamtat: string | null;
  kallor: string[];
  pris: number | null;
  marknadsKapitalMdr: number | null;
  pe: number | null;
  pb: number | null;
  evEbit: number | null;
  peg: number | null;
  fcfYield: number | null;
  roe: number | null;
  roic: number | null;
  bruttoMarginal: number | null;
  ebitMarginal: number | null;
  nettoMarginal: number | null;
  fcfMarginal: number | null;
  omsattningCAGR5ar: number | null;
  resultatCAGR5ar: number | null;
  omsattningTillvaxtTTM: number | null;
  prognosTillvaxt: number | null;
  skuldEgenkapital: number | null;
};

// ── Inläsning med minnes-cache (samma mönster som lasBranschMedianer) ───────

let sidCache: BolagSida[] | null = null;

function num(v: number | null | undefined): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function str(v: string | null | undefined): string | null {
  return typeof v === "string" && v.trim() !== "" ? v : null;
}

/**
 * Läs alla 100 bolagssidor, cachat i modulminnet (ett fs-pass per process —
 * build och varje ISR-fönster delar läsningen). Kastar vid oläslig
 * universumfil — en halvtrasig bolagsmeny är värre än inget bygge.
 */
export function lasBolagsSidor(): BolagSida[] {
  if (sidCache) return sidCache;
  const fil = path.join(process.cwd(), "data", "portfolj-system", "bolagsunivers.json");
  const rader = JSON.parse(readFileSync(fil, "utf8")) as UniversumRad[];

  const sidor: BolagSida[] = [];
  for (const r of Array.isArray(rader) ? rader : []) {
    const ticker = str(r.ticker);
    if (!ticker) continue;
    sidor.push({
      ticker,
      slug: ticker.toLowerCase().replace(/\./g, "-"),
      namn: str(r.namn) ?? ticker,
      bransch: str(r.bransch) ?? "osatt",
      land: str(r.land) ?? "—",
      valuta: str(r.valuta) ?? "—",
      hamtat: str(r.hamtat),
      kallor: (Array.isArray(r.kallor) ? r.kallor : [])
        .map((k) => str(k?.namn))
        .filter((n): n is string => n !== null)
        .filter((n, i, a) => a.indexOf(n) === i),
      pris: num(r.pris),
      marknadsKapitalMdr: num(r.marknadsKapitalMdr),
      pe: num(r.vardering?.pe),
      pb: num(r.vardering?.pb),
      evEbit: num(r.vardering?.evEbit),
      peg: num(r.vardering?.peg),
      fcfYield: num(r.vardering?.fcfYield),
      roe: num(r.lonksamhet?.roe),
      roic: num(r.lonksamhet?.roic),
      bruttoMarginal: num(r.lonksamhet?.bruttoMarginal),
      ebitMarginal: num(r.lonksamhet?.ebitMarginal),
      nettoMarginal: num(r.lonksamhet?.nettoMarginal),
      fcfMarginal: num(r.lonksamhet?.fcfMarginal),
      omsattningCAGR5ar: num(r.tillvaxt?.omsattningCAGR5ar),
      resultatCAGR5ar: num(r.tillvaxt?.resultatCAGR5ar),
      omsattningTillvaxtTTM: num(r.tillvaxt?.omsattningTillvaxtTTM),
      prognosTillvaxt: num(r.tillvaxt?.prognosTillvaxt),
      skuldEgenkapital: num(r.stabilitet?.skuldEgenkapital),
    });
  }
  sidCache = sidor;
  return sidor;
}

/** Alla slugs i deterministisk ordning — generateStaticParams äter detta. */
export function bolagSlugs(): string[] {
  return lasBolagsSidor().map((s) => s.slug);
}

/** Sidan för en slug — null om bolaget inte finns (rutten svarar 404). */
export function bolagUrSlug(slug: string): BolagSida | null {
  return lasBolagsSidor().find((s) => s.slug === slug) ?? null;
}

/** Bolag i samma bransch (exklusive sig själv) — syskonlänkarna. */
export function syskonBolag(slug: string): BolagSida[] {
  const sida = bolagUrSlug(slug);
  if (!sida) return [];
  return lasBolagsSidor().filter((s) => s.bransch === sida.bransch && s.slug !== slug);
}

/** Nollställ minnes-cachen (testbarhet). */
export function resetBolagsSidCache(): void {
  sidCache = null;
}
