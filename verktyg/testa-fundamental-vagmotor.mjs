#!/usr/bin/env node
/**
 * AK1A — Test av den fundamentala vågmotorn (fundamental-vagmotor.ts).
 *
 * Skriptet gör så här (node kan inte importera TS direkt — samma mönster som
 * verktyg/validera-motorer.mjs):
 *   1. Genererar tmp_fvag_koll.ts i repots rot — en fil som importerar motorn
 *      (src/lib/portfolj-forskning/fundamental-vagmotor.ts) och kör den mot
 *      fyra fixtures + enhetskontroller.
 *   2. Kör den med: npx --yes tsx .tmp/tmp_fvag_koll.ts
 *   3. Skriver ut en svensk rapport på stdout och städar tmp-filen.
 *
 * Fixtures:
 *   A. IMPULSVÅG   — syntetisk accelerating tillväxtserie (10 år)
 *   B. KORRIGERING — syntetisk cykelserie: uppgång, topp, tydlig nedgång
 *   C. BASBYGGE    — syntetisk sidledesserie med litet brus
 *   D. SKF-B.ST    — riktig post: nuvärden läses ur data/cache/analys-SKF_B_ST.json
 *                    (formatet där är den TEKNISKA motorns — inte BolagsNyckeltal —
 *                    så skalärerna återanvänds och serierna är återskapade demo-värden,
 *                    tydligt märkta i rapporten) + en AKM1-bedömning (Visar akm1-parametern)
 *   E. TOM POST    — inga serier: allt ska bli osatt (ärlighetsprincipen)
 *
 * Användning:  node verktyg/testa-fundamental-vagmotor.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_TS = path.join(REPO, ".tmp", "tmp_fvag_koll.ts");
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// ── 1) Genererad tmp-testfil (TS — körs via npx tsx, raderas efteråt) ────────
// Obs: ingen backticks/${} inuti denna String.raw-literal.
const TS_KOD = String.raw`// tmp_fvag_koll.ts — GENERERAD av verktyg/testa-fundamental-vagmotor.mjs. Raderas efter körning.
import { readFileSync } from "node:fs";
import {
  VARIABEL_KALLA,
  bedomDynamik,
  klassaVag,
  klassaVagDetaljerad,
  raknaFVag,
} from "../src/lib/portfolj-forskning/fundamental-vagmotor";
import { HORIZONTER } from "../src/lib/portfolj-forskning/typer";
import type { AKM1Bedomning, BolagsNyckeltal } from "../src/lib/portfolj-forskning/typer";

const HZ_SV = { mikro: "mikro", kort: "kort", medellang: "medellång", lang: "lång", mega: "mega" };
const AR = ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];

type Kontroll = { namn: string; ok: boolean; detalj: string };
const KOLL: Kontroll[] = [];
function kolla(namn: string, faktiskt: unknown, forvantat: unknown): void {
  const ok = faktiskt === forvantat;
  KOLL.push({ namn, ok, detalj: "faktiskt=" + String(faktiskt) + ", förväntat=" + String(forvantat) });
  console.log("  " + (ok ? "PASS" : "FAIL") + " | " + namn + " => " + String(faktiskt) +
    (ok ? "" : " (förväntat " + String(forvantat) + ")"));
}
function rubrik(t: string): void {
  console.log("");
  console.log("== " + t + " " + "=".repeat(Math.max(4, 74 - t.length)));
}
function visa(analys: ReturnType<typeof raknaFVag>): void {
  console.log("  perHorisont: " + HORIZONTER.map((h) => h + "=" + analys.perHorisont[h]).join(" "));
  for (const vk of VARIABEL_KALLA) {
    const v = analys.perVariabel[vk.id];
    const tag = v.klass === "osatt" && !vk.serie ? "osatt (ingen serie)" : v.klass;
    console.log("  " + vk.id + " " + vk.namn.padEnd(34) + " klass=" + String(tag).padEnd(20) + " dynamik=" + v.dynamik);
  }
  console.log("  totalText: " + analys.totalText);
}

// — Fixtures enligt typer.ts (BolagsNyckeltal) ————————————————————————————
function fixt(ticker: string, namn: string, bransch: BolagsNyckeltal["bransch"], serier: BolagsNyckeltal["serier"]): BolagsNyckeltal {
  return {
    ticker, namn, bransch, land: "Sverige", valuta: "SEK",
    kallor: [
      { namn: "Yahoo Finance", hamtat: "2026-09-01" },
      { namn: "MarketStack", hamtat: "2026-09-01" },
    ],
    hamtat: "2026-09-01",
    pris: 100, marknadsKapitalMdr: 10,
    tillvaxt: { omsattningCAGR5ar: 0.12, resultatCAGR5ar: 0.15, omsattningTillvaxtTTM: 0.11, prognosTillvaxt: 0.1 },
    lonksamhet: { roe: 0.15, roic: 0.12, bruttoMarginal: 0.35, ebitMarginal: 0.15, nettoMarginal: 0.1, fcfMarginal: 0.08 },
    stabilitet: { skuldEgenkapital: 0.5, rantaTackning: 8, fcfPositivaSenaste5: 5, kassaManaderBurnRate: 240, nyemissionerSenaste5ar: 0 },
    aterkop: { senasteArMdr: 0.5, andelUtestande: 0.01, insiderkopSenaste6man: 2 },
    moat: { bruttoMarginalMedel5ar: 0.34, bruttoMarginalSpread5ar: 0.02, roeMedel5ar: 0.14 },
    vardering: { pe: 20, pb: 3, evEbit: 12, peg: 1.5, fcfYield: 0.05, egenKapitalMultipl: 3 },
    golv: { typ: "reim", vardePerAktie: 60, marginal: 0.4 },
    serier,
  };
}

// A. IMPULSVÅG — accelererande tillväxt (alla serier monotona och styvare än linjära)
const impulsvagFixt = fixt("IMPULS-DEMO.ST", "Nordisk Tillväxtbolag AB (demo)", "tillvaxt", {
  ar: AR,
  omsattning: [10, 10.5, 11.3, 12.5, 14.2, 16.5, 19.5, 23.4, 28.1, 34.0],
  resultat: [1.0, 1.13, 1.3, 1.52, 1.82, 2.22, 2.75, 3.45, 4.35, 5.5],
  egetKapital: [8.0, 8.7, 9.5, 10.5, 11.8, 13.5, 15.7, 18.4, 21.8, 26.0],
  fcf: [0.8, 0.92, 1.07, 1.26, 1.51, 1.83, 2.24, 2.76, 3.42, 4.26],
});

// B. KORRIGERING — uppgång, topp 2021, tydlig nedgång (avmattning efter förbättring)
const korrigeringFixt = fixt("CYKEL-DEMO.ST", "Cykelbolaget AB (demo)", "industri", {
  ar: AR,
  omsattning: [10.0, 11.0, 12.0, 13.0, 14.0, 13.0, 11.5, 10.0, 8.5, 7.0],
  resultat: [1.0, 1.3, 1.5, 1.7, 1.9, 1.4, 0.9, 0.5, 0.2, -0.1],
  egetKapital: [8.0, 8.7, 9.7, 10.8, 12.0, 12.8, 13.1, 12.9, 12.3, 11.4],
  fcf: [0.9, 1.0, 1.1, 1.2, 1.3, 1.0, 0.6, 0.2, -0.2, -0.6],
});

// C. BASBYGGE — sidledes med litet brus (resultat följer eget kapital => ROE plan)
const basbyggeFixt = fixt("STADIG-DEMO.ST", "Stadiga Bolaget AB (demo)", "konsument", {
  ar: AR,
  omsattning: [10.0, 10.2, 10.0, 10.3, 10.1, 10.0, 10.2, 10.0, 10.1, 10.0],
  resultat: [1.0, 1.03, 1.02, 1.06, 1.05, 1.05, 1.08, 1.07, 1.08, 1.08],
  egetKapital: [8.0, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9],
  fcf: [0.95, 1.0, 0.92, 1.02, 0.98, 0.96, 1.01, 0.97, 0.99, 0.98],
});

// ── Rapport ─———————————————————————————————————————————————————————————————
console.log("AK1A FUNDAMENTAL VÅGMOTOR — TESTRAPPORT (" + new Date().toISOString() + ")");
console.log("Motor: src/lib/portfolj-forskning/fundamental-vagmotor.ts");
console.log("Trippelkontroll: (a) teckenvändning (b) regression lutning+R² (c) delperiod — klass vid ≥2/3 majoritet");

rubrik("MAPPNING VARIABEL_KALLA (V → datakälla)");
for (const vk of VARIABEL_KALLA) {
  console.log("  " + vk.id + " " + vk.namn.padEnd(34) + " [" + vk.kategori.padEnd(11) + "] " + vk.kallaText);
}

rubrik("ENHETSKONTROLLER klassaVag / bedomDynamik");
kolla("klassaVag([], mega) => osatt", klassaVag([], "mega"), "osatt");
kolla("klassaVag([1,2], mega) => osatt (för kort)", klassaVag([1, 2], "mega"), "osatt");
kolla("klassaVag([5,5,5,5,5], mega) => basbygge", klassaVag([5, 5, 5, 5, 5], "mega"), "basbygge");
kolla("klassaVag(1..10, mega) => impulsvag", klassaVag([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "mega"), "impulsvag");
kolla("klassaVag(10..1, mega) => korrigering", klassaVag([10, 9, 8, 7, 6, 5, 4, 3, 2, 1], "mega"), "korrigering");
kolla("bedomDynamik([1,2,3]) => osatt", bedomDynamik([1, 2, 3]), "osatt");
kolla("bedomDynamik(brusig plan serie) => stabilt", bedomDynamik([10, 10.2, 9.9, 10.1, 10, 10.2, 9.9, 10.1]), "stabilt");
kolla("bedomDynamik([10,11,12,13,20,30]) => forbattras", bedomDynamik([10, 11, 12, 13, 20, 30]), "forbattras");
kolla("bedomDynamik([30,20,13,12,11,10]) => forsvamras", bedomDynamik([30, 20, 13, 12, 11, 10]), "forsvamras");

rubrik("TRIPPELROSTNING I DETALJ (metod A/B/C per horisont, mega-fönster)");
for (const [namn, serie] of [
  ["impulsvågsserie", [10, 10.5, 11.3, 12.5, 14.2, 16.5, 19.5, 23.4, 28.1, 34.0]],
  ["korrigeringsserie", [10.0, 11.0, 12.0, 13.0, 14.0, 13.0, 11.5, 10.0, 8.5, 7.0]],
  ["basbygge-serie", [10.0, 10.2, 10.0, 10.3, 10.1, 10.0, 10.2, 10.0, 10.1, 10.0]],
] as Array<[string, number[]]>) {
  const d = klassaVagDetaljerad(serie, "mega");
  console.log("  " + namn + " (mega): klass=" + d.klass);
  console.log("    " + d.rost.a.detalj);
  console.log("    " + d.rost.b.detalj);
  console.log("    " + d.rost.c.detalj);
}

rubrik("FIXTURE A — IMPULSVÅG (förväntat: impulsvag på alla horisonter, förbättras)");
const a = raknaFVag(impulsvagFixt);
visa(a);
for (const v of ["V01", "V09", "V12", "V19"]) {
  kolla("A: " + v + " klass", a.perVariabel[v].klass, "impulsvag");
  kolla("A: " + v + " dynamik", a.perVariabel[v].dynamik, "forbattras");
}
for (const hz of HORIZONTER) kolla("A: perHorisont." + hz, a.perHorisont[hz], "impulsvag");
kolla("A: V20 osatt utan aktieantalsserie", a.perVariabel["V20"].klass, "osatt");

rubrik("FIXTURE B — KORRIGERING (förväntat: korrigering, försvagas)");
const b = raknaFVag(korrigeringFixt);
visa(b);
for (const v of ["V01", "V09", "V12", "V19"]) {
  kolla("B: " + v + " klass", b.perVariabel[v].klass, "korrigering");
  kolla("B: " + v + " dynamik", b.perVariabel[v].dynamik, "forsvamras");
}
for (const hz of HORIZONTER) kolla("B: perHorisont." + hz, b.perHorisont[hz], "korrigering");

rubrik("FIXTURE C — BASBYGGE (förväntat: basbygge på alla fem horisonter)");
const c = raknaFVag(basbyggeFixt);
visa(c);
for (const v of ["V01", "V09", "V12", "V19"]) {
  kolla("C: " + v + " klass", c.perVariabel[v].klass, "basbygge");
  kolla("C: " + v + " dynamik", c.perVariabel[v].dynamik, "stabilt");
}
kolla("C: perHorisont.mikro (sidledes även i 3-punktsfönstret)", c.perHorisont.mikro, "basbygge");
kolla("C: perHorisont.kort", c.perHorisont.kort, "basbygge");
kolla("C: perHorisont.medellang", c.perHorisont.medellang, "basbygge");
kolla("C: perHorisont.lang", c.perHorisont.lang, "basbygge");
kolla("C: perHorisont.mega", c.perHorisont.mega, "basbygge");

rubrik("FIXTURE D — RIKTIG POST: SKF-B.ST (nuvärden ur data/cache, serier återskapade demo-värden)");
let skfFixt: BolagsNyckeltal | null = null;
let skfKallaText = "cache-filen saknades — fixture byggd enligt typer.ts med demo-värden";
try {
  const raw = JSON.parse(readFileSync("data/cache/analys-SKF_B_ST.json", "utf8"));
  const f = raw && raw.data ? raw.data.fundament : null;
  const d = raw && raw.data ? raw.data : {};
  skfFixt = fixt("SKF-B.ST", d.namn || "AB SKF (publ)", "industri", {
    ar: AR,
    // Återskapade demonstrationsvärden (publika årsredovisningar +/- uppskattningar
    // för 2025-2026) — INTE exakta källdata; motor demonstration endast.
    omsattning: [77.9, 85.7, 76.0, 74.9, 81.3, 96.7, 103.9, 99.0, 100.5, 102.0],
    resultat: [6.2, 7.0, 4.9, 4.6, 9.1, 7.6, 8.2, 5.5, 7.0, 7.5],
    egetKapital: [32.0, 34.0, 35.0, 36.0, 39.0, 44.0, 47.0, 48.0, 50.0, 52.0],
    fcf: [4.0, 4.5, 3.5, 3.0, 5.0, 4.5, 5.5, 4.0, 5.0, 5.2],
  });
  if (d.pris) skfFixt.pris = d.pris;
  if (f) {
    if (f.pe) skfFixt.vardering.pe = f.pe;
    if (f.pb) skfFixt.vardering.pb = f.pb;
    if (f.roe) skfFixt.lonksamhet.roe = f.roe;
    if (f.vinstmarginal) skfFixt.lonksamhet.nettoMarginal = f.vinstmarginal;
    if (f.skuldEk) skfFixt.stabilitet.skuldEgenkapital = f.skuldEk;
  }
  skfKallaText = "nuvärden (pris, P/E, P/B, ROE, vinstmarginal, skuld/ek) lästa ur data/cache/analys-SKF_B_ST.json";
} catch (e) {
  console.log("  (läsning av cache-fil misslyckades: " + String(e) + ")");
}
if (skfFixt) {
  const skfAkm1: AKM1Bedomning = {
    ticker: "SKF-B.ST",
    poang: {
      V01: 3, V02: 2, V03: 4, V04: 2, V05: 3, V06: 3, V07: 4, V08: 3, V09: 3, V10: 4,
      V11: 3, V12: 4, V13: 4, V14: 4, V15: 2, V16: 3, V17: 3, V18: 2, V19: 4, V20: 3,
    },
    totalt: 62,
    perKategori: { tillvaxt: 3, vardering: 2.7, lonsamhet: 3.3, stabilitet: 3.7, moat: 3.3, katalysator: 2.7, risk: 3.5 },
    motivering: {
      V01: "Omsättning återhämtar sig efter 2024",
      V19: "Stark kassa, ingen nyemission på 5 år",
    },
    datum: "2026-09-01",
  };
  console.log("  Källa: " + skfKallaText);
  const s = raknaFVag(skfFixt, skfAkm1);
  visa(s);
  kolla("D: 20 variabler i perVariabel", Object.keys(s.perVariabel).length, 20);
  kolla("D: datum från nyckeltal", s.datum, "2026-09-01");
  kolla("D: totalText är på plats", s.totalText.length > 100, true);
  for (const hz of HORIZONTER) {
    kolla("D: perHorisont." + hz + " är en giltig klass",
      ["impulsvag", "korrigering", "basbygge", "osatt"].includes(s.perHorisont[hz]), true);
  }
  const klassbara = Object.keys(s.perVariabel).filter((v) => s.perVariabel[v].klass !== "osatt");
  console.log("  Klassbara variabler: " + klassbara.join(", "));
  kolla("D: klassbara ⊆ {V01,V09,V12,V19}",
    klassbara.every((v) => ["V01", "V09", "V12", "V19"].includes(v)), true);
  kolla("D: V19-anteckning nämner fcf-serien", s.perVariabel["V19"].anteckning.includes("fcf"), true);
  kolla("D: V20-anteckning nämner återköpsblocket", s.perVariabel["V20"].anteckning.includes("terköp"), true);
  kolla("D: V10-anteckning har skalärkontext (skuld/ek)", s.perVariabel["V10"].anteckning.includes("skuld"), true);
  kolla("D: AKM1-poäng citeras i V01-anteckning", s.perVariabel["V01"].anteckning.includes("AKM1 3/5"), true);
} else {
  console.log("  SKIPPAD (ingen cache-fil)");
}

rubrik("FIXTURE E — TOM POST (förväntat: allt osatt — motorn gissar aldrig)");
const tom = fixt("TOM.ST", "Utan Serier AB", "finans", undefined);
const e = raknaFVag(tom);
kolla("E: samtliga 20 klasser osatta",
  Object.values(e.perVariabel).every((v) => v.klass === "osatt"), true);
kolla("E: samtliga 20 dynamiker osatta",
  Object.values(e.perVariabel).every((v) => v.dynamik === "osatt"), true);
for (const hz of HORIZONTER) kolla("E: perHorisont." + hz + " osatt", e.perHorisont[hz], "osatt");
kolla("E: totalText säger osatt", e.totalText.includes("osatt"), true);

rubrik("SAMMANFATTNING");
const antalFail = KOLL.filter((k) => !k.ok).length;
console.log("  " + KOLL.length + " kontroller, " + (KOLL.length - antalFail) + " PASS, " + antalFail + " FAIL");
for (const k of KOLL.filter((x) => !x.ok)) console.log("  FAIL: " + k.namn + " (" + k.detalj + ")");
console.log("");
console.log("Pedagogiskt verktyg — inte investeringsråd.");
process.exit(antalFail > 0 ? 1 : 0);
`;

// ── 2) Skriv tmp-fil, kör via tsx, städa ────────────────────────────────────
function main() {
    mkdirSync(path.dirname(TMP_TS), { recursive: true }); // o44: engångszonen finns alltid
  writeFileSync(TMP_TS, TS_KOD, "utf8");
  console.log("[testa-fundamental-vagmotor] kör npx --yes tsx .tmp/tmp_fvag_koll.ts ...");
  const barn = spawnSync("npx", ["--yes", "tsx", ".tmp/tmp_fvag_koll.ts"], {
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
    console.error("[testa-fundamental-vagmotor] kunde inte köra tsx: " + barn.error.message);
    process.exit(1);
  }
  const kod = barn.status === null ? 1 : barn.status;
  console.log(
    "[testa-fundamental-vagmotor] avslutskod " + kod +
    (kod === 0 ? " — alla kontroller godkända" : " — minst en kontroll misslyckades")
  );
  process.exit(kod);
}

main();
