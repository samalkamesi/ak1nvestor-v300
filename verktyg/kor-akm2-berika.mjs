#!/usr/bin/env node
/**
 * AK1A — VÅG 57 D2: AKM2-berikning av korstabellen (ren TS via tsx — src/ rörs
 * bara av läsning; ALDRAK kärnan src/lib/akm2/ som importeras).
 *
 * KLARGÖRANDE (uppdragets fråga): korstabell-grund.json byggs av
 *   verktyg/python/sammanstalla_korstabell.py (P6 — AKM1 + FVag ur cacher),
 * och FORSKNINGSBIBLIOTEKET byggs av verktyg/kor-analysfabrik.mjs (våg 56).
 * Detta verktyg är steget EMELLAN: det berikar P6:s färdiga korstabellrader
 * med AKM2 (som bara kan beräknas i TS — kärnan är importerbar hit men inte
 * till Python) och lämnar per-bolags-cacher som analysfabriken konsumerar.
 *
 * Mönstret är detsamma som verktyg/kor-fvag.mjs:
 *   1. Genererar tmp_akm2_berika.ts i repots rot — importerar
 *      src/lib/portfolj-forskning/akm2-koppling.ts (som i sin tur importerar
 *      den O RÖRDA AKM2-kärnan src/lib/akm2/) och loopar universet.
 *   2. Kör den med: npx --yes tsx .tmp/tmp_akm2_berika.ts
 *   3. Skriver:
 *      a) data/cache/akm2-{TICKER}.json — fullt AKM2Resultat (schema
 *         akm2-resultat-v1) + serialiserbar Akm2Profil per bolag
 *      b) data/portfolj-system/korstabell-grund.json — VARBJE rad berikas
 *         additivt: akm2, akm2Skillnad, akm2Moduler (befintliga fält rörs ej;
 *         rad-ordning och P6-metadata bevaras, "akm2Berikad" sätts i roten)
 *
 * ÄRLIGHET: bolag utan nyckeltalspost lämnas med akm2/akm2Skillnad = null och
 * tom modullista — verktyget hittar aldrig på siffror. DETERMINISM: kärnan är
 * deterministisk (datum ur k.hamtat) och skrivningen är strukturstabil.
 *
 * Användning:  node verktyg/kor-akm2-berika.mjs
 * Förutsättning: data/portfolj-system/{bolagsunivers,korstabell-grund}.json.
 * Avslutskod:  0 om alla rader behandlades, 1 annars.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_TS = path.join(REPO, ".tmp", "tmp_akm2_berika.ts");
const CACHE = path.join(REPO, "data", "cache");
const KORSTABELL = path.join(REPO, "data", "portfolj-system", "korstabell-grund.json");
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// Obs: ingen backticks/${} inuti denna String.raw-literal.
const TS_KOD = String.raw`// tmp_akm2_berika.ts — GENERERAD av verktyg/kor-akm2-berika.mjs. Raderas efter körning.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import {
  berikaRadMedAkm2,
  raknaAkm2ForNyckeltal,
  akm2ProfilUr,
  AKM2_VIKTPROFIL,
} from "../src/lib/portfolj-forskning/akm2-koppling";
import type { BolagsNyckeltal, KorstabbellRad } from "../src/lib/portfolj-forskning/typer";

// Sanera ticker till filnamn (samma mönster som kor-fvag/analysfabriken):
// endast [A-Za-z0-9._-] tillåts, '..' och punktprefix avvisas, '.' → '_'.
function tickerFil(ticker: string): string {
  if (!ticker || ticker.includes("..")) throw new Error("ogiltig ticker: " + ticker);
  const rensat = ticker.replace(/[^A-Za-z0-9._-]/g, "_");
  if (!rensat || rensat.startsWith(".")) throw new Error("ogiltig ticker efter sanering: " + ticker);
  return rensat.replace(/\./g, "_");
}

const univers: BolagsNyckeltal[] = JSON.parse(
  readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"),
);
const nyckeltal = new Map(univers.map((k) => [k.ticker, k]));
const korstabell = JSON.parse(readFileSync("data/portfolj-system/korstabell-grund.json", "utf8"));
const rader: KorstabbellRad[] = korstabell.rader ?? [];
mkdirSync("data/cache", { recursive: true });

let berikade = 0;
let saknade = 0;
let cacher = 0;
let modulRaknare: Record<string, number> = {};
let skillnadSumma = 0;
let skillnadAntal = 0;
let hojda = 0;
let sankta = 0;

const nyaRader = rader.map((rad) => {
  const k = nyckeltal.get(rad.ticker);
  if (!k) {
    saknade += 1;
    return berikaRadMedAkm2(rad, null);
  }
  const resultat = raknaAkm2ForNyckeltal(k);
  writeFileSync(
    "data/cache/akm2-" + tickerFil(rad.ticker) + ".json",
    JSON.stringify(
      {
        schema: "akm2-resultat-v1",
        genereradAv: "verktyg/kor-akm2-berika.mjs (vag 57 D2)",
        viktprofil: AKM2_VIKTPROFIL,
        profil: akm2ProfilUr(resultat),
        resultat: resultat,
      },
      null,
      1,
    ) + "\n",
    "utf8",
  );
  cacher += 1;
  for (const m of resultat.lager2.aktiveradeModuler) {
    modulRaknare[m.modulId] = (modulRaknare[m.modulId] ?? 0) + 1;
  }
  const berikad = berikaRadMedAkm2(rad, k);
  if (berikad.akm2Skillnad !== null && berikad.akm2Skillnad !== undefined) {
    skillnadSumma += berikad.akm2Skillnad;
    skillnadAntal += 1;
    if (berikad.akm2Skillnad > 0) hojda += 1;
    if (berikad.akm2Skillnad < 0) sankta += 1;
  }
  berikade += 1;
  return berikad;
});

korstabell.rader = nyaRader;
korstabell.akm2Berikad = "2026-09-04";
korstabell.akm2Regler = {
  kalla: "data/portfolj-system/bolagsunivers.json via src/lib/portfolj-forskning/akm2-koppling.ts",
  formel: 'akm2 = raknaAKM2(nyckeltal, { moduler: automatiska ur modulregistret (branschmatchning), viktprofil: "akm2-2026" }).komposit',
  skillnad: "akm2Skillnad = akm2 - akm1Totalt (1 decimal) — differens mot P6:s publicerade viktade AKM1-total",
  moduler: "akm2Moduler = branschmodulernas namn ur src/lib/akm2/moduler (aktiverade per bolagets bransch)",
  osatt: "nyckeltal saknas => akm2/akm2Skillnad = null och akm2Moduler = [] (verktyget gissar aldrig)",
  cache: "data/cache/akm2-{TICKER}.json (schema akm2-resultat-v1) — fullt resultat + serialiserbar profil",
};
writeFileSync(
  "data/portfolj-system/korstabell-grund.json",
  JSON.stringify(korstabell, null, 1) + "\n",
  "utf8",
);

const medel = skillnadAntal > 0 ? Math.round((skillnadSumma / skillnadAntal) * 10) / 10 : 0;
console.log("[kor-akm2-berika] berikade " + berikade + " rader (" + saknade + " saknade nyckeltal)");
console.log("[kor-akm2-berika] skrev " + cacher + " akm2-cacher till data/cache/");
console.log("[kor-akm2-berika] modulfordelning: " + JSON.stringify(modulRaknare));
console.log("[kor-akm2-berika] skillnad mot AKM1: medel " + medel + " | hojda " + hojda + " | sankta " + sankta + " | " + skillnadAntal + " med tal");
`;

// ── Generera tmp-fil, kör via tsx, städa ────────────────────────────────────
try {
    mkdirSync(path.dirname(TMP_TS), { recursive: true }); // o44: engångszonen finns alltid
  writeFileSync(TMP_TS, TS_KOD, "utf8");
  mkdirSync(CACHE, { recursive: true });
  console.log("[kor-akm2-berika] kör npx --yes tsx .tmp/tmp_akm2_berika.ts ...");
  const barn = spawnSync("npx", ["--yes", "tsx", ".tmp/tmp_akm2_berika.ts"], {
    cwd: REPO,
    shell: true,
    encoding: "utf8",
    timeout: TIMEOUT_MS,
    env: { ...process.env, NO_COLOR: "1" },
  });
  const ut = (barn.stdout ?? "") + ((barn.stderr ?? "") ? "\n--stderr--\n" + barn.stderr : "");
  process.stdout.write(ut);
  if (barn.error) {
    console.error("[kor-akm2-berika] kunde inte köra tsx: " + barn.error.message);
    process.exitCode = 1;
  } else if (barn.status !== 0) {
    console.error("[kor-akm2-berika] tsx avslutade med kod " + barn.status);
    process.exitCode = 1;
  }
} finally {
  try {
    unlinkSync(TMP_TS);
  } catch {
    /* fanns inte — ok */
  }
}
console.log("[kor-akm2-berika] klart. Pedagogisk forskning — ALDRIG investeringsråd.");
