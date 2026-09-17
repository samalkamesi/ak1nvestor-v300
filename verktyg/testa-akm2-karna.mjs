#!/usr/bin/env node
/**
 * AK1A — Testsvit för AKM2-kärnan (src/lib/akm2/karna.ts + vikter.ts + typer.ts).
 *
 * Mönster som verktyg/testa-riskportfolj.mjs (node kan inte importera TS direkt):
 *   1. Genererar tmp-Testfil (TS) i .tmp/ (våg 150:s gitignorerade
 *      engångsyta, tsconfig-exkluderad — o44),
 *   2. kör den med: npx --yes tsx .tmp/tmp_akm2_karna_koll.ts,
 *   3. läser JSON-svaret mellan markörerna, skriver ut PASS/FAIL, städar.
 *
 * Kontroller (≥ 15 enligt direktivet):
 *   (1–5)   PROJEKTIONSINVARIANTEN ×5 fixturer:
 *           JSON.stringify(projiceraAKM1(raknaAKM2(k, {moduler: [], viktprofil:
 *           "akm1-klassisk"}))) === JSON.stringify(raknaAKM1(k)).
 *   (6–8)   Viktprofilernas RÅVIKTER summerar 100/100/100 (akm1-klassisk,
 *           akm2-2026, superanalys-2026 — kanonisk utlösning).
 *   (9)     akm1-klassisk är låst (las) och uniform — ingen omfördelning.
 *   (10)    HÅRD PORT: kassa < 12 mån ⇒ komposit max 45 + dokumentation.
 *   (11)    Porten utlöses ALDRIG av null-data (ärlighet).
 *   (12)    Omfördelning: osattas vikt → 0, aktiva summerar 1, dokumenterat.
 *   (13)    Kompositformeln oberoende dubbelräknad (med modulpoäng V21+).
 *   (14)    Klassisk reduktion: komposit === AKM1-summan utan port.
 *   (15)    Neutralt dynamiksvar utan injicerad funktion (degradering).
 *   (16)    Injicerad dynamik med öppen port: +1 steg, ärlig mot osatta.
 *   (17)    Sluten port ⇒ δ nollställt (säkerhetsventilen).
 *   (18)    Dynamiktak ±10 kompositpoäng.
 *   (19)    forklaraPoang-struktur: kurs-slug, bidrag, sortering, varningar.
 *   (20)    Determinism: två körningar JSON-identiska.
 *   (21)    All-osatt fixture: totalt 0, "Osatt" i alla motiveringar, band osatt.
 *   (22)    superanalys-2026: kategorivikter löses ut korrekt (likavikt inom
 *           kategori, tomma kategorier omfördelas).
 *   (23)    Modulavvisning: poäng på V01–V20 från modul avvisas (R4 lager 2).
 *   (24)    R2 §6 EV/EBITDA-kurva (poangEvEbitda) inkl. värdefalle-hålet (P4).
 *
 * Användning:  node verktyg/testa-akm2-karna.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_KAT = path.join(REPO, ".tmp");
const TMP_NAMN = "tmp_akm2_karna_koll.ts";
const TMP = path.join(TMP_KAT, TMP_NAMN);
const MARK_START = "===AKM2_KARNA_JSON_START===";
const MARK_END = "===AKM2_KARNA_JSON_END===";
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// ── Genererad tmp-testfil (TS, körs via npx tsx, raderas efteråt) ────────────
// OBS: inga backticks och inga ${} i koden nedan (den ligger i en template-literal).
const TS_KOD = String.raw`
// tmp_akm2_karna_koll.ts — GENERERAD av verktyg/testa-akm2-karna.mjs. Raderas efter körning.
import {
  raknaAKM1, raknaAKM2, projiceraAKM1, forklaraPoang, effektivaPoang, poangEvEbitda,
  KARNVARIABLER, MODELL_VERSION,
} from "../src/lib/akm2/karna";
import { hamtaViktProfil } from "../src/lib/akm2/vikter";
import type { DynamikJustering, DynamikLagerSvar } from "../src/lib/akm2/typer";
import type { BolagsNyckeltal, Horisont, VagKlass } from "../src/lib/portfolj-forskning/typer";

const MARK_START = "===AKM2_KARNA_JSON_START===";
const MARK_END = "===AKM2_KARNA_JSON_END===";

type TestRad = { namn: string; ok: boolean; detalj: string };
const RADER: TestRad[] = [];
function kolla(namn: string, ok: boolean, detalj = ""): void {
  RADER.push({ namn, ok: !!ok, detalj });
}
function num(x: unknown): number {
  return typeof x === "number" && Number.isFinite(x) ? x : NaN;
}
function summa(obj: Record<string, number>): number {
  return Object.values(obj).reduce((s, x) => s + num(x), 0);
}

// ── Fixturer (5 för invarianten + specialfall) ───────────────────────────────

const KALLOR = [
  { namn: "Yahoo Finance", hamtat: "2026-09-01" },
  { namn: "MarketStack", hamtat: "2026-09-01" },
];

// HEL — välskötta industrin med full data på beräkningsbara fält, kassa 80 mån.
const HEL: BolagsNyckeltal = {
  ticker: "HEL.ST", namn: "Hellas fabrik", bransch: "industri", land: "Sverige", valuta: "SEK",
  kallor: KALLOR, hamtat: "2026-09-01", pris: 100, marknadsKapitalMdr: 10,
  tillvaxt: { omsattningCAGR5ar: 0.18, resultatCAGR5ar: 0.15, omsattningTillvaxtTTM: 0.32, prognosTillvaxt: 0.2 },
  lonksamhet: { roe: 0.28, roic: 0.18, bruttoMarginal: 0.42, ebitMarginal: 0.16, nettoMarginal: 0.12, fcfMarginal: 0.1 },
  stabilitet: { skuldEgenkapital: 0.7, rantaTackning: 8, fcfPositivaSenaste5: 5, kassaManaderBurnRate: 80, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: 0.5, andelUtestande: 0.025, insiderkopSenaste6man: 2 },
  moat: { bruttoMarginalMedel5ar: 0.41, bruttoMarginalSpread5ar: 0.02, roeMedel5ar: 0.26 },
  vardering: { pe: 18, pb: 1.8, evEbit: 12, peg: 1.2, fcfYield: 0.05, egenKapitalMultipl: 1.8 },
  golv: { typ: "reim", vardePerAktie: 80, marginal: -0.25 },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [1000, 1050, 1100, 1150, 1200], resultat: [80, 90, 100, 110, 120], egetKapital: [700, 750, 800, 850, 900], fcf: [60, 65, 70, 75, 80] },
};

// NUL — allt som kan vara null är null: modellen måste svara osatt, aldrig gissa.
const NUL: BolagsNyckeltal = {
  ticker: "NUL.ST", namn: "Nolla AB", bransch: "teknik", land: "Sverige", valuta: "SEK",
  kallor: [], hamtat: "2026-09-01", pris: null, marknadsKapitalMdr: null,
  tillvaxt: { omsattningCAGR5ar: null, resultatCAGR5ar: null, omsattningTillvaxtTTM: null, prognosTillvaxt: null },
  lonksamhet: { roe: null, roic: null, bruttoMarginal: null, ebitMarginal: null, nettoMarginal: null, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: null, pb: null, evEbit: null, peg: null, fcfYield: null, egenKapitalMultipl: null },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
};

// NEG — krympande, skuldsatt, kassa 10 mån (hård port), negativt P/B.
const NEG: BolagsNyckeltal = {
  ...NUL,
  ticker: "NEG.ST", namn: "Negativa AB", bransch: "konsument",
  kallor: KALLOR,
  tillvaxt: { omsattningCAGR5ar: -0.08, resultatCAGR5ar: -0.1, omsattningTillvaxtTTM: -0.12, prognosTillvaxt: null },
  lonksamhet: { roe: 0.04, roic: -0.02, bruttoMarginal: 0.08, ebitMarginal: -0.02, nettoMarginal: -0.05, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: 4.2, rantaTackning: 0.8, fcfPositivaSenaste5: 1, kassaManaderBurnRate: 10, nyemissionerSenaste5ar: 3 },
  vardering: { pe: null, pb: -0.5, evEbit: null, peg: null, fcfYield: null, egenKapitalMultipl: -0.5 },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [100, 220, 70, 250, 90], resultat: [5, 8, 2, 9, 1], egetKapital: [50, 55, 40, 45, 30], fcf: [-5, -8, -10, -6, -9] },
};

// SAAS — extrem tillväxt (hållbarhetsrabatt), 5/5 FCF-år, insiderköp.
const SAAS: BolagsNyckeltal = {
  ...NUL,
  ticker: "SAA.ST", namn: "SaaZen AB", bransch: "teknik",
  kallor: KALLOR,
  tillvaxt: { omsattningCAGR5ar: 0.5, resultatCAGR5ar: 0.4, omsattningTillvaxtTTM: 0.65, prognosTillvaxt: 0.4 },
  lonksamhet: { roe: 0.38, roic: 0.3, bruttoMarginal: 0.78, ebitMarginal: 0.2, nettoMarginal: 0.15, fcfMarginal: 0.18 },
  stabilitet: { skuldEgenkapital: 0.4, rantaTackning: null, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: 5 },
  moat: { bruttoMarginalMedel5ar: 0.75, bruttoMarginalSpread5ar: 0.03, roeMedel5ar: 0.36 },
  vardering: { pe: 40, pb: 6.2, evEbit: 30, peg: 1.5, fcfYield: 0.01, egenKapitalMultipl: 6.2 },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [100, 140, 190, 250, 320], resultat: [1, 3, 6, 10, 16], egetKapital: [60, 70, 85, 105, 130], fcf: [2, 4, 7, 11, 17] },
};

// BANK — bankprofil: lågt P/B, dämpad ROE, hög skuld (bankens affär), jämn serie.
const BANK: BolagsNyckeltal = {
  ...NUL,
  ticker: "BAN.ST", namn: "Banken AB", bransch: "finans",
  kallor: KALLOR,
  tillvaxt: { omsattningCAGR5ar: 0.03, resultatCAGR5ar: 0.03, omsattningTillvaxtTTM: 0.04, prognosTillvaxt: null },
  lonksamhet: { roe: 0.11, roic: 0.05, bruttoMarginal: null, ebitMarginal: 0.3, nettoMarginal: 0.25, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: 5.5, rantaTackning: null, fcfPositivaSenaste5: 5, kassaManaderBurnRate: 120, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: null, andelUtestande: 0, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: 0.1 },
  vardering: { pe: 8, pb: 0.85, evEbit: null, peg: null, fcfYield: null, egenKapitalMultipl: 0.85 },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [500, 505, 498, 502, 500], resultat: [25, 26, 24, 25, 25], egetKapital: [400, 410, 415, 420, 430], fcf: [20, 21, 20, 21, 21] },
};

// PORT — starkt på alla berätningsbara fält MEN kassa 8 mån => hård port.
const PORT: BolagsNyckeltal = {
  ...HEL,
  ticker: "POR.ST", namn: "Porten AB",
  tillvaxt: { omsattningCAGR5ar: 0.3, resultatCAGR5ar: 0.25, omsattningTillvaxtTTM: 0.35, prognosTillvaxt: 0.25 },
  lonksamhet: { roe: 0.4, roic: 0.3, bruttoMarginal: 0.75, ebitMarginal: 0.3, nettoMarginal: 0.25, fcfMarginal: 0.2 },
  stabilitet: { skuldEgenkapital: 0.4, rantaTackning: 12, fcfPositivaSenaste5: 2, kassaManaderBurnRate: 8, nyemissionerSenaste5ar: 1 },
  aterkop: { senasteArMdr: 1, andelUtestande: 0.06, insiderkopSenaste6man: 4 },
  moat: { bruttoMarginalMedel5ar: 0.78, bruttoMarginalSpread5ar: 0.01, roeMedel5ar: 0.42 },
  vardering: { pe: 10, pb: 0.8, evEbit: 7, peg: 0.9, fcfYield: 0.08, egenKapitalMultipl: 0.8 },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [1000, 1000, 1000, 1000, 1000], resultat: [100, 100, 100, 100, 100], egetKapital: [800, 800, 800, 800, 800], fcf: [80, 80, 80, 80, 80] },
};

// PORT_SAFE — som PORT men kassadata null + 5/5 FCF-år: porten får INTE utlösas.
const PORT_SAFE: BolagsNyckeltal = {
  ...PORT,
  ticker: "PSA.ST", namn: "Porten Säker AB",
  stabilitet: { skuldEgenkapital: 0.4, rantaTackning: 12, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0 },
};

const FIXTURER: Array<[string, BolagsNyckeltal]> = [
  ["HEL", HEL], ["NUL", NUL], ["NEG", NEG], ["SAAS", SAAS], ["BANK", BANK],
];

// ── (1–5) PROJEKTIONSINVARIANTEN ×5 ──────────────────────────────────────────
for (const [namn, fx] of FIXTURER) {
  const ratt = raknaAKM1(fx);
  const proj = projiceraAKM1(raknaAKM2(fx, { moduler: [], viktprofil: "akm1-klassisk" }));
  const lika = JSON.stringify(proj) === JSON.stringify(ratt);
  kolla(
    "Invariant " + namn + ": projiceraAKM1(raknaAKM2(k, klassisk)) === raknaAKM1(k)",
    lika,
    lika ? "totalt " + ratt.totalt + "/100 (identisk JSON)" : "SKILJER: proj.totalt=" + proj.totalt + " vs ratt.totalt=" + ratt.totalt,
  );
}

// ── (6–8) Råvikter summerar 100/100/100 ─────────────────────────────────────
for (const id of ["akm1-klassisk", "akm2-2026", "superanalys-2026"]) {
  const p = hamtaViktProfil(id);
  const s = p ? summa(p.viktPerVariabel) : NaN;
  kolla("Viktsumma " + id + " = 100 (±0,01)", p != null && Math.abs(s - 100) < 0.01, p ? "summa " + Math.round(s * 1000) / 1000 : "profil saknas");
}
// akm2-2026: blocksplit 58/42 enligt BESLUT §2
const akm2p = hamtaViktProfil("akm2-2026")!;
const karnSum = summa(Object.fromEntries(Object.entries(akm2p.viktPerVariabel).filter(([v]) => Number(v.slice(1)) <= 20)));
const modSum = summa(Object.fromEntries(Object.entries(akm2p.viktPerVariabel).filter(([v]) => Number(v.slice(1)) > 20)));
kolla(
  "akm2-2026 blocksplit: V01–V20 = 58 % och V21–V28 = 42 % (BESLUT §2)",
  Math.abs(karnSum - 58) < 0.01 && Math.abs(modSum - 42) < 0.01,
  "kärna " + Math.round(karnSum * 100) / 100 + " %, moduler " + Math.round(modSum * 100) / 100 + " % (§2-tabellen summerar 97 — skalad med 58/97, dokumenterat i vikter.ts)",
);

// ── (9) akm1-klassisk är låst och uniform ────────────────────────────────────
const klassisk = hamtaViktProfil("akm1-klassisk")!;
const uniform = Object.values(klassisk.viktPerVariabel).every((w) => w === 5) && Object.keys(klassisk.viktPerVariabel).length === 20;
kolla(
  "akm1-klassisk: las=true, uniform 5x20 (=100), omfordelaVidOsatt ej satt",
  klassisk.las === true && uniform && !klassisk.omfordelaVidOsatt,
  "R2 §2: gamla procenttabellen summerade 112 % — klassisk vilar på poängskalan 5x20",
);

// ── (10) HÅRD PORT: kassa < 12 mån ⇒ komposit max 45 + dokumentation ────────
const portRes = raknaAKM2(PORT, { viktprofil: "akm2-2026" });
const portUtanTak = 20 * 5 * (8 + 4 + 10 + 6 + 4 + 4 + 4) / (8 + 4 + 10 + 6 + 4 + 4 + 9 + 4); // V19 väger men ger 0 p
kolla(
  "Hård port: kassa 8 mån ⇒ komposit max 45 (BESLUT §5)",
  portRes.komposit <= 45 && (portRes.lager2.notering ?? "").includes("HÅRD PORT"),
  "komposit " + portRes.komposit + "/100 (takat från ca " + Math.round(portUtanTak) + ")",
);

// ── (11) Porten utlöses ALDRIG av null-data ─────────────────────────────────
const safeRes = raknaAKM2(PORT_SAFE, { viktprofil: "akm2-2026" });
kolla(
  "Port aldrig på null-data: kassa null + 5/5 FCF-år ⇒ ingen port, V19=5",
  safeRes.komposit === 100 && safeRes.lager1.poang["V19"] === 5 && !(safeRes.lager2.notering ?? "").includes("HÅRD PORT"),
  "komposit " + safeRes.komposit + "/100, band " + safeRes.band + " (osatt-band pga 60 % osatta — ärligt)",
);

// ── (12) Omfördelning: osatt vikt → 0, aktiva summerar 1, dokumenterat ──────
const omf = raknaAKM2(HEL, { viktprofil: "akm2-2026" });
const viktSum = summa(omf.lager4.viktPerVariabel);
const osattaHarNoll = omf.lager4.omfordelning!.exkluderade.every((v) => (omf.lager4.viktPerVariabel[v] ?? -1) === 0);
const aktivaPositiva = KARNVARIABLER.filter((v) => (omf.lager4.viktPerVariabel[v] ?? 0) > 0);
kolla(
  "Omfördelning (akm2-2026): osatta väger 0, vikterna summerar 1, dokumenterade",
  Math.abs(viktSum - 1) < 1e-9 && osattaHarNoll && aktivaPositiva.length === 8 && omf.lager4.omfordelning!.text.length > 0,
  "aktiva kärnvariabler: " + aktivaPositiva.join(",") + "; exkluderade " + omf.lager4.omfordelning!.exkluderade.length + " st (12 osatta + 8 inaktiva modulvariabler)",
);

// ── (13) Kompositformeln oberoende dubbelräknad (med modulpoäng V21+) ────────
const MODUL = { modulId: "saas-test", aktiv: true, automatisk: true, orsak: "test", poang: { V21: 4, V22: 5, V28: 3, V07: 4 } };
const modRes = raknaAKM2(HEL, { viktprofil: "akm2-2026", moduler: [MODUL] });
// Oberoende vikttabell: BESLUT §2 × (58/97) för kärnan + §1 för modulblocket.
const S = 58 / 97;
const RAW: Record<string, number> = { V01: 8 * S, V05: 4 * S, V07: 10 * S, V09: 6 * S, V10: 4 * S, V12: 4 * S, V19: 9 * S, V20: 4 * S, V21: 8, V22: 8, V28: 6 };
const P: Record<string, number> = { V01: 5, V05: 4, V07: 3, V09: 4, V10: 4, V12: 4, V19: 4, V20: 3, V21: 4, V22: 5, V28: 3 };
const rawSum = Object.values(RAW).reduce((a, b) => a + b, 0);
const vantan = Math.round(20 * Object.entries(RAW).reduce((a, [v, w]) => a + w * P[v], 0) / rawSum);
kolla(
  "Komposit = round(20 · Σ(vikt × poäng)) — oberoende dubbelräkning med moduler",
  modRes.komposit === vantan,
  "kärna " + modRes.komposit + " vs dubbelräkning " + vantan + "; lager2.poang = " + JSON.stringify(modRes.lager2.poang),
);

// ── (14) Klassisk reduktion: komposit === AKM1-summan (ingen port på HEL) ───
const helRatt = raknaAKM1(HEL);
const helKlassisk = raknaAKM2(HEL, { moduler: [], viktprofil: "akm1-klassisk" });
kolla(
  "Klassisk reduktion: komposit === raknaAKM1-totalt (och = 31 på HEL)",
  helKlassisk.komposit === helRatt.totalt && helRatt.totalt === 31,
  "komposit " + helKlassisk.komposit + ", AKM1 " + helRatt.totalt + " (V01=5,V05=4,V07=3,V09=4,V10=4,V12=4,V19=4,V20=3)",
);

// ── (15) Neutralt dynamiksvar utan injicerad funktion ───────────────────────
const hv: Record<Horisont, VagKlass> = omf.lager3.perHorisont;
const hvSum = Object.values(omf.lager3.horisontVikter).reduce((a, b) => a + b, 0);
kolla(
  "Neutralt dynamiksvar: tomma justeringar, port osatt, horisontvikter summerar 1",
  Object.keys(omf.lager3.perVariabel).length === 0 && omf.lager3.konfluens.port === "osatt" && omf.lager3.konfluens.raknadeTeorier === 0 && Math.abs(hvSum - 1) < 1e-9 && Object.values(hv).every((x) => x === "osatt"),
  "ren fundamental syntes (Fas 2-degradering), horisontviktsumma " + hvSum,
);

// ── Injicerad dynamik (hjälpare) ─────────────────────────────────────────────
function dynamikSvar(port: "oppen" | "sluten", justeringar: Record<string, number>): (r: { ticker: string }) => DynamikLagerSvar {
  return (r) => {
    const perVariabel: Record<string, DynamikJustering> = {};
    for (const [v, j] of Object.entries(justeringar)) {
      perVariabel[v] = { variabel: v, riktning: j > 0 ? "forbattras" : j < 0 ? "forsvamras" : "stabilt", justering: j, port, motivering: "testjustering" };
    }
    const osattH: Record<Horisont, VagKlass> = { mikro: "osatt", kort: "osatt", medellang: "osatt", lang: "osatt", mega: "osatt" };
    return {
      ticker: r.ticker, perVariabel, perHorisont: osattH, tekniskPerHorisont: osattH,
      konfluens: { raknadeTeorier: 5, sammaRiktning: port === "oppen" ? 4 : 1, port, text: port === "oppen" ? "4 av 5 teorier pekar uppåt" : "splittrad bild" },
      horisontVikter: { mikro: 0.05, kort: 0.2, medellang: 0.25, lang: 0.3, mega: 0.2 }, datum: "2026-09-01",
    };
  };
}

// (16) Öppen port: +1 på V19 (4→5) och på osatt V02 (0→0 — ALDRIG lyfta osatt)
const dynRes = raknaAKM2(HEL, { viktprofil: "akm1-klassisk", dynamik: dynamikSvar("oppen", { V19: 1, V02: 1 }) });
const dynEff = effektivaPoang(dynRes);
kolla(
  "Dynamik öppen port: V19 4→5, osatt V02 förblir 0 (ärlighet), komposit 31→32",
  dynEff["V19"] === 5 && dynEff["V02"] === 0 && dynRes.komposit === 32,
  "komposit " + dynRes.komposit + ", effektiv V19=" + dynEff["V19"] + ", effektiv V02=" + dynEff["V02"],
);

// (17) Sluten port: δ nollställt av kärnans säkerhetsventil
const slutenRes = raknaAKM2(HEL, { viktprofil: "akm1-klassisk", dynamik: dynamikSvar("sluten", { V19: 1, V01: 1, V05: 1 }) });
kolla(
  "Sluten port ⇒ justering 0 (säkerhetsventil): komposit oförändrad 31",
  slutenRes.komposit === 31 && effektivaPoang(slutenRes)["V19"] === 4,
  "komposit " + slutenRes.komposit,
);

// (18) Dynamiktak ±10: +1 på ALLA aktiva (8 kärna + 3 moduler = +11) takas till +10
const takRes = raknaAKM2(HEL, {
  viktprofil: "akm2-2026",
  moduler: [MODUL],
  dynamik: dynamikSvar("oppen", { V01: 1, V05: 1, V07: 1, V09: 1, V10: 1, V12: 1, V19: 1, V20: 1, V21: 1, V22: 1, V28: 1 }),
});
kolla(
  "Dynamiktak ±10: +11 potential takas till exakt +10",
  takRes.komposit - modRes.komposit === 10,
  "utan dynamik " + modRes.komposit + " → med " + takRes.komposit + " (R4 §3 lager 5)",
);

// ── (19) forklaraPoang-struktur ──────────────────────────────────────────────
const fkl = forklaraPoang(modRes, HEL);
const slugOK = fkl.rader.every((r) => r.variabel.startsWith("V2") || /^v\d{2}-[a-z]/.test(r.kursSlug ?? ""));
const v01slug = fkl.rader.find((r) => r.variabel === "V01")?.kursSlug === "v01-forsaljningstillvaxt";
const sorterad = fkl.rader.every((r, i) => i === 0 || Math.abs(fkl.rader[i - 1].bidrag) >= Math.abs(r.bidrag) - 1e-12);
const bidragOK = fkl.rader.every((r) => Math.abs(r.bidrag - r.vikt * r.effektivPoang * 20) < 1e-9);
const faltOK = fkl.rader.every((r) => typeof r.namn === "string" && r.namn.length > 0 && typeof r.text === "string" && r.text.length > 10);
kolla(
  "forklaraPoang: kurs-slug (v01-forsaljningstillvaxt …), bidrag = vikt×p̂×20, |bidrag|-sortering, varningar, källor",
  fkl.rader.length >= 20 && slugOK && v01slug && sorterad && bidragOK && faltOK && fkl.varningar.length >= 1 && fkl.kallor.length >= 4,
  fkl.rader.length + " rader, " + fkl.varningar.length + " varningar, topp: " + (fkl.rader[0] ? fkl.rader[0].variabel + " " + Math.round(fkl.rader[0].bidrag * 10) / 10 + " p" : "-"),
);

// ── (20) Determinism ─────────────────────────────────────────────────────────
const d1 = raknaAKM2(SAAS, { viktprofil: "akm2-2026" });
const d2 = raknaAKM2(SAAS, { viktprofil: "akm2-2026" });
kolla("Determinism: två körningar JSON-identiska (ingen klocka, datum = k.hamtat)", JSON.stringify(d1) === JSON.stringify(d2) && d1.modellVersion === MODELL_VERSION, "datum " + d1.datum);

// ── (21) All-osatt fixture ───────────────────────────────────────────────────
const nulRatt = raknaAKM1(NUL);
const nulRes = raknaAKM2(NUL, { moduler: [], viktprofil: "akm1-klassisk" });
const allaOsatta = KARNVARIABLER.every((v) => nulRatt.motivering[v].startsWith("Osatt"));
kolla(
  "All-osatt: totalt 0, alla motiveringar 'Osatt…', komposit 0, band 'osatt'",
  nulRatt.totalt === 0 && allaOsatta && nulRes.komposit === 0 && nulRes.band === "osatt" && nulRes.osakerhet.andelOsatta === 1,
  "null in ⇒ osatt ut — modellen gissar aldrig",
);

// ── (22) superanalys-2026: kategoriupplösning ────────────────────────────────
const supRes = raknaAKM2(HEL, { viktprofil: "superanalys-2026" });
const supV = supRes.lager4.viktPerVariabel;
// Aktiva kategorier på HEL: Tillväxt(V01) 16, Värdering(V05) 20, Lönsamhet(V07,V09) 24,
// Stabilitet(V10,V12) 10, Risk(V19) 10, Kapitalstruktur(V20) 4 → summa 84.
const vantanV01 = 16 / 84;
const vantanV07 = 24 / 84 / 2;
kolla(
  "superanalys-2026: likavikt inom kategori, tomma kategorier (Moat/Katalysator) omfördelas",
  Math.abs(supV["V01"] - vantanV01) < 1e-9 && Math.abs(supV["V07"] - vantanV07) < 1e-9 && supV["V07"] === supV["V09"] && Math.abs(summa(supRes.lager4.viktPerVariabel) - 1) < 1e-9,
  "V01=" + Math.round(supV["V01"] * 1000) / 1000 + " (16/84), V07=V09=" + Math.round(supV["V07"] * 1000) / 1000 + " (24/84/2)",
);

// ── (23) Modulavvisning: poäng på V01–V20 från modul avvisas ────────────────
kolla(
  "Modulpoäng på V07 avvisas (lager 2 rör aldrig V01–V20); lager1 orört",
  !("V07" in modRes.lager2.poang) && modRes.lager1.poang["V07"] === 3 && (modRes.lager2.notering ?? "").includes("avvisat"),
  "notering: " + (modRes.lager2.notering ?? "").slice(0, 80) + "…",
);

// ── (24) R2 §6 EV/EBITDA-kurva inkl. värdefalle-hålet ───────────────────────
const kurvOK =
  poangEvEbitda(null, null) === null &&
  poangEvEbitda(-1, null) === 0 &&
  poangEvEbitda(25, 5) === 1 &&
  poangEvEbitda(15, 5) === 2 &&
  poangEvEbitda(12, 5) === 3 &&
  poangEvEbitda(8, 5) === 4 &&
  poangEvEbitda(5, 5) === 5 &&
  poangEvEbitda(3, 3) === 5 &&
  poangEvEbitda(3, 2) === 3;
kolla("poangEvEbitda: R2 §6 konvex kurva + P4-hålet (<4x ⇒ 5 endast om V19 ≥ 3)", kurvOK, "aktiveras när P1-kontraktet får evEbitda (idag osatt i kärnan, dokumenterat)");

// ── Utdata ───────────────────────────────────────────────────────────────────
console.log(MARK_START + JSON.stringify({ rader: RADER }) + MARK_END);
`;

// ── 2) Skriv tmp-fil, kör via tsx, städa ──────────────────────────────────────
function hittaJson(text) {
  const a = text.indexOf(MARK_START);
  const b = text.lastIndexOf(MARK_END);
  if (a === -1 || b === -1 || b <= a) return null;
  return text.slice(a + MARK_START.length, b);
}

// .tmp/ = våg 150:s gitignorerade engångsyta, tsconfig-exkluderad (o44).
try {
  mkdirSync(TMP_KAT, { recursive: true });
  writeFileSync(TMP, TS_KOD, "utf8");
  console.log("[testa-akm2-karna] kör npx --yes tsx .tmp/" + TMP_NAMN + " ...");
  const barn = spawnSync("npx", ["--yes", "tsx", ".tmp/" + TMP_NAMN], {
    cwd: REPO,
    shell: true,
    encoding: "utf8",
    timeout: TIMEOUT_MS,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: "1" },
  });
  const ut = (barn.stdout || "") + "\n[stderr]\n" + (barn.stderr || "");
  const json = hittaJson(barn.stdout || "");
  if (!json) {
    console.error("[testa-akm2-karna] FICK INGET TEST-JSON — rå utdata nedan:\n" + ut.slice(0, 4000));
    process.exitCode = 1;
  } else {
    const { rader } = JSON.parse(json);
    let fail = 0;
    let nr = 0;
    for (const r of rader) {
      nr += 1;
      const status = r.ok ? "PASS" : "FAIL";
      if (!r.ok) fail += 1;
      console.log(`${status}  ${String(nr).padStart(2)} · ${r.namn}${r.detalj ? " — " + r.detalj : ""}`);
    }
    console.log("");
    const grona = rader.length - fail;
    console.log(`[testa-akm2-karna] ${grona}/${rader.length} kontroller gröna${fail ? ", " + fail + " FAIL" : ""}.`);
    if (!fail) {
      console.log("[testa-akm2-karna] PROJEKTIONSINVARIANTEN håller: AKM1 är en projektion av AKM2.");
    }
    process.exitCode = fail ? 1 : 0;
  }
} catch (fel) {
  console.error("[testa-akm2-karna] FEL: " + (fel && fel.message ? fel.message : String(fel)));
  process.exitCode = 1;
} finally {
  // process.exit hoppar över finally — därför sätts exitCode och städning sker här.
  try {
    unlinkSync(TMP);
  } catch {
    /* tmp-filen fanns inte — ok */
  }
}

