#!/usr/bin/env node
/**
 * AK1A — P6: kör fundamental-vågklassningen (FVagAnalys) för samtliga bolag
 * i data/portfolj-system/bolagsunivers.json via nod-motorn i
 * src/lib/portfolj-forskning/fundamental-vagmotor.ts (P2, klar).
 *
 * Mönstret är detsamma som verktyg/testa-fundamental-vagmotor.mjs:
 *   1. Genererar tmp_fvag_kor.ts i repots rot — en fil som importerar motorn
 *      och loopar hela universet (AKM1-bedömningen läses in per bolag så att
 *      poäng och motivering citeras i våganteckningarna — spårbarhet).
 *   2. Kör den med: npx --yes tsx tmp_fvag_kor.ts  (src/ rörs ALDRIG)
 *   3. Skriver data/cache/fvag-{TICKER}.json per bolag (ticker sanerad:
 *      ABB.ST → ABB_ST, samma mönster som P1:s sanera_filnamn) och städar
 *      tmp-filen.
 *
 * Användning:  node verktyg/kor-fvag.mjs
 * Förutsättning: data/cache/akm1-{TICKER}.json finns (verktyg/python/bedom_akm1.py).
 * Avslutskod:  0 om alla 100 skrevs, 1 annars.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_TS = path.join(REPO, "tmp_fvag_kor.ts");
const CACHE = path.join(REPO, "data", "cache");
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// Obs: ingen backticks/${} inuti denna String.raw-literal.
const TS_KOD = String.raw`// tmp_fvag_kor.ts — GENERERAD av verktyg/kor-fvag.mjs. Raderas efter körning.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { raknaFVag } from "./src/lib/portfolj-forskning/fundamental-vagmotor";
import { HORIZONTER } from "./src/lib/portfolj-forskning/typer";
import type { AKM1Bedomning, BolagsNyckeltal } from "./src/lib/portfolj-forskning/typer";

// Sanera ticker till filnamn (samma mönster som P1:s sanera_filnamn + punktbyte):
// endast [A-Za-z0-9._-] tillåts, '..' och punktprefix avvisas, punkt ersätts med '_'.
function tickerFil(ticker: string): string {
  if (!ticker || ticker.includes("..")) throw new Error("ogiltig ticker: " + ticker);
  const rensat = ticker.replace(/[^A-Za-z0-9._-]/g, "_");
  if (!rensat || rensat.startsWith(".")) throw new Error("ogiltig ticker efter sanering: " + ticker);
  return rensat.replace(/\./g, "_");
}

const univers: BolagsNyckeltal[] = JSON.parse(
  readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"),
);
mkdirSync("data/cache", { recursive: true });

let skrivna = 0;
let medAkm1 = 0;
let klassbaraSumma = 0;
const horisontRaknare: Record<string, Record<string, number>> = {};
for (const hz of HORIZONTER) horisontRaknare[hz] = { impulsvag: 0, korrigering: 0, basbygge: 0, osatt: 0 };
const dynamikRaknare: Record<string, number> = { forbattras: 0, stabilt: 0, forsvamras: 0, osatt: 0 };

for (const post of univers) {
  // AKM1-bedömningen läses om den finns — motorn citerar poäng + motivering.
  let akm1: AKM1Bedomning | undefined;
  try {
    akm1 = JSON.parse(readFileSync("data/cache/akm1-" + tickerFil(post.ticker) + ".json", "utf8"));
    medAkm1 += 1;
  } catch {
    akm1 = undefined; // ärlighet: kör utan citat snarare än att dö
  }

  const analys = raknaFVag(post, akm1);
  for (const hz of HORIZONTER) horisontRaknare[hz][analys.perHorisont[hz]] += 1;
  for (const v of Object.values(analys.perVariabel)) {
    if (v.klass !== "osatt") klassbaraSumma += 1;
    dynamikRaknare[v.dynamik] += 1;
  }

  writeFileSync(
    "data/cache/fvag-" + tickerFil(post.ticker) + ".json",
    JSON.stringify(analys, null, 1) + "\n",
    "utf8",
  );
  skrivna += 1;
}

console.log("FVAG KÖRNING — " + skrivna + " av " + univers.length + " bolag skrivna till data/cache/fvag-{TICKER}.json");
console.log("AKM1-citat inlästa för " + medAkm1 + " bolag");
console.log("Klassbara variabelinstanser totalt: " + klassbaraSumma + " av " + (univers.length * 20) + " (resten osatta — motorn gissar aldrig)");
for (const hz of HORIZONTER) {
  const r = horisontRaknare[hz];
  console.log("  " + hz + ": impulsvag " + r.impulsvag + " · korrigering " + r.korrigering + " · basbygge " + r.basbygge + " · osatt " + r.osatt);
}
console.log("Dynamik över alla variabelinstanser: förbättras " + dynamikRaknare.forbattras +
  " · stabilt " + dynamikRaknare.stabilt + " · försvagas " + dynamikRaknare.forsvamras + " · osatt " + dynamikRaknare.osatt);
console.log("Pedagogisk forskning — ALDRIG investeringsråd.");
process.exit(skrivna === univers.length && univers.length > 0 ? 0 : 1);
`;

// ── Generera tmp-fil, kör via tsx, städa ────────────────────────────────────
function main() {
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(TMP_TS, TS_KOD, "utf8");
  console.log("[kor-fvag] kör npx --yes tsx tmp_fvag_kor.ts ...");
  const barn = spawnSync("npx", ["--yes", "tsx", "tmp_fvag_kor.ts"], {
    cwd: REPO,
    stdio: "inherit",
    shell: true,
    timeout: TIMEOUT_MS,
  });
  try {
    unlinkSync(TMP_TS);
  } catch {
    /* tmp-filen fick inte skapas/fanns inte — inget att städa */
  }
  if (barn.error) {
    console.error("[kor-fvag] kunde inte köra tsx: " + barn.error.message);
    process.exit(1);
  }
  const kod = barn.status === null ? 1 : barn.status;
  console.log(
    "[kor-fvag] avslutskod " + kod +
    (kod === 0 ? " — samtliga FVagAnalyser skrivna" : " — körningen slutförde inte hela universet"),
  );
  process.exit(kod);
}

main();
