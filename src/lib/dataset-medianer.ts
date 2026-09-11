/**
 * DATASET-MEDIANER — branschmedianer för de publika datasetsidorna /dataset
 * (VÅG 97 E1, DATASET-CITERINGSMAGNETER mot STYRELSE-ADMIN-MEGA VÅG 97).
 *
 * GRÄNSDRAGNING (A2-DATASET-KONTRAKT §1 — oföränderlig princip):
 *  - PUBLIKT: median P/E, P/B, EBIT-marginal, FCF-marginal och
 *    omsättningstillväxt PER BRANSCH med n-redovisning — aggregat av publikt
 *    källmaterial (Yahoo/MarketStack). Gränsen dras vid poänglagen: inget
 *    som bär AKM-poäng (även som median) är publikt.
 *  - ALDRIG i utdata: per-bolagspoäng (AKM1/AKM2), vågklasser, status,
 *    golvMarginal, portV19 — och inga bolagsnamn/tickers. FUNKTIONERNA HÄR
 *    LÄSER ENBAST bransch/hamtat/kallor + de fem publika nyckeltalen ur
 *    universumsräderna; allt annat i filen är osynligt för denna modul.
 *
 * Delad källa med /data/nyckeltalsguide (våg 87): data/portfolj-system/
 * bolagsunivers.json — AKM2:s 100-bolagsuniversum (10 branscher × 10 bolag).
 * Statistikhjälparna (median/runda1/procent1) återanvänds ur dataset-nyckeltal
 * så att båda datasetmenyerna räknar IDENTISKT.
 *
 * Determinism: rader sorteras med localeCompare("sv") på branschnyckeln —
 * samma indata ⇒ byte-identisk utdata, vid uppbyggnad och ISR-omrendering.
 * lasBranschMedianer cachar i modulminnet (parse av 100 rader en gång per
 * process) — samma mönster som kalla.ts. Server-side: fs läses endast här.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { ORDLISTA, type SprakRad } from "./ordlista";
import { median, runda1 } from "./dataset-nyckeltal";

// ── Typer ────────────────────────────────────────────────────────────────────

/**
 * Strukturellt utsnitt av en bolagsrad i bolagsunivers.json — ENBAST de
 * publika fälten medianerna behöver. Vid medvetande om att filen innehåller
 * mer (poäng, serier, noter) är typen redan gränsvakten: det finns inget sätt
 * att nå det från denna modul.
 */
export type DatasetUniversumRad = {
  bransch?: string | null;
  hamtat?: string | null;
  kallor?: Array<{ namn?: string | null } | null> | null;
  vardering?: { pe?: number | null; pb?: number | null } | null;
  lonksamhet?: { ebitMarginal?: number | null; fcfMarginal?: number | null } | null;
  tillvaxt?: { omsattningTillvaxtTTM?: number | null } | null;
};

/** En branschrad i datasettet — median + observationsantal per nyckeltal. */
export type DatasetMedianRad = {
  /** Branschnyckel (= URL-slug; filens egna nycklar är redan URL-säkra). */
  bransch: string;
  /** Antal bolag i branschen i universumet (urvalskriteriets 10). */
  antalBolag: number;
  medianPe: number | null;
  nPe: number;
  medianPb: number | null;
  nPb: number;
  /** EBIT-marginal i PROCENT (rådata är andel, 0,3262 → 32,6). */
  medianEbitMarginal: number | null;
  nEbitMarginal: number;
  /** FCF-marginal i PROCENT (rådata är andel). */
  medianFcfMarginal: number | null;
  nFcfMarginal: number;
  /** Omsättningstillväxt TTM i PROCENT (rådata är andel). */
  medianTillvaxt: number | null;
  nTillvaxt: number;
};

/** Hela datasettet — sidorna, JSON-LD:n och llms.txt-sektionen läser detta. */
export type BranschMedianer = {
  /** Senaste hämtdatum i rådatan (max per rad — treskiktad datering, lager 1). */
  hamtat: string | null;
  kallorRadata: string[];
  totalt: { nBolag: number; nMedPe: number; medianPe: number | null };
  /** Deterministiskt sorterat: branschnyckel i svensk kollation. */
  rader: DatasetMedianRad[];
};

// ── Rena räknare ─────────────────────────────────────────────────────────────

/** Andel (0–1) → procenttal med 1 decimal; null är null (osatt är information). */
function procent1Null(v: number | null): number | null {
  return v === null ? null : runda1(v * 100);
}

/** Multipel (P/E, P/B) med 1 decimal; null är null. */
function multipl1Null(v: number | null): number | null {
  return v === null ? null : runda1(v);
}

/** n = antal ÄNDEliga, ändliga tal i fältet — saknad data räknas aldrig som noll. */
function antalObrukliga(varden: ReadonlyArray<number | null | undefined>): number {
  return varden.filter((v) => typeof v === "number" && Number.isFinite(v)).length;
}

/**
 * Median + n per bransch för de fem publika nyckeltalen. Ren funktion:
 * ingen fs, ingen klocka — deterministisk och testbar (vagvalidering-
 * mönstret). Ogiltiga rader (icke-objekt) hopas tyst; bransch saknas ⇒ "osatt".
 */
