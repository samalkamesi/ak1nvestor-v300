import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// ── BOLAGSSIDORNA (VÅG 149 — B1 i SOKORDSINVENTERING-2026) ─────────────────
//
// Datalager för /bolag + /bolag/{slug}: programmatiska nyckeltalssidor —
// en per rad i data/portfolj-system/bolagsunivers.json (antalet följer
// dataleveranserna; o148: ytor talar datadrivet, aldrig "100").
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
 * Läs alla bolagssidor, cachat i modulminnet (ett fs-pass per process —
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

// ── PUBLICERINGSKONTRAKTET (o146) ───────────────────────────────────────────
//
// ROTFEL (bevisat 2026-09-21): rutten /bolag/[slug] är byggfryst enligt våg
// 81-doktrinen (dynamicParams = false är RÖR EJ: true ger i Next 16 soft-404
// — notFound-HTML med HTTP 200, prodmätt 2026-09-07). Samtidigt läste
// sitemap (force-dynamic) och /bolag-registret (ISR) universumfilen LIVE.
// När dataleveranser växer universumet utan deploy (data-doktrinen — rätta
// protokollet!) lovade live-ytorna sidor som rutten 404:ade: 2026-09-21
// 249 lovade mot 243 byggda = 6 döda löften (ai-pa, barc-l, cap-pa, dsy-pa,
// lloy-l, nwg-l — gränsnittsvaktens 24 konsolfynd i svepet 11:30Z).
//
// KUR: bygget är sanningen om vad som existerar. generateStaticParams
// skriver ned de byggda slugs till data/cache/bolags-publicerade.json
// (gitignorad runtime-cache, våg 121-mönstret: skrivfel kastar ALDRIG) och
// live-ytorna (sitemap, registret, syskonlänkar) lovar ENDAST dessa.
// Saknas/ogiltig cache faller allt tillbaka på hela universumet = dagens
// beteende — kontraktet degraderar mjukt, aldrig hårt.

const PUBLICERAD_FIL = path.join(
  process.cwd(),
  "data",
  "cache",
  "bolags-publicerade.json",
);

/** Byggets nedteckning — anropas ENDAST från generateStaticParams (o146). */
export function skrivPubliceradeSlugs(slugs: string[]): void {
  try {
    mkdirSync(path.dirname(PUBLICERAD_FIL), { recursive: true });
    writeFileSync(
      PUBLICERAD_FIL,
      JSON.stringify({ ts: new Date().toISOString(), slugs }, null, 2),
    );
  } catch {
    // Våg 121: cachen är en accelerator, aldrig ett beroende — bygget
    // fortsätter; live-ytornas fallback håller beteendet som idag.
  }
}

/** Slugs med byggd sida (senaste byggets nedteckning). Fallback: hela universumet. */
export function publiceradeBolagSlugs(): string[] {
  try {
    const parsad = JSON.parse(readFileSync(PUBLICERAD_FIL, "utf8")) as {
      slugs?: unknown;
    };
    if (
      Array.isArray(parsad.slugs) &&
      parsad.slugs.length > 0 &&
      parsad.slugs.every((s) => typeof s === "string" && s.trim() !== "")
    ) {
      return parsad.slugs;
    }
  } catch {
    // Saknas/ogiltig nedteckning → live-ytorna lovar hela universumet
    // (dagens beteende) tills nästa bygge skriver kontraktet.
  }
  return bolagSlugs();
}

/** Bolagssidor med byggd sida — registret och syskonlänkarnas källa (o146). */
export function publiceradeBolagSidor(): BolagSida[] {
  const publicerade = new Set(publiceradeBolagSlugs());
  return lasBolagsSidor().filter((s) => publicerade.has(s.slug));
}

/** Sidan för en slug — null om bolaget inte finns (rutten svarar 404). */
export function bolagUrSlug(slug: string): BolagSida | null {
  return lasBolagsSidor().find((s) => s.slug === slug) ?? null;
}

/** Bolag i samma bransch (exklusive sig själv) — syskonlänkarna.
 *  o146: enbart publicerade syskon — en ISR-revalidaterad sida får aldrig
 *  länka till ett universumbolag vars sida ännu inte byggts. */
export function syskonBolag(slug: string): BolagSida[] {
  const sida = bolagUrSlug(slug);
  if (!sida) return [];
  return publiceradeBolagSidor().filter(
    (s) => s.bransch === sida.bransch && s.slug !== slug,
  );
}

/** Nollställ minnes-cachen (testbarhet). */
export function resetBolagsSidCache(): void {
  sidCache = null;
}
