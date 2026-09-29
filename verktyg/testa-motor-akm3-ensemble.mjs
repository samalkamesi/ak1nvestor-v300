#!/usr/bin/env node
// KONTRAKTSSVIT — AKM3-ENSEMBLE (v213b-mönstret, spår 7-fortsättning):
// motor src/lib/akm3/ensemble.ts (BESLUT §4, r5 Design A — steg 1).
//
// Kontrakt som testas (lästa ur motorfilen — aldrig påhittade):
//   · konstanter AKM3_MODELL_VERSION / ENSEMBLE_ALFA / ENIGHET_GRANS_*
//   · enighetFranSpridning: 0–3 p "enig" · 4–7 p "delad" · ≥ 8 p
//     "profilspanning"; ogiltigt tal ⇒ "delad" (mittfacket)
//   · raknaEnsemble: tre raknaAKM2-körningar (en per kanonisk profil,
//     samma moduler), total = round(Σ α_p·K_p) med α = 1/3 LÅST,
//     band {min, median, max}, spridning = max − min, diagnostikdifferenserna
//     (akm2−klassisk, super−akm2), akm2Komposit = jämförelsespåret,
//     datum härleds ur k.hamtat (ingen klocka)
//   · porten följer DATA, inte profilen: kassa 8 mån ⇒ portAktiv=true i
//     alla tre profilernas utsnitt (perProfil.portAktiv)
//   · ren funktion: indata lämnas JSON-identisk; determinism 2×
//   · arAkm3Ensemble formguard (onsdemand-mönstret): modellVersion +
//     total + exakt tre profiler — falskt för skräp
//
// Miljöklass: DETERMINISTISK — inga klockor, inget slump, inget nät, ingen
// Supabase-env. Fixture-formen (HEL/PORT/NUL) är arvet från testa-akm2-karna.
// Kör: node verktyg/testa-motor-akm3-ensemble.mjs
// (Node ≥ 22.18: type stripping via verktyg/ts-import.mjs)
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major > 22 || (major === 22 && minor >= 18))) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping (behöver ≥ 22.18).");
  process.exit(1);
}

const { aktiveraTsImport } = await import(pathToFileURL(join(HÄR, "ts-import.mjs")).href);
aktiveraTsImport();

const {
  AKM3_MODELL_VERSION,
  ENSEMBLE_ALFA,
  ENIGHET_GRANS_ENIG,
  ENIGHET_GRANS_DELAD,
  enighetFranSpridning,
  raknaEnsemble,
  arAkm3Ensemble,
} = await import(pathToFileURL(join(ROT, "src/lib/akm3/ensemble.ts")).href);

let pass = 0, fail = 0;
const kontroll = (namn, villkor) => {
  if (villkor) { pass++; console.log("  PASS " + namn); }
  else { fail++; console.log("  FAIL " + namn); }
};