export function raknaBranschMedianer(rader: ReadonlyArray<DatasetUniversumRad>): BranschMedianer {
  const perBransch = new Map<string, DatasetUniversumRad[]>();
  const kallor = new Set<string>();
  let hamtat: string | null = null;
  let nBolag = 0;

  for (const r of rader) {
    if (!r || typeof r !== "object") continue;
    const bransch = typeof r.bransch === "string" && r.bransch.trim() !== "" ? r.bransch : "osatt";
    if (!perBransch.has(bransch)) perBransch.set(bransch, []);
    perBransch.get(bransch)!.push(r);
    nBolag += 1;
    if (typeof r.hamtat === "string" && r.hamtat > (hamtat ?? "")) hamtat = r.hamtat;
    for (const k of Array.isArray(r.kallor) ? r.kallor : []) {
      if (k && typeof k.namn === "string" && k.namn.trim() !== "") kallor.add(k.namn);
    }
  }

  const ut: DatasetMedianRad[] = [];
  const allaPe: number[] = [];
  for (const [bransch, bolag] of perBransch) {
    const pe = bolag.map((b) => b.vardering?.pe ?? null);
    for (const v of pe) if (typeof v === "number" && Number.isFinite(v)) allaPe.push(v);
    ut.push({
      bransch,
      antalBolag: bolag.length,
      medianPe: multipl1Null(median(pe)),
      nPe: antalObrukliga(pe),
      medianPb: multipl1Null(median(bolag.map((b) => b.vardering?.pb ?? null))),
      nPb: antalObrukliga(bolag.map((b) => b.vardering?.pb ?? null)),
      medianEbitMarginal: procent1Null(median(bolag.map((b) => b.lonksamhet?.ebitMarginal ?? null))),
      nEbitMarginal: antalObrukliga(bolag.map((b) => b.lonksamhet?.ebitMarginal ?? null)),
      medianFcfMarginal: procent1Null(median(bolag.map((b) => b.lonksamhet?.fcfMarginal ?? null))),
      nFcfMarginal: antalObrukliga(bolag.map((b) => b.lonksamhet?.fcfMarginal ?? null)),
      medianTillvaxt: procent1Null(median(bolag.map((b) => b.tillvaxt?.omsattningTillvaxtTTM ?? null))),
      nTillvaxt: antalObrukliga(bolag.map((b) => b.tillvaxt?.omsattningTillvaxtTTM ?? null)),
    });
  }

  ut.sort((a, b) => a.bransch.localeCompare(b.bransch, "sv"));

  const totalMedian = median(allaPe);
  return {
    hamtat,
    kallorRadata: [...kallor],
    totalt: {
      nBolag,
      nMedPe: allaPe.length,
      medianPe: totalMedian !== null ? runda1(totalMedian) : null,
    },
    rader: ut,
  };
}

// ── Inläsning med minnes-cache (server-side) ─────────────────────────────────

let lasCache: BranschMedianer | null = null;

/**
 * Läs bolagsunivers.json → BranschMedianer, cachat i modulminnet (100 rader
 * parsas en gång per process — build och varje ISR-fönster delar beräkningen).
 * Kastar vid oläslig fil — datasetmenyn ska ALDRIG tyst rendera tomma medianer.
 */
export function lasBranschMedianer(): BranschMedianer {
  if (lasCache) return lasCache;
  const fil = path.join(process.cwd(), "data", "portfolj-system", "bolagsunivers.json");
  const rader = JSON.parse(readFileSync(fil, "utf8")) as DatasetUniversumRad[];
  lasCache = raknaBranschMedianer(Array.isArray(rader) ? rader : []);
  return lasCache;
}

/** Nollställ minnes-cachen (testbarhet). */
export function resetDatasetMedianCache(): void {
  lasCache = null;
}

// ── Slug-hjälp för [bransch]-rutten ──────────────────────────────────────────

/** Alla branschslugs i deterministisk ordning — generateStaticParams äter detta. */
export function branschSlugs(m: BranschMedianer): string[] {
  return m.rader.map((r) => r.bransch);
}

/** Raden för en slug — null om branschen inte finns (rutten svarar 404). */
export function branschUrSlug(m: BranschMedianer, slug: string): DatasetMedianRad | null {
  return m.rader.find((r) => r.bransch === slug) ?? null;
}

// ── Visningsnamn (bransch-nyckel → ordlistans "dataset.bransch.*") ──────────

/**
 * Visningsnamn för en bransch-nyckel på ett språk (sv | en | ar), med sv som
 * fallback. Okänd nyckel (ny bransch i datan utan ordlistarad ännu) ⇒ nyckeln
 * rå — sidan visas ändå ärligt, aldrig tom. Borde i src/lib (inte bara i
 * vy-komponenten) eftersom även llms.txt-generatorn (seo.tsx) namnger
 * branscherna — EN enda namnkälla.
 */
export function branschNamn(lang: "sv" | "en" | "ar", slug: string): string {
  const rad = (ORDLISTA as Record<string, SprakRad | undefined>)[
    "dataset.bransch." + slug
  ];
  return rad ? rad[lang] || rad.sv : slug;
}
