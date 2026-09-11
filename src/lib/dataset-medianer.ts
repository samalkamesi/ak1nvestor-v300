/**
 * DATASET-MEDIANER — branschmedianer för de publika datasetsidorna /dataset
 * (VÅG 97 E1, DATASET-CITERINGSMAGNETER · VÅG 98 F2, DATASET-DJUP).
 *
 * GRÄNSDRAGNING (A2-DATASET-KONTRAKT §1 — oföränderlig princip):
 *  - PUBLIKT: median P/E, P/B, EBIT-marginal, FCF-marginal och
 *    omsättningstillväxt PER BRANSCH med n-redovisning — aggregat av publikt
 *    källmaterial (Yahoo/MarketStack). Gränsen dras vid poänglagen: inget
 *    som bär AKM-poäng (även som median) är publikt.
 *  - VÅG 98 F2-tillägget — kvartiler (P25/P75) och universummedianer — är
 *    AGGREGAT AV SAMMA PUBLIKA NYCKELTAL och bryter alltså INTE mot
 *    kontraktet: en kvartil av publika marknadstal bär ingen AKM-poäng och
 *    kan inte triangulera en bolagsbedömning (samma argument som medianen,
 *    kontraktet §1 tabellrad 1).
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

/** En branschrad i datasettet — median + kvartiler + observationsantal per nyckeltal. */
export type DatasetMedianRad = {
  /** Branschnyckel (= URL-slug; filens egna nycklar är redan URL-säkra). */
  bransch: string;
  /** Antal bolag i branschen i universumet (urvalskriteriets 10). */
  antalBolag: number;
  medianPe: number | null;
  /** VÅG 98 F2: 25:e percentilen — nedre kvartilen av branschens P/E-värden. */
  p25Pe: number | null;
  /** VÅG 98 F2: 75:e percentilen — övre kvartilen. */
  p75Pe: number | null;
  nPe: number;
  medianPb: number | null;
  p25Pb: number | null;
  p75Pb: number | null;
  nPb: number;
  /** EBIT-marginal i PROCENT (rådata är andel, 0,3262 → 32,6). */
  medianEbitMarginal: number | null;
  p25EbitMarginal: number | null;
  p75EbitMarginal: number | null;
  nEbitMarginal: number;
  /** FCF-marginal i PROCENT (rådata är andel). */
  medianFcfMarginal: number | null;
  p25FcfMarginal: number | null;
  p75FcfMarginal: number | null;
  nFcfMarginal: number;
  /** Omsättningstillväxt TTM i PROCENT (rådata är andel). */
  medianTillvaxt: number | null;
  p25Tillvaxt: number | null;
  p75Tillvaxt: number | null;
  nTillvaxt: number;
};