// ── Fixturer (akm2-kärnsvitens bevisade former) ──────────────────────────────
const KALLOR = [
  { namn: "Yahoo Finance", hamtat: "2026-09-01" },
  { namn: "MarketStack", hamtat: "2026-09-01" },
];
// HEL — välskött industri, full data, kassa 80 mån (ingen port).
const HEL = {
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
// PORT — som HEL men kassa 8 mån ⇒ hård port (V19 < 12 mån).
const PORT = { ...HEL, ticker: "POR.ST", namn: "Porten AB", stabilitet: { ...HEL.stabilitet, kassaManaderBurnRate: 8 } };
// NUL — allt osatt: kärnan svarar osatt, ensemblen ärvs ärligt.
// (Ingen spread från HEL: serier/aterkop skulle annars läcka mätta värden.)
const NUL = {
  ...HEL, ticker: "NUL.ST", namn: "Nolla AB", pris: null, marknadsKapitalMdr: null,
  tillvaxt: { omsattningCAGR5ar: null, resultatCAGR5ar: null, omsattningTillvaxtTTM: null, prognosTillvaxt: null },
  lonksamhet: { roe: null, roic: null, bruttoMarginal: null, ebitMarginal: null, nettoMarginal: null, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: null, pb: null, evEbit: null, peg: null, fcfYield: null, egenKapitalMultipl: null },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: undefined,
};

console.log("A — modulkontraktet: exporterna finns");
kontroll("A1 konstanter + funktioner är rätt sorter",
  typeof AKM3_MODELL_VERSION === "string" && typeof ENSEMBLE_ALFA === "number"
  && typeof ENIGHET_GRANS_ENIG === "number" && typeof ENIGHET_GRANS_DELAD === "number"
  && [enighetFranSpridning, raknaEnsemble, arAkm3Ensemble].every((f) => typeof f === "function"));

console.log("B — konstanterna (BESLUT §4: låsta i 2026.09)");
kontroll('B1 AKM3_MODELL_VERSION = "AKM3.2026.09"', AKM3_MODELL_VERSION === "AKM3.2026.09");
kontroll("B2 ENSEMBLE_ALFA = 1/3 (likavikt — noll fria parametrar)", ENSEMBLE_ALFA === 1 / 3);
kontroll("B3 enighetstrappans gränser 3 och 7", ENIGHET_GRANS_ENIG === 3 && ENIGHET_GRANS_DELAD === 7);

console.log("C — enighetFranSpridning: trappan (ren funktion)");
kontroll("C1 spridning 0 och 3 ⇒ enig (gränsen är ≤ 3)",
  enighetFranSpridning(0) === "enig" && enighetFranSpridning(3) === "enig");
kontroll("C2 spridning 4 och 7 ⇒ delad",
  enighetFranSpridning(4) === "delad" && enighetFranSpridning(7) === "delad");
kontroll("C3 spridning 8 och 100 ⇒ profilspanning",
  enighetFranSpridning(8) === "profilspanning" && enighetFranSpridning(100) === "profilspanning");
kontroll("C4 NaN/Infinity ⇒ delad (ogiltigt tal är inget omdöme — mittfacket)",
  enighetFranSpridning(NaN) === "delad" && enighetFranSpridning(Infinity) === "delad");

console.log("D — raknaEnsemble(HEL): det låsta aggregatet");
const r = raknaEnsemble(HEL);
const K = r.perProfil.map((p) => p.komposit);
kontroll("D1 formulär: ticker/namn/datum/total/perProfil/band/spridning/enighet/alfa/diagnostik/akm1Totalt/akm2Komposit",
  r.ticker === "HEL.ST" && r.namn === "Hellas fabrik" && Array.isArray(r.perProfil)
  && typeof r.total === "number" && typeof r.spridning === "number" && typeof r.enighet === "string"
  && typeof r.alfa === "object" && typeof r.diagnostik === "object"
  && typeof r.akm1Totalt === "number" && typeof r.akm2Komposit === "number" && typeof r.band === "object");
kontroll('D2 datum härleds ur k.hamtat (determinism — aldrig klocka)', r.datum === "2026-09-01");
kontroll("D3 modellVersion på resultatet", r.modellVersion === "AKM3.2026.09");
kontroll('D4 perProfil i kanonisk ordning ["akm1-klassisk","akm2-2026","superanalys-2026"]',
  JSON.stringify(r.perProfil.map((p) => p.profil)) === JSON.stringify(["akm1-klassisk", "akm2-2026", "superanalys-2026"]));
kontroll("D5 total = round(Σ α_p·K_p) med α=1/3 — oberoende omräkning",
  r.total === Math.round(K[0] / 3 + K[1] / 3 + K[2] / 3));
kontroll("D6 band.min/max = min/max av de tre K_p",
  r.band.min === Math.min(...K) && r.band.max === Math.max(...K));
kontroll("D7 band.median = mittenvärdet (summa − min − max)",
  r.band.median === K[0] + K[1] + K[2] - Math.min(...K) - Math.max(...K));
kontroll("D8 spridning = max − min", r.spridning === r.band.max - r.band.min);
kontroll("D9 enighet = trappan(spridning) — konsistens mellan fält",
  r.enighet === enighetFranSpridning(r.spridning));
kontroll("D10 alfa: alla tre profilerna 1/3 (LÅST — aggregationen tar EMOTT inga vikter)",
  r.alfa["akm1-klassisk"] === 1 / 3 && r.alfa["akm2-2026"] === 1 / 3 && r.alfa["superanalys-2026"] === 1 / 3);
kontroll("D11 diagnostik: omfördelningseffekt = akm2−klassisk, kategoriMotVariabel = super−akm2",
  r.diagnostik.omfordelningseffekt === r.perProfil[1].komposit - r.perProfil[0].komposit
  && r.diagnostik.kategoriMotVariabel === r.perProfil[2].komposit - r.perProfil[1].komposit);
kontroll("D12 akm2Komposit = jämförelsespåret (profilen akm2-2026:s komposit)",
  r.akm2Komposit === r.perProfil[1].komposit);
kontroll("D13 notering nämner alla tre kompositer och att ensemblen ersätter ALDRIG",
  typeof r.notering === "string" && r.notering.includes("akm1-klassisk") && r.notering.includes("akm2-2026")
  && r.notering.includes("superanalys-2026") && r.notering.includes("ersätter ALDRIG"));

console.log("E — porten följer DATA, inte profilen (PORT-fixturen)");
const rp = raknaEnsemble(PORT);
kontroll("E1 kassa 8 mån ⇒ portAktiv=true i ALLA tre profilernas utsnitt",
  rp.perProfil.length === 3 && rp.perProfil.every((p) => p.portAktiv === true));
kontroll("E2 portat komposit-tak: varje K_p ≤ 45 (V19-regeln slår igenom per profil)",
  rp.perProfil.every((p) => p.komposit <= 45));
kontroll("E3 HEL (kassa 80 mån) ⇒ portAktiv=false överallt",
  r.perProfil.every((p) => p.portAktiv === false));

console.log("F — NUL: osatta ärvs per profil (ärlighet, aldrig gissning)");
const rn = raknaEnsemble(NUL);
kontroll("F1 andelOsatta = 1 för alla tre profiler", rn.perProfil.every((p) => p.andelOsatta === 1));
kontroll("F2 total = 0 och spridning = 0 ⇒ enig (osatta poäng är INTE profilspanning)",
  rn.total === 0 && rn.spridning === 0 && rn.enighet === "enig");
kontroll("F3 fortfarande välformad ensemble (formguard godkänner)", arAkm3Ensemble(rn) === true);

console.log("G — determinism + ren funktion (P1)");
const HEL_FÖRE = JSON.stringify(HEL);
const r2 = raknaEnsemble(HEL);
kontroll("G1 två körningar ⇒ JSON-identiskt resultat", JSON.stringify(r) === JSON.stringify(r2));
kontroll("G2 indata lämnas orörd (ren funktion)", JSON.stringify(HEL) === HEL_FÖRE);

console.log("H — arAkm3Ensemble formguard (läsning av cache-filer)");
kontroll("H1 äkta resultat ⇒ true", arAkm3Ensemble(r) === true);
kontroll("H2 null/{} / sträng ⇒ false", arAkm3Ensemble(null) === false && arAkm3Ensemble({}) === false && arAkm3Ensemble("x") === false);
kontroll("H3 fel modellVersion ⇒ false", arAkm3Ensemble({ ...r, modellVersion: "AKM9.skum" }) === false);
kontroll("H4 två profiler i stället för tre ⇒ false", arAkm3Ensemble({ ...r, perProfil: r.perProfil.slice(0, 2) }) === false);
kontroll("H5 total = NaN ⇒ false", arAkm3Ensemble({ ...r, total: NaN }) === false);
kontroll("H6 perProfil-rad utan komposit-tal ⇒ false",
  arAkm3Ensemble({ ...r, perProfil: [{ profil: "akm1-klassisk" }, ...r.perProfil.slice(1)] }) === false);

// ── kvitto ───────────────────────────────────────────────────────────────────
const totalt = pass + fail;
console.log(`\nSVIT MOTOR AKM3-ENSEMBLE: ${pass} PASS / ${fail} FAIL av ${totalt} kontroller`);
console.log("RESULTAT: " + pass + "/" + totalt + " PASS");
process.exit(fail === 0 ? 0 : 1);
