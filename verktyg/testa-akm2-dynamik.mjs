#!/usr/bin/env node
/**
 * AK1A — Test av AKM2 dynamiklager (src/lib/akm2/dynamik.ts).
 *
 * Samma mönster som verktyg/testa-fundamental-vagmotor.mjs (node kan inte
 * importera TS direkt):
 *   1. Genererar tmp_dynamik_koll.ts i repots rot — importerar dynamiklagret
 *      och fundamental-vagmotorn (för råklass-beviset på stigande P/B-serie).
 *   2. Kör den med: npx --yes tsx .tmp/tmp_dynamik_koll.ts
 *   3. Skriver ut en svensk rapport på stdout och städar tmp-filen.
 *
 * Kontroller (≥ 12 krav — här 30):
 *   A. Φ-tabellen per fas (F1–F8): 1,20/1,10/1,20+mogen/1,00+watch/0,80/0,90+
 *      value appearing/1,00 osatt + korrigering-utan-G → osatt.
 *   B. RIKTIGHETSINVERTERINGEN: stigande P/B-serie klassas impulsvåg RÅT →
 *      blir KORRIGERING efter inversion (Φ 0,80, justering −0,20 — kontrast:
 *      utan inversion +0,20 = dubbelbestraffning av Grahams köpläge); fallande
 *      P/B → impulsvåg + "värdeförbättring"; V28/V10/V04/V06; V01/V20 opåverkade.
 *   C. Dynamiktaket ±10 (rå +20/+−20 klamras; kompositen aldrig utanför).
 *   D. Konfluensmatrisen: HÖG KONFLUENS / KONFLIKT / DIVERGENS / NEUTRAL ZON /
 *      HÖG KONFLUENS NEGATIV + B<4-tunghetsgrinden.
 *   E. Hemmahorisont-ζ: V12 (lång, 0,30) vs V16 (mikro, 0,05) → bidragskvot 6;
 *      V13–V15 hem i mega.
 *   F. Tom input = tomt svar "osatt"; bara akm1 → allt osatt; Φ→justerings-
 *      formeln; ζ speglar HORIZONTER_VIKT; intervall-invarianter.
 *
 * Användning:  node verktyg/testa-akm2-dynamik.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_TS = path.join(REPO, ".tmp", "tmp_dynamik_koll.ts");
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// ── 1) Genererad tmp-testfil (TS — körs via npx tsx, raderas efteråt) ────────
// Obs: ingen backticks/${} inuti denna String.raw-literal.
const TS_KOD = String.raw`// tmp_dynamik_koll.ts — GENERERAD av verktyg/testa-akm2-dynamik.mjs. Raderas efter körning.
import {
  DYNAMIKTAK,
  HEMHORISONT,
  INVERTERADE_V,
  PHI,
  ZETA,
  bestamVagfas,
  inverteraKlass,
  konfluensStatus,
  phiTillJustering,
  raknaDynamikLager,
  tekniskRiktningTotalt,
} from "../src/lib/akm2/dynamik";
import { klassaVag } from "../src/lib/portfolj-forskning/fundamental-vagmotor";
import { HORIZONTER_VIKT } from "../src/lib/portfolj-forskning/typer";
import type {
  AKM1Bedomning,
  FVagAnalys,
  Horisont,
  VagKlass,
  VariabelVagstatus,
} from "../src/lib/portfolj-forskning/typer";

type Kontroll = { namn: string; ok: boolean; detalj: string };
const KOLL: Kontroll[] = [];
function kolla(namn: string, ok: boolean, faktiskt?: unknown, forvantat?: unknown): void {
  KOLL.push({ namn, ok, detalj: "faktiskt=" + String(faktiskt) + (forvantat !== undefined ? ", förväntat=" + String(forvantat) : "") });
  console.log("  " + (ok ? "PASS" : "FAIL") + " | " + namn + " => " + String(faktiskt) +
    (ok ? "" : " (förväntat " + String(forvantat) + ")"));
}
function narma(x: number, y: number, tol: number): boolean {
  return Math.abs(x - y) <= tol;
}
function rubrik(t: string): void {
  console.log("");
  console.log("== " + t + " " + "=".repeat(Math.max(4, 74 - t.length)));
}

// — Fixtures ————————————————————————————————————————————————————————————————
function fvagFixt(klassPerVariabel: Record<string, VagKlass>): FVagAnalys {
  const perVariabel: Record<string, VariabelVagstatus> = {};
  for (const v of Object.keys(klassPerVariabel)) {
    perVariabel[v] = { klass: klassPerVariabel[v], dynamik: "osatt", anteckning: "testfixture (raknaDynamikLager-test)" };
  }
  const perHorisont = { mikro: "osatt", kort: "osatt", medellang: "osatt", lang: "osatt", mega: "osatt" } as Record<Horisont, VagKlass>;
  return { ticker: "TEST.ST", perVariabel, perHorisont, totalText: "testfixture", datum: "2026-09-01" };
}
function akm1Fixt(poang: Record<string, number>): AKM1Bedomning {
  const totalt = Object.values(poang).reduce((s, x) => s + x, 0);
  return {
    ticker: "TEST.ST",
    poang,
    totalt,
    perKategori: {},
    motivering: {},
    datum: "2026-09-01",
  };
}
function tvagFixt(klassPerHorisont: Partial<Record<Horisont, VagKlass>>): Record<Horisont, VagKlass> {
  return {
    mikro: klassPerHorisont.mikro ?? "osatt",
    kort: klassPerHorisont.kort ?? "osatt",
    medellang: klassPerHorisont.medellang ?? "osatt",
    lang: klassPerHorisont.lang ?? "osatt",
    mega: klassPerHorisont.mega ?? "osatt",
  };
}
const UPP3 = tvagFixt({ mikro: "impulsvag", kort: "impulsvag", medellang: "impulsvag" });
const NED3 = tvagFixt({ mikro: "korrigering", kort: "korrigering", medellang: "korrigering" });
const PLAN3 = tvagFixt({ mikro: "basbygge", kort: "basbygge", medellang: "basbygge" });

// Fundamentalt +1: fyra kategorier med tydlig plus-okvot (inverterade variabler
// ges RÅ klass korrigering = fallande multipel/skuld → impulsvåg EFTER inversion).
const FUND_PLUS: Record<string, VagKlass> = {
  V01: "impulsvag", V02: "impulsvag", V03: "impulsvag",           // tillväxt +
  V04: "korrigering", V05: "korrigering",                          // värdering + (fallande P/S, P/B)
  V07: "impulsvag", V08: "impulsvag", V09: "impulsvag",           // lönsamhet +
  V10: "korrigering", V12: "impulsvag",                            // stabilitet + (fallande skuld)
};
// Fundamentalt −1: stigande multipler/skuld (rå impulsvåg → korrigering efter
// inversion) + korrigeringar i tillväxt/lönsamhet.
const FUND_MINUS: Record<string, VagKlass> = {
  V01: "korrigering", V02: "korrigering", V03: "korrigering",     // tillväxt −
  V04: "impulsvag", V05: "impulsvag", V06: "impulsvag",           // värdering − (stigande multipler)
  V07: "korrigering", V08: "korrigering", V09: "korrigering",     // lönsamhet −
  V10: "impulsvag", V11: "korrigering", V12: "korrigering",       // stabilitet − (stigande skuld)
};

// ── Rapport ─———————————————————————————————————————————————————————————————
console.log("AKM2 DYNAMIKLAGER — TESTRAPPORT (" + new Date().toISOString() + ")");
console.log("Modul: src/lib/akm2/dynamik.ts (BESLUT §6 + r3-dynamisering-2026-09-03.md)");

rubrik("A. Φ-TABELLEN PER FAS (F1–F8)");
const fasA = raknaDynamikLager({
  fvag: fvagFixt({
    V01: "impulsvag", V02: "osatt", V07: "impulsvag", V08: "korrigering",
    V09: "impulsvag", V12: "basbygge", V03: "korrigering",
  }),
  akm1: akm1Fixt({ V01: 3, V02: 3, V07: 3, V08: 2, V09: 3, V12: 3, V03: 4 }),
  sekvensPerVariabel: { V01: 2, V07: 1, V09: 4 },
});
kolla("A1: V01 impulsvåg n=2 → Φ 1,20 (bekräftad sekvens)", fasA.perVariabel["V01"].phi === 1.2, fasA.perVariabel["V01"].phi, 1.2);
kolla("A1: V01 justering +0,20", narma(fasA.perVariabel["V01"].justering, 0.2, 1e-9), fasA.perVariabel["V01"].justering, "+0,2");
kolla("A1: V01 flagga forstarkt-bekraftad-sekvens", fasA.perVariabel["V01"].flaggor.includes("forstarkt-bekraftad-sekvens"), true);
kolla("A2: V07 impulsvåg n=1 → Φ 1,10 (obekräftad)", fasA.perVariabel["V07"].phi === 1.1, fasA.perVariabel["V07"].phi, 1.1);
kolla("A2: V07 flagga obekraftad-impuls", fasA.perVariabel["V07"].flaggor.includes("obekraftad-impuls"), true);
kolla("A3: V09 impulsvåg n=4 → Φ 1,20 + mogen-impuls (Daniel–Moskowitz)",
  fasA.perVariabel["V09"].phi === 1.2 && fasA.perVariabel["V09"].flaggor.includes("mogen-impuls"), true);
kolla("A4: V12 basbygge → Φ 1,00 + watch", fasA.perVariabel["V12"].phi === 1.0 && fasA.perVariabel["V12"].flaggor.includes("watch-katalysatorkanslig"), true);
kolla("A5: V03 korrigering G=4 → Φ 0,80 + dampning",
  fasA.perVariabel["V03"].phi === 0.8 && fasA.perVariabel["V03"].flaggor.includes("dampning"), true);
kolla("A5: V03 justering −0,20", narma(fasA.perVariabel["V03"].justering, -0.2, 1e-9), fasA.perVariabel["V03"].justering, "−0,2");
kolla("A6: V08 korrigering G=2 → Φ 0,90 + value-appearing",
  fasA.perVariabel["V08"].phi === 0.9 && fasA.perVariabel["V08"].flaggor.includes("value-appearing"), true);
kolla("A6: V08 finns i svar.fältet valueAppearing", fasA.valueAppearing.includes("V08"), true);
kolla("A7: V02 osatt → Φ 1,00, justering 0, bidrag null",
  fasA.perVariabel["V02"].phi === 1.0 && fasA.perVariabel["V02"].justering === 0 && fasA.perVariabel["V02"].dynamikbidrag === null, true);
kolla("A7: V02 flagga osatt-intern-varning", fasA.perVariabel["V02"].flaggor.includes("osatt-intern-varning"), true);
const fasUtanG = raknaDynamikLager({
  fvag: fvagFixt({ V03: "korrigering" }),
  // inget akm1 → G saknas för V03
});
kolla("A8: korrigering UTAN G → osatt (grenen 0,80/0,90 gissas aldrig)", fasUtanG.perVariabel["V03"].fas === "osatt", fasUtanG.perVariabel["V03"].fas, "osatt");

rubrik("B. RIKTIGHETSINVERTERINGEN (r3 §5.1 — den kritiska)");
const stigandePB = [3.0, 3.4, 3.9, 4.6];   // P/B stiger kvartal för kvartal
const fallandePB = [4.6, 4.2, 3.7, 3.0];   // P/B faller (multipeln sjunker)
kolla("B1: råbevis — klassaVag(stigande P/B-serie, kort) = impulsvåg",
  klassaVag(stigandePB, "kort") === "impulsvag", klassaVag(stigandePB, "kort"), "impulsvag");
kolla("B1: råbevis — klassaVag(fallande P/B-serie, kort) = korrigering",
  klassaVag(fallandePB, "kort") === "korrigering", klassaVag(fallandePB, "kort"), "korrigering");
const invSvar = raknaDynamikLager({
  fvag: fvagFixt({ V05: "impulsvag", V28: "impulsvag", V04: "korrigering", V10: "korrigering" }),
  akm1: akm1Fixt({ V05: 4, V28: 4, V04: 3, V10: 3 }),
  sekvensPerVariabel: { V05: 1, V28: 1, V04: 2, V10: 2 },
});
const v05 = invSvar.perVariabel["V05"];
kolla("B2: V05 stigande P/B (rå impulsvåg) → EFTER inversion korrigering",
  v05.klassRa === "impulsvag" && v05.klassEfterInversion === "korrigering", v05.klassEfterInversion, "korrigering");
kolla("B2: V05 G=4 → Φ 0,80, justering −0,20",
  v05.phi === 0.8 && narma(v05.justering, -0.2, 1e-9), v05.justering, "−0,2");
kolla("B2: kontrast — UTAN inversion hade justeringen blivit +0,20 (dubbelbestraffning av Grahams köpläge)",
  narma(phiTillJustering(PHI.IMPULS_BEKRAFTAD), 0.2, 1e-9) && narma(v05.justering, -0.2, 1e-9), v05.justering, "−0,2 (med inversion)");
kolla("B3: V28 (earnings yield EV/EBIT) rå impulsvåg → efter korrigering (BESLUT §6)",
  invSvar.perVariabel["V28"].klassRa === "impulsvag" && invSvar.perVariabel["V28"].klassEfterInversion === "korrigering", true);
kolla("B4: V04/V10 med FALLANDE serie (rå korrigering) → impulsvåg + värdeförbättring",
  invSvar.perVariabel["V04"].klassEfterInversion === "impulsvag" &&
  invSvar.perVariabel["V04"].flaggor.includes("vardeforbattring") &&
  invSvar.perVariabel["V10"].klassEfterInversion === "impulsvag", true);
kolla("B5: INVERTERADE_V = exakt {V04, V05, V06, V10, V28} och V01/V20 lämnas orörda",
  INVERTERADE_V.has("V04") && INVERTERADE_V.has("V05") && INVERTERADE_V.has("V06") &&
  INVERTERADE_V.has("V10") && INVERTERADE_V.has("V28") && !INVERTERADE_V.has("V01") &&
  !INVERTERADE_V.has("V20") && INVERTERADE_V.size === 5, INVERTERADE_V.size, 5);
kolla("B6: inverteraKlass vänder impulsvåg⇄korrigering men lämnar basbygge/osatt",
  inverteraKlass("impulsvag") === "korrigering" && inverteraKlass("korrigering") === "impulsvag" &&
  inverteraKlass("basbygge") === "basbygge" && inverteraKlass("osatt") === "osatt", true);

rubrik("C. DYNAMIKTAKET ±10");
const allaID = Object.keys(HEMHORISONT);
const allaUppRa: Record<string, VagKlass> = {};
const allaNedRa: Record<string, VagKlass> = {};
const poangMax: Record<string, number> = {};
for (const v of allaID) {
  // Inverterade variabler får RÅ korrigering (fallande multipel) för att bli
  // impulsvåg EFTER inversion — alla 28 ska hamna i gynnsam impuls.
  allaUppRa[v] = INVERTERADE_V.has(v) ? "korrigering" : "impulsvag";
  allaNedRa[v] = INVERTERADE_V.has(v) ? "impulsvag" : "korrigering";
  poangMax[v] = 5;
}
const sekvens2: Record<string, number> = {};
for (const v of allaID) sekvens2[v] = 2;
const takUpp = raknaDynamikLager({ fvag: fvagFixt(allaUppRa), akm1: akm1Fixt(poangMax), sekvensPerVariabel: sekvens2 });
const takNed = raknaDynamikLager({ fvag: fvagFixt(allaNedRa), akm1: akm1Fixt(poangMax), sekvensPerVariabel: sekvens2 });
console.log("  (tak upp: rå " + takUpp.kompositDynamikbidragForTak + " → " + takUpp.kompositDynamikbidrag +
  " | tak ned: rå " + takNed.kompositDynamikbidragForTak + " → " + takNed.kompositDynamikbidrag + ")");
kolla("C1: alla 28 i bekräftad impuls G=5 → råbidrag +20", narma(takUpp.kompositDynamikbidragForTak, 20, 0.01), takUpp.kompositDynamikbidragForTak, "+20");
kolla("C1: klamrat till +10 och takAktivt", takUpp.kompositDynamikbidrag === DYNAMIKTAK && takUpp.takAktivt, takUpp.kompositDynamikbidrag, "+10");
kolla("C2: alla 28 i korrigering G=5 → råbidrag −20", narma(takNed.kompositDynamikbidragForTak, -20, 0.01), takNed.kompositDynamikbidragForTak, "−20");
kolla("C2: klamrat till −10 och takAktivt", takNed.kompositDynamikbidrag === -DYNAMIKTAK && takNed.takAktivt, takNed.kompositDynamikbidrag, "−10");
kolla("C3: kompositen ligger inom [−10, +10] i alla körfall",
  Math.abs(takUpp.kompositDynamikbidrag) <= 10 && Math.abs(takNed.kompositDynamikbidrag) <= 10 &&
  Math.abs(fasA.kompositDynamikbidrag) <= 10, true);

rubrik("D. KONFLUENSMATRISEN (teknisk 3/5 × fundamental 4/7)");
const akmFund = akm1Fixt({ V01: 3, V02: 3, V03: 3, V04: 3, V05: 4, V06: 3, V07: 3, V08: 2, V09: 3, V10: 3, V11: 3, V12: 3 });
const mHog = raknaDynamikLager({ fvag: fvagFixt(FUND_PLUS), akm1: akmFund, tvagPerHorisont: UPP3 });
const mKonflikt = raknaDynamikLager({ fvag: fvagFixt(FUND_MINUS), akm1: akmFund, tvagPerHorisont: UPP3 });
const mDivergens = raknaDynamikLager({ fvag: fvagFixt(FUND_PLUS), akm1: akmFund, tvagPerHorisont: NED3 });
const mNeutral = raknaDynamikLager({ fvag: fvagFixt(FUND_PLUS), akm1: akmFund, tvagPerHorisont: PLAN3 });
const mHogNeg = raknaDynamikLager({ fvag: fvagFixt(FUND_MINUS), akm1: akmFund, tvagPerHorisont: NED3 });
kolla("D-förhands: teknisk riktning +1 vid impulsvåg på 3 av 5 horisonter", tekniskRiktningTotalt(UPP3) === 1, tekniskRiktningTotalt(UPP3), 1);
kolla("D-förhands: fundamental riktning +1 (4 kategorier plus)", mHog.konfluens.fundamentalRiktning === 1, mHog.konfluens.fundamentalRiktning, 1);
kolla("D-förhands: fundamental riktning −1 (4 kategorier minus)", mKonflikt.konfluens.fundamentalRiktning === -1, mKonflikt.konfluens.fundamentalRiktning, -1);
kolla("D1: teknisk +1 × fundamental +1 → HÖG KONFLUENS", mHog.konfluens.status === "HOG KONFLUENS", mHog.konfluens.status, "HOG KONFLUENS");
kolla("D2: teknisk +1 × fundamental −1 → KONFLIKT", mKonflikt.konfluens.status === "KONFLIKT", mKonflikt.konfluens.status, "KONFLIKT");
kolla("D3: teknisk −1 × fundamental +1 → DIVERGENS", mDivergens.konfluens.status === "DIVERGENS", mDivergens.konfluens.status, "DIVERGENS");
kolla("D4: teknisk 0 × fundamental +1 → NEUTRAL ZON", mNeutral.konfluens.status === "NEUTRAL ZON", mNeutral.konfluens.status, "NEUTRAL ZON");
kolla("D5: teknisk −1 × fundamental −1 → HÖG KONFLUENS NEGATIV", mHogNeg.konfluens.status === "HOG KONFLUENS NEGATIV", mHogNeg.konfluens.status, "HOG KONFLUENS NEGATIV");
kolla("D6: per-horisont följer matrisen (mDivergens: mikro-korrigering × fundament +1 = DIVERGENS)",
  mDivergens.konfluens.perHorisont.mikro === "DIVERGENS", mDivergens.konfluens.perHorisont.mikro, "DIVERGENS");
const mTunn = raknaDynamikLager({
  fvag: fvagFixt({ V01: "impulsvag" }), // endast Tillväxt belagd → B = 1
  akm1: akm1Fixt({ V01: 3 }),
  tvagPerHorisont: UPP3,
});
kolla("D7: tunghetsgrind — B=1 < 4 → fundamental null → NEUTRAL ZON trots teknisk +1",
  mTunn.konfluens.fundamentalRiktning === null && mTunn.konfluens.status === "NEUTRAL ZON", mTunn.konfluens.status, "NEUTRAL ZON");
kolla("D8: konfluensStatus(null, null) = OSATT (båda pelarna saknas)", konfluensStatus(null, null) === "OSATT", konfluensStatus(null, null), "OSATT");

rubrik("E. HEMMAHORISONT-ζ (r3 §7)");
const hemSvar = raknaDynamikLager({
  fvag: fvagFixt({ V12: "impulsvag", V16: "impulsvag" }),
  akm1: akm1Fixt({ V12: 5, V16: 5 }),
  sekvensPerVariabel: { V12: 2, V16: 2 },
});
kolla("E1: V12 hem i lång (ζ 0,30) och V16 hem i mikro (ζ 0,05)",
  hemSvar.perVariabel["V12"].hemHorisont === "lang" && hemSvar.perVariabel["V16"].hemHorisont === "mikro", true);
kolla("E2: samma G och fas → V12:s bidrag är 6× V16:s (0,30/0,05)",
  narma(
    (hemSvar.perVariabel["V12"].dynamikbidrag ?? 0) / (hemSvar.perVariabel["V16"].dynamikbidrag ?? 1),
    6,
    0.001
  ),
  (hemSvar.perVariabel["V12"].dynamikbidrag ?? 0) + " / " + (hemSvar.perVariabel["V16"].dynamikbidrag ?? 0),
  "kvot 6");
kolla("E3: moat-variablerna V13–V15 har hem i mega",
  HEMHORISONT["V13"].hem === "mega" && HEMHORISONT["V14"].hem === "mega" && HEMHORISONT["V15"].hem === "mega", true);
kolla("E4: katalysatorerna V16–V18 har hem i mikro–kort (mikro som första led)",
  HEMHORISONT["V16"].hem === "mikro" && HEMHORISONT["V17"].hem === "mikro" && HEMHORISONT["V18"].hem === "mikro", true);

rubrik("F. ÄRLIGHETSREGLER, FORMEL OCH INVARIANTER");
const tom = raknaDynamikLager({});
kolla("F1: tom input → status osatt", tom.status === "osatt", tom.status, "osatt");
kolla("F1: tom input → tomt perVariabel", Object.keys(tom.perVariabel).length === 0, Object.keys(tom.perVariabel).length, 0);
kolla("F1: tom input → komposit 0 och konfluens OSATT",
  tom.kompositDynamikbidrag === 0 && tom.konfluens.status === "OSATT", true);
kolla("F1: tom input → alla fem horisonter OSATT",
  HORIZONTER_VIKT && ["mikro", "kort", "medellang", "lang", "mega"].every((h) => tom.konfluens.perHorisont[h as Horisont] === "OSATT"), true);
const baraAkm1 = raknaDynamikLager({ akm1: akm1Fixt({ V01: 4, V09: 3 }) });
kolla("F2: bara akm1 (fvag/tvag saknas) → alla 28 osatta, komposit 0",
  Object.values(baraAkm1.perVariabel).every((r) => r.fas === "osatt") && baraAkm1.kompositDynamikbidrag === 0, true);
kolla("F2: bara akm1 → status osatt + varning om fvag saknas",
  baraAkm1.status === "osatt" && baraAkm1.varningar.some((v) => v.includes("fvag saknas")), true);
kolla("F3: Φ→justering: 0,80→−0,20 · 0,90→−0,10 · 1,00→0 · 1,10→+0,10 · 1,20→+0,20",
  narma(phiTillJustering(0.8), -0.2, 1e-9) && narma(phiTillJustering(0.9), -0.1, 1e-9) &&
  phiTillJustering(1.0) === 0 && narma(phiTillJustering(1.1), 0.1, 1e-9) && narma(phiTillJustering(1.2), 0.2, 1e-9), true);
kolla("F3: clamp — phiTillJustering(2,5) → +1 och (−0,5) → −1",
  phiTillJustering(2.5) === 1 && phiTillJustering(-0.5) === -1, true);
kolla("F4: ZETA speglar HORIZONTER_VIKT exakt (mikro 0,05 · kort 0,20 · medellång 0,25 · lång 0,30 · mega 0,20)",
  (["mikro", "kort", "medellang", "lang", "mega"] as Horisont[]).every((h) => ZETA[h] === HORIZONTER_VIKT[h]), true);
kolla("F5: invarianter i stora fixturer — justering ∈ [−1,+1], Φ ∈ [0,80; 1,20]",
  [...Object.values(takUpp.perVariabel), ...Object.values(mKonflikt.perVariabel)].every(
    (r) => r.justering >= -1 && r.justering <= 1 && r.phi >= 0.8 && r.phi <= 1.2
  ), true);
kolla("F6: bestamVagfas är deterministisk (samma anrop → samma svar)",
  JSON.stringify(bestamVagfas("impulsvag", 4, 3)) === JSON.stringify(bestamVagfas("impulsvag", 4, 3)), true);
kolla("F7: G≤1 med impulsvåg → nivå/rörelse-konflikt visas (aldrig tyst)",
  raknaDynamikLager({ fvag: fvagFixt({ V01: "impulsvag" }), akm1: akm1Fixt({ V01: 1 }) })
    .perVariabel["V01"].flaggor.includes("niva-rorelse-konflikt"), true);

rubrik("TEXTEXEMPL");
console.log("  (invSvar.text): " + invSvar.text);
console.log("  (mHog.konfluens.text): " + mHog.konfluens.text);
console.log("  (V05.anteckning): " + invSvar.perVariabel["V05"].anteckning);

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
  console.log("[testa-akm2-dynamik] kör npx --yes tsx .tmp/tmp_dynamik_koll.ts ...");
  const barn = spawnSync("npx", ["--yes", "tsx", ".tmp/tmp_dynamik_koll.ts"], {
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
    console.error("[testa-akm2-dynamik] kunde inte köra tsx: " + barn.error.message);
    process.exit(1);
  }
  const kod = barn.status === null ? 1 : barn.status;
  console.log(
    "[testa-akm2-dynamik] avslutskod " + kod +
    (kod === 0 ? " — alla kontroller godkända" : " — minst en kontroll misslyckades")
  );
  process.exit(kod);
}

main();