/** Hela datasettet — sidorna, JSON-LD:n och llms.txt-sektionen läser detta. */
export type BranschMedianer = {
  /** Senaste hämtdatum i rådatan (max per rad — treskiktad datering, lager 1). */
  hamtat: string | null;
  kallorRadata: string[];
  /**
   * Universumets medianer (VÅG 98 F2:s jämförelsevy): median per nyckeltal
   * över ALLA bolag — ännu ett aggregat av publika nyckeltal, kontraktet OK.
   * nMed* = antal bolag med mätt värde (samma ärlighetsprincip som rader).
   */
  totalt: {
    nBolag: number;
    nMedPe: number;
    medianPe: number | null;
    nMedPb: number;
    medianPb: number | null;
    nMedEbitMarginal: number;
    medianEbitMarginal: number | null;
    nMedFcfMarginal: number;
    medianFcfMarginal: number | null;
    nMedTillvaxt: number;
    medianTillvaxt: number | null;
  };
  /** Deterministiskt sorterad: branschnyckel i svensk kollation. */
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
 * Percentil med linjär interpolation mellan närmaste ranker (numpy/excel-
 * konventionen): position (n−1)·p, brytningsdel interpoleras. För n=10 hamnar
 * P25 = s[2] + 0,25·(s[3]−s[2]) — varje observation räknas, inga nyckeltal
 * hittas på. Deterministisk och ren som median() i dataset-nyckeltal; null/
 * undefined/±Infinity är saknad data och exkluderas. p ∈ [0,1] (0,25/0,75 här).
 */
export function percentil(
  varden: ReadonlyArray<number | null | undefined>,
  p: number,
): number | null {
  const rena = varden.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (rena.length === 0) return null;
  const s = [...rena].sort((a, b) => a - b);
  const pos = (s.length - 1) * p;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return s[lo];
  return s[lo] + (pos - lo) * (s[hi] - s[lo]);
}

/** Median + kvartiler (P25/P75) + n per bransch för de fem publika nyckeltalen. */
function nyckeltalStat(varden: ReadonlyArray<number | null>, iProcent: boolean) {
  const omvandla = iProcent ? procent1Null : multipl1Null;
  return {
    median: omvandla(median(varden)),
    p25: omvandla(percentil(varden, 0.25)),
    p75: omvandla(percentil(varden, 0.75)),
    n: antalObrukliga(varden),
  };
}

/**
 * Median + kvartiler + n per bransch för de fem publika nyckeltalen. Ren
 * funktion: ingen fs, ingen klocka — deterministisk och testbar (vagvalide-
 * ringsmönstret). Ogiltiga rader (icke-objekt) hopas tyst; bransch saknas ⇒
 * "osatt". Universum-medianerna (totalt) räknas på SAMMA rena vektorer —
 * bransch- och universumtal kan aldrig skilja sig åt i metod.
 */
export function raknaBranschMedianer(rader: ReadonlyArray<DatasetUniversumRad>): BranschMedianer {
  const perBransch = new Map<string, DatasetUniversumRad[]>();
  const kallor = new Set<string>();
  let hamtat: string | null = null;
  let nBolag = 0;

  // Universums vektorer — samlas under samma loop som branschgrupperingen.
  const uPe: number[] = [];
  const uPb: number[] = [];
  const uEbit: number[] = [];
  const uFcf: number[] = [];
  const uTillvaxt: number[] = [];
  const mata = (ur: DatasetUniversumRad) => {
    for (const [v, ut] of [
      [ur.vardering?.pe, uPe],
      [ur.vardering?.pb, uPb],
      [ur.lonksamhet?.ebitMarginal, uEbit],
      [ur.lonksamhet?.fcfMarginal, uFcf],
      [ur.tillvaxt?.omsattningTillvaxtTTM, uTillvaxt],
    ] as Array<[number | null | undefined, number[]]>) {
      if (typeof v === "number" && Number.isFinite(v)) ut.push(v);
    }
  };

  for (const r of rader) {
    if (!r || typeof r !== "object") continue;
    const bransch = typeof r.bransch === "string" && r.bransch.trim() !== "" ? r.bransch : "osatt";
    if (!perBransch.has(bransch)) perBransch.set(bransch, []);
    perBransch.get(bransch)!.push(r);
    nBolag += 1;
    mata(r);
    if (typeof r.hamtat === "string" && r.hamtat > (hamtat ?? "")) hamtat = r.hamtat;
    for (const k of Array.isArray(r.kallor) ? r.kallor : []) {
      if (k && typeof k.namn === "string" && k.namn.trim() !== "") kallor.add(k.namn);
    }
  }

  const ut: DatasetMedianRad[] = [];
  for (const [bransch, bolag] of perBransch) {
    const pe = nyckeltalStat(bolag.map((b) => b.vardering?.pe ?? null), false);
    const pb = nyckeltalStat(bolag.map((b) => b.vardering?.pb ?? null), false);
    const ebit = nyckeltalStat(bolag.map((b) => b.lonksamhet?.ebitMarginal ?? null), true);
    const fcf = nyckeltalStat(bolag.map((b) => b.lonksamhet?.fcfMarginal ?? null), true);
    const tillvaxt = nyckeltalStat(bolag.map((b) => b.tillvaxt?.omsattningTillvaxtTTM ?? null), true);
    ut.push({
      bransch,
      antalBolag: bolag.length,
      medianPe: pe.median,
      p25Pe: pe.p25,
      p75Pe: pe.p75,
      nPe: pe.n,
      medianPb: pb.median,
      p25Pb: pb.p25,
      p75Pb: pb.p75,
      nPb: pb.n,
      medianEbitMarginal: ebit.median,
      p25EbitMarginal: ebit.p25,
      p75EbitMarginal: ebit.p75,
      nEbitMarginal: ebit.n,
      medianFcfMarginal: fcf.median,
      p25FcfMarginal: fcf.p25,
      p75FcfMarginal: fcf.p75,
      nFcfMarginal: fcf.n,
      medianTillvaxt: tillvaxt.median,
      p25Tillvaxt: tillvaxt.p25,
      p75Tillvaxt: tillvaxt.p75,
      nTillvaxt: tillvaxt.n,
    });
  }

  ut.sort((a, b) => a.bransch.localeCompare(b.bransch, "sv"));

  const uPeStat = nyckeltalStat(uPe, false);
  const uPbStat = nyckeltalStat(uPb, false);
  const uEbitStat = nyckeltalStat(uEbit, true);
  const uFcfStat = nyckeltalStat(uFcf, true);
  const uTillvaxtStat = nyckeltalStat(uTillvaxt, true);
  return {
    hamtat,
    kallorRadata: [...kallor],
    totalt: {
      nBolag,
      nMedPe: uPeStat.n,
      medianPe: uPeStat.median,
      nMedPb: uPbStat.n,
      medianPb: uPbStat.median,
      nMedEbitMarginal: uEbitStat.n,
      medianEbitMarginal: uEbitStat.median,
      nMedFcfMarginal: uFcfStat.n,
      medianFcfMarginal: uFcfStat.median,
      nMedTillvaxt: uTillvaxtStat.n,
      medianTillvaxt: uTillvaxtStat.median,
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
