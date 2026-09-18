#!/usr/bin/env node
/**
 * AK1A — Test av AKM2 lager 2: modulerna V21–V28 + modulregistret (index.ts)
 * samt den villkorade insidermodulen V29.
 *
 * Skriptet gör så här (node kan inte importera TS direkt — samma mönster som
 * verktyg/testa-fundamental-vagmotor.mjs):
 *   1. Genererar tmp_akm2_modul_koll.ts i repots rot — en fil som importerar
 *      src/lib/akm2/moduler och kör kontroller mot två fixtures + kantfall.
 *   2. Kör den med: npx --yes tsx .tmp/tmp_akm2_modul_koll.ts
 *   3. Skriver ut en svensk rapport på stdout och städar tmp-filen.
 *
 * Fixtures (syntetiska — ingen verklig kursdata):
 *   A. FIX-IND.ST  — moget industriföretag med full data (beräkningsbara
 *                    variabler ska ge exakta poäng enligt R1:s trösklar)
 *   B. FIX-SAAS.ST — SaaS-bolag med hål i underlaget (osatt-flaggor ska
 *                    slås ärligt, aldrig gissade poäng)
 *   + strukturerade kopior av A för tröskelkanter och approximationsspår,
 *   + modulaktivering per bransch (saas/bank/cyklisk/tillgangstung/tillvaxt/
 *     standard) och V29 med/utan manuell insiderdata.
 *
 * Användning:  node verktyg/testa-akm2-moduler.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 *
 * Pedagogiskt testverktyg — ALDRIG investeringsråd.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_TS = path.join(REPO, ".tmp", "tmp_akm2_modul_koll.ts");
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// ── 1) Genererad tmp-testfil (TS — körs via npx tsx, raderas efteråt) ────────
// Obs: ingen backticks/${} inuti denna String.raw-literal.
const TS_KOD = String.raw`// tmp_akm2_modul_koll.ts — GENERERAD av verktyg/testa-akm2-moduler.mjs. Raderas efter körning.
import type { BolagsNyckeltal, Bransch } from "../src/lib/portfolj-forskning/typer";
import {
  KARNA_MODUL_FUNKTIONER,
  KARNA_MODUL_VARIABLER,
  INSIDER_MODUL_AKTIV,
  MODULER,
  aktivaModulerForBransch,
  aktivaVariablerForBransch,
  viktJusteringarForBransch,
  raknaV21ROIC,
  raknaV22FriaKassaflodesavkastning,
  raknaV23Redovisningskvalitet,
  raknaV24Skuldbetjaningsformaga,
  raknaV25Utspadning,
  raknaV26Kapitalcykel,
  raknaV27Utdelningskontinuitet,
  raknaV28EarningsYield,
  raknaV29Insider,
} from "../src/lib/akm2/moduler";

type Kontroll = { namn: string; ok: boolean; detalj: string };
const KOLL: Kontroll[] = [];
function kolla(namn: string, faktiskt: unknown, forvantat: unknown): void {
  const ok = faktiskt === forvantat;
  KOLL.push({ namn, ok, detalj: "faktiskt=" + String(faktiskt) + ", förväntat=" + String(forvantat) });
  console.log("  " + (ok ? "PASS" : "FAIL") + " | " + namn + " => " + String(faktiskt) +
    (ok ? "" : " (förväntat " + String(forvantat) + ")"));
}
function kollaSann(namn: string, villkor: boolean): void {
  KOLL.push({ namn, ok: villkor, detalj: villkor ? "sant" : "falskt" });
  console.log("  " + (villkor ? "PASS" : "FAIL") + " | " + namn);
}
function kollaNara(namn: string, faktiskt: number, forvantat: number): void {
  const ok = Math.abs(faktiskt - forvantat) < 1e-9;
  KOLL.push({ namn, ok, detalj: "faktiskt=" + faktiskt + ", förväntat=" + forvantat });
  console.log("  " + (ok ? "PASS" : "FAIL") + " | " + namn + " => " + faktiskt);
}
function rubrik(t: string): void {
  console.log("");
  console.log("── " + t + " " + "─".repeat(Math.max(2, 66 - t.length)));
}

// ── Fixtur A: moget industriföretag med full data ───────────────────────────
const FIXTUR_A: BolagsNyckeltal = {
  ticker: "FIX-IND.ST",
  namn: "Fixtur Industri AB (moget, full data)",
  bransch: "industri",
  land: "Sverige",
  valuta: "SEK",
  kallor: [
    { namn: "Årsredovisning 2026 (demo-fixtur)", hamtat: "2026-09-01" },
    { namn: "Analysdatabas (demo-fixtur)", hamtat: "2026-09-01" },
  ],
  hamtat: "2026-09-01",
  pris: 100,
  marknadsKapitalMdr: 40,
  tillvaxt: { omsattningCAGR5ar: 0.05, resultatCAGR5ar: 0.06, omsattningTillvaxtTTM: 0.04, prognosTillvaxt: 0.04 },
  lonksamhet: { roe: 0.16, roic: 0.185, bruttoMarginal: 0.32, ebitMarginal: 0.12, nettoMarginal: 0.12, fcfMarginal: 0.14 },
  stabilitet: { skuldEgenkapital: 0.8, rantaTackning: 7.5, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: 0.6, andelUtestande: 1.5, insiderkopSenaste6man: 3 },
  moat: { bruttoMarginalMedel5ar: 0.31, bruttoMarginalSpread5ar: 0.02, roeMedel5ar: 0.15 },
  vardering: { pe: 16.7, pb: 3.3, evEbit: 8.0, peg: 2.8, fcfYield: 0.085, egenKapitalMultipl: 3.3 },
  golv: { typ: "reim", vardePerAktie: 62, marginal: 0.38 },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [3.8, 3.9, 3.95, 4.0, 4.0],
    resultat: [0.4, 0.42, 0.44, 0.46, 0.48],
    egetKapital: [1.1, 1.12, 1.15, 1.18, 1.2],
    fcf: [0.5, 0.55, 0.6, 0.62, 0.64],
  },
  notering: "Syntetisk demo-fixtur för pedagogiska tester — ingen verklig kursdata.",
};

// ── Fixtur B: SaaS med hål i underlaget ─────────────────────────────────────
const FIXTUR_B: BolagsNyckeltal = {
  ticker: "FIX-SAAS.ST",
  namn: "Fixtur SaaS AB (hål i underlaget)",
  bransch: "teknik",
  land: "Sverige",
  valuta: "SEK",
  kallor: [
    { namn: "Årsredovisning 2026 (demo-fixtur)", hamtat: "2026-09-01" },
    { namn: "IR-presentation (demo-fixtur)", hamtat: "2026-09-01" },
  ],
  hamtat: "2026-09-01",
  pris: 50,
  marknadsKapitalMdr: 12,
  tillvaxt: { omsattningCAGR5ar: 0.28, resultatCAGR5ar: null, omsattningTillvaxtTTM: 0.24, prognosTillvaxt: 0.2 },
  lonksamhet: { roe: null, roic: null, bruttoMarginal: 0.78, ebitMarginal: null, nettoMarginal: null, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: 0, kassaManaderBurnRate: 19, nyemissionerSenaste5ar: 2 },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.8, bruttoMarginalSpread5ar: 0.03, roeMedel5ar: null },
  vardering: { pe: null, pb: 8.0, evEbit: 14.0, peg: null, fcfYield: null, egenKapitalMultipl: 8.0 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [0.5, 0.62, 0.78, 0.97, 1.2],
    resultat: [-0.12, -0.1, -0.08, -0.06, -0.05],
    egetKapital: [0.8, 0.75, 0.7, 0.66, 0.6],
    fcf: [-0.05, -0.04, -0.03, -0.02, -0.01],
  },
  notering: "Syntetisk demo-fixtur för pedagogiska tester — ingen verklig kursdata.",
};

// ── Fixtur A: kärnmodulernas poäng ──────────────────────────────────────────
rubrik("FIXTUR A — FIX-IND.ST (moget industriföretag, full data)");
const a21 = raknaV21ROIC(FIXTUR_A);
kolla("A: V21 ROIC 18,5 % → 4 p", a21.poang, 4);
kollaSann("A: V21 motivering dokumenterar trösklar", a21.motivering.includes("15–20 % → 4 p"));
const a22 = raknaV22FriaKassaflodesavkastning(FIXTUR_A);
kolla("A: V22 FCF-avkastning 8,5 % + konversion + stigande FCF → 5 p", a22.poang, 5);
const a23 = raknaV23Redovisningskvalitet(FIXTUR_A);
kolla("A: V23 osatt (CFO/totala tillgångar saknas)", a23.osatt, true);
const a24 = raknaV24Skuldbetjaningsformaga(FIXTUR_A);
kolla("A: V24 täckning 7,5x (ND-approx 2,0) → 4 p", a24.poang, 4);
kollaSann("A: V24 motivering nämner ND-approximationen", a24.motivering.includes("bruttoskuld/EBIT"));
const a25 = raknaV25Utspadning(FIXTUR_A);
kolla("A: V25 nettoförminskning 1,5 % → 5 p", a25.poang, 5);
const a26 = raknaV26Kapitalcykel(FIXTUR_A);
kolla("A: V26 osatt (CapEx/totaltillgångar saknas)", a26.osatt, true);
const a27 = raknaV27Utdelningskontinuitet(FIXTUR_A);
kolla("A: V27 osatt (utdelningshistorik saknas)", a27.osatt, true);
kollaSann("A: V27 motivering noterar FCF-serien 5 av 5 positiva", a27.motivering.includes("5 av 5"));
const a28 = raknaV28EarningsYield(FIXTUR_A);
kolla("A: V28 EV/EBIT 8 → yield 12,5 % → 5 p", a28.poang, 5);

// ── Fixtur B: SaaS med hål — osatt-flaggorna ────────────────────────────────
rubrik("FIXTUR B — FIX-SAAS.ST (SaaS med hål i underlaget)");
kolla("B: V21 osatt (roic och approx-underlag saknas)", raknaV21ROIC(FIXTUR_B).osatt, true);
kolla("B: V22 osatt (fcfYield och fallback-underlag saknas)", raknaV22FriaKassaflodesavkastning(FIXTUR_B).osatt, true);
const b23 = raknaV23Redovisningskvalitet(FIXTUR_B);
kolla("B: V23 osatt", b23.osatt, true);
kollaSann("B: V23 motivering bär GMI-flagga (78 % < 5-årsmedel 80 %)", b23.motivering.includes("GMI-liknande flagga"));
kolla("B: V24 osatt (räntetäckning saknas)", raknaV24Skuldbetjaningsformaga(FIXTUR_B).osatt, true);
const b25 = raknaV25Utspadning(FIXTUR_B);
kolla("B: V25 osatt", b25.osatt, true);
kollaSann("B: V25 motivering varnar för 2 nyemissioner", b25.motivering.includes("nyemission") && b25.motivering.includes("2"));
kolla("B: V28 EV/EBIT 14 → yield 7,1 % → 3 p", raknaV28EarningsYield(FIXTUR_B).poang, 3);
kolla("B: V26 osatt", raknaV26Kapitalcykel(FIXTUR_B).osatt, true);
kolla("B: V27 osatt", raknaV27Utdelningskontinuitet(FIXTUR_B).osatt, true);

// ── Modulregistret: aktivering per bransch ──────────────────────────────────
rubrik("MODULREGISTRET — aktivering per bransch");
const indModuler = aktivaModulerForBransch("industri");
kollaSann("industri → cykelmodulen aktiv", indModuler.some((m) => m.namn.startsWith("Cyklisk")));
kolla("industri → aktiva V: V21,V24,V27,V28", aktivaVariablerForBransch("industri").join(","), "V21,V24,V27,V28");
kollaNara("industri → V28 tonas ner (×0,85)", viktJusteringarForBransch("industri")["V28"] ?? 1, 0.85);
kollaNara("industri → V24 tonas upp (×1,15)", viktJusteringarForBransch("industri")["V24"] ?? 1, 1.15);

const tekModuler = aktivaModulerForBransch("teknik");
kollaSann("teknik → saas + tillväxt aktiva", tekModuler.some((m) => m.namn.startsWith("SaaS")) && tekModuler.some((m) => m.namn.startsWith("Tillväxt")));
kolla("teknik → union V21,V22,V23,V25,V28", aktivaVariablerForBransch("teknik").join(","), "V21,V22,V23,V25,V28");
kollaNara("teknik → V25-faktor = 1,3 × 1,25", viktJusteringarForBransch("teknik")["V25"] ?? 1, 1.625);
kollaNara("teknik → V19 (AKM1) tonas upp ×1,25", viktJusteringarForBransch("teknik")["V19"] ?? 1, 1.25);

const bankAktiva = aktivaVariablerForBransch("finans");
kollaSann("finans → bankmodulen: V21/V28 inaktiva (ROIC/EV meningslöst)", !bankAktiva.includes("V21") && !bankAktiva.includes("V28"));
kollaNara("finans → V05 (P/B) tonas upp ×1,25", viktJusteringarForBransch("finans")["V05"] ?? 1, 1.25);
kollaNara("finans → V10 (skuldsättning) tonas upp ×1,25", viktJusteringarForBransch("finans")["V10"] ?? 1, 1.25);

kolla("fastighet → tillgångstung: aktiva V: V21,V24,V26,V28", aktivaVariablerForBransch("fastighet").join(","), "V21,V24,V26,V28");
kollaNara("fastighet → V26 tonas upp ×1,2 (golv-koppling)", viktJusteringarForBransch("fastighet")["V26"] ?? 1, 1.2);

kolla("konsument → standard-fallback: alla 8 aktiva", aktivaVariablerForBransch("konsument").join(","), "V21,V22,V23,V24,V25,V26,V27,V28");
kolla("konsument → inga viktjusteringar", Object.keys(viktJusteringarForBransch("konsument")).length, 0);
kolla("hälso → standard-fallback (alla 8)", aktivaVariablerForBransch("halso").length, 8);
kollaSann("registret innehåller 6 moduler", MODULER.length === 6);

// ── V29: villkorad insidermodul ─────────────────────────────────────────────
rubrik("V29 — VILLKORAD INSIDERMODUL (inaktiv som standard)");
kolla("V29: INSIDER_MODUL_AKTIV är false", INSIDER_MODUL_AKTIV, false);
const v29Utan = raknaV29Insider(FIXTUR_B);
kolla("V29: utan manuell FI-data → osatt", v29Utan.osatt, true);
kolla("V29: nettoköp + ägande 12 % → 5 p", raknaV29Insider(FIXTUR_B, { nettoKopSenaste6Man: 5000000, insiderAgandeProcent: 12 }).poang, 5);
kolla("V29: nettoköp men ägande 30 % (entrenchment) → 4 p", raknaV29Insider(FIXTUR_B, { nettoKopSenaste6Man: 5000000, insiderAgandeProcent: 30 }).poang, 4);
kolla("V29: massaförsäljning + M-Score-flagga → 0 p", raknaV29Insider(FIXTUR_B, { nettoKopSenaste6Man: -8000000, massaForsaljningVDcfo: true, mScoreFlaggad: true }).poang, 0);
kolla("V29: nettoneutralt → 3 p", raknaV29Insider(FIXTUR_B, { nettoKopSenaste6Man: 0 }).poang, 3);
kolla("V29: founder kvar, netto okänd → 3 p (R1:s fack)", raknaV29Insider(FIXTUR_B, { founderKvar: true }).poang, 3);
kolla("V29: tomt dataobjekt → osatt", raknaV29Insider(FIXTUR_B, {}).osatt, true);

// ── Tröskelkanter (strukturerade kopior av fixtur A) ────────────────────────
rubrik("TRÖSKELKANTER — kopior av fixtur A");
const a2 = structuredClone(FIXTUR_A); a2.lonksamhet.roic = 0.205;
kolla("kant: ROIC 20,5 % → 5 p", raknaV21ROIC(a2).poang, 5);
const a3 = structuredClone(FIXTUR_A); a3.lonksamhet.roic = -0.01;
kolla("kant: ROIC −1 % → 0 p", raknaV21ROIC(a3).poang, 0);
const a4 = structuredClone(FIXTUR_A); a4.stabilitet.rantaTackning = 5;
kolla("kant: täckning 5x + ND-approx 2,0 → 2 p (3-facket kräver ND<1,5)", raknaV24Skuldbetjaningsformaga(a4).poang, 2);
const a5 = structuredClone(FIXTUR_A); a5.stabilitet.skuldEgenkapital = 2.0;
kolla("kant: ND-approx 5,0 (>3,5) → 0 p trots täckning 7,5x", raknaV24Skuldbetjaningsformaga(a5).poang, 0);
const a6 = structuredClone(FIXTUR_A); a6.vardering.fcfYield = -0.02; a6.serier!.fcf = [0.64, 0.62, 0.6, 0.58, 0.4];
kolla("kant: FCF-avkastning −2 % + fallande serie → 0 p", raknaV22FriaKassaflodesavkastning(a6).poang, 0);
const a6b = structuredClone(FIXTUR_A); a6b.vardering.fcfYield = -0.02;
kolla("kant: FCF-avkastning −2 % + stigande serie → 1 p (vändpunkt)", raknaV22FriaKassaflodesavkastning(a6b).poang, 1);
const a7 = structuredClone(FIXTUR_A); a7.serier!.fcf = [0.64, 0.62, 0.6, 0.58, 0.4];
kolla("kant: yield 8,5 % men fallande FCF → 4 p (5-krav ej uppfyllt)", raknaV22FriaKassaflodesavkastning(a7).poang, 4);
const a8 = structuredClone(FIXTUR_A); a8.vardering.evEbit = 60;
kolla("kant: EV/EBIT 60 → yield 1,7 % → 0 p", raknaV28EarningsYield(a8).poang, 0);
const a9 = structuredClone(FIXTUR_A); a9.aterkop!.andelUtestande = -3;
kolla("kant: netto-utspädning 3 %/år → 2 p", raknaV25Utspadning(a9).poang, 2);
const a10 = structuredClone(FIXTUR_A); a10.aterkop!.andelUtestande = -8;
kolla("kant: netto-utspädning 8 %/år → 0 p", raknaV25Utspadning(a10).poang, 0);
const a11 = structuredClone(FIXTUR_A); a11.vardering.evEbit = 0;
kolla("kant: EV/EBIT 0 (negativ EBIT) → 0 p", raknaV28EarningsYield(a11).poang, 0);

// ── Approximationsspår ──────────────────────────────────────────────────────
rubrik("APPROXIMATIONSSPÅR (R1:s förenklingar via befintliga fält)");
const c1 = structuredClone(FIXTUR_A); c1.lonksamhet.roic = null;
const c1svar = raknaV21ROIC(c1);
kolla("approx: V21 utan roic-fält → EBIT/invKap 22,2 % → 5 p", c1svar.poang, 5);
kollaSann("approx: V21-motivering dokumenterar R1-förenklingen", c1svar.motivering.includes("förenkling"));
const d1 = structuredClone(FIXTUR_A); d1.vardering.fcfYield = null;
kolla("approx: V22 via fcfMarginal×oms/börsvärde = 1,4 % → 1 p", raknaV22FriaKassaflodesavkastning(d1).poang, 1);

// ── Generella kontrakt ──────────────────────────────────────────────────────
rubrik("GENERELLA KONTRAKT");
kolla("KARNA_MODUL_VARIABLER har 8 poster", KARNA_MODUL_VARIABLER.length, 8);
kolla("KARNA_MODUL_FUNKTIONER har 8 funktioner", Object.keys(KARNA_MODUL_FUNKTIONER).length, 8);
let allaOk = true;
for (const [id, fn] of Object.entries(KARNA_MODUL_FUNKTIONER)) {
  for (const fixture of [FIXTUR_A, FIXTUR_B]) {
    const svar = fn(fixture);
    const giltigt = Number.isInteger(svar.poang) && svar.poang >= 0 && svar.poang <= 5 &&
      typeof svar.motivering === "string" && svar.motivering.length >= 40 &&
      (!svar.osatt || svar.poang === 0);
    if (!giltigt) { allaOk = false; console.log("     ogiltigt svar: " + id + " på " + fixture.ticker); }
  }
}
kollaSann("alla V21–V28 på båda fixturerna: heltalspoäng 0–5, motivering ≥ 40 tecken, osatt ⇒ 0 p", allaOk);
const osattaB = ["V21", "V22", "V23", "V24", "V25", "V26", "V27"].filter(
  (id) => (KARNA_MODUL_FUNKTIONER as Record<string, (k: BolagsNyckeltal) => { osatt?: boolean }>)[id](FIXTUR_B).osatt === true
);
kolla("fixtur B: exakt V21–V27 osatta (endast V28 beräknas)", osattaB.length, 7);

// ── Sammanfattning ──────────────────────────────────────────────────────────
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
  console.log("[testa-akm2-moduler] kör npx --yes tsx .tmp/tmp_akm2_modul_koll.ts ...");
  const barn = spawnSync("npx", ["--yes", "tsx", ".tmp/tmp_akm2_modul_koll.ts"], {
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
    console.error("[testa-akm2-moduler] kunde inte köra tsx: " + barn.error.message);
    process.exit(1);
  }
  const kod = barn.status === null ? 1 : barn.status;
  console.log(
    "[testa-akm2-moduler] avslutskod " + kod +
    (kod === 0 ? " — alla kontroller godkända" : " — minst en kontroll misslyckades")
  );
  process.exit(kod);
}

main();
