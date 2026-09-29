#!/usr/bin/env node
// KONTRAKTSSVIT — AKM3-OSAKERHET (v213b-mönstret, spår 7-fortsättning):
// motor src/lib/akm3/osakerhet.ts (AKM3-BESLUT §5 + r4-osakerhet §2 — steg 3).
//
// Kontrakt som testas (lästa ur motorfilen — aldrig påhittade):
//   · PORT_TAK = 45 (V19 hård port takar övre gräns)
//   · raknaIntervall: Manski-bounds utan antaganden — nedre = K (värsta
//     fallet: osatt vikt poängsatt 0 p), ovre = min(100, K + 100·(1−t)),
//     halvbredd = (ovre−nedre)/2, konfidens = t (aldrig dold), t clampas
//     [0,1]; saknas K eller t ⇒ null (modellen gissar aldrig — P3)
//   · porttaket: portAktiv && naiv övre > 45 ⇒ 45 + portTakad=true;
//     annars lämnas den naiva gränsen orörd
//   · raknaFullviktsIntervall: [K·t, min(100, K·t + 100·(1−t))] — den
//     äkta raden OM profilen behålls; alltid innesluten i primärspannet
//   · visningsformaten (detaljsida/chipp/spann — dokumenterade exempel ur
//     filhuvudet, svenska decimaler, deterministiska utan lokaler):
//     "58 [58–91] (täckning 67 %)" · "58 ± 16,5 (täckning 67 %)" · "[58–91]"
//   · presentationslager: LÄSER poäng, ändrar ALDRIG någon poäng (ren modul
//     — inga imports alls, inga klockor, inget slump)
//
// Miljöklass: DETERMINISTISK — modulen är helt fri från imports, nät och
// klockor. Kör: node verktyg/testa-motor-akm3-osakerhet.mjs
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
  PORT_TAK,
  raknaIntervall,
  raknaFullviktsIntervall,
  intervallText,
  intervallPlusText,
  spannText,
} = await import(pathToFileURL(join(ROT, "src/lib/akm3/osakerhet.ts")).href);

let pass = 0, fail = 0;
const kontroll = (namn, villkor) => {
  if (villkor) { pass++; console.log("  PASS " + namn); }
  else { fail++; console.log("  FAIL " + namn); }
};
const nara = (fått, vant, tol = 1e-9) => Math.abs(fått - vant) <= tol;

console.log("A — modulkontraktet: exporterna finns");
kontroll("A1 PORT_TAK tal + fem funktioner",
  typeof PORT_TAK === "number"
  && [raknaIntervall, raknaFullviktsIntervall, intervallText, intervallPlusText, spannText].every((f) => typeof f === "function"));

console.log("B — konstanten");
kontroll("B1 PORT_TAK = 45", PORT_TAK === 45);

console.log("C — raknaIntervall: Manski-bounds ur (K, t)");
const ex = raknaIntervall(58, 0.67);
kontroll("C1 filhuvudets exempel: K=58, t=0,67 ⇒ nedre 58, ovre 91, halvbredd 16,5",
  ex !== null && ex.nedre === 58 && ex.ovre === 91 && nara(ex.halvbredd, 16.5));
kontroll("C2 full täckning (t=1) ⇒ punkt: ovre = K, halvbredd 0",
  (() => { const i = raknaIntervall(72, 1); return i !== null && i.ovre === 72 && i.halvbredd === 0; })());
kontroll("C3 noll täckning (t=0) ⇒ ovre = min(100, K+100)",
  (() => { const i = raknaIntervall(30, 0); return i !== null && i.nedre === 30 && i.ovre === 100; })());
kontroll("C4 hundrataket: K=90, t=0,5 ⇒ ovre = 100 (aldrig över 100)",
  (() => { const i = raknaIntervall(90, 0.5); return i !== null && i.ovre === 100; })());
kontroll("C5 t clampas överifrån: t=1,5 ⇒ samma som t=1",
  JSON.stringify(raknaIntervall(58, 1.5)) === JSON.stringify(raknaIntervall(58, 1)));
kontroll("C6 t clampas underifrån: t=−0,5 ⇒ samma som t=0",
  JSON.stringify(raknaIntervall(58, -0.5)) === JSON.stringify(raknaIntervall(58, 0)));
kontroll("C7 resultatet bär det clampade t:et (konfidensen aldrig dold)",
  raknaIntervall(58, 1.5) !== null && raknaIntervall(58, 1.5).tackning === 1
  && raknaIntervall(58, -0.5) !== null && raknaIntervall(58, -0.5).tackning === 0);
kontroll("C8 poäng-fältet ekar in-K (spannet läser poängen)",
  ex !== null && ex.poang === 58 && ex.portTakad === false);

console.log("D — porttaket (V19: porten slår igenom — kärnans regel följer DATA)");
const dp = raknaIntervall(58, 0.67, true);
kontroll("D1 portAktiv + naiv övre 91 > 45 ⇒ ovre = 45 och portTakad = true",
  dp !== null && dp.ovre === 45 && dp.portTakad === true);
kontroll("D2 halvbredden räknas på det TAKADE spannet: (45−58)/2 = −6,5",
  dp !== null && nara(dp.halvbredd, -6.5));
kontroll("D3 portAktiv men naiv övre ≤ 45 ⇒ orörd, ej takad",
  (() => { const i = raknaIntervall(20, 0.95, true); return i !== null && nara(i.ovre, 25) && i.portTakad === false; })());
kontroll("D4 utan port lämnas naiva gränsen orörd även över 45",
  (() => { const i = raknaIntervall(58, 0.67, false); return i !== null && i.ovre === 91 && i.portTakad === false; })());
kontroll("D5 noten avslöjar porttaket endast när det verkställts",
  dp !== null && dp.note.includes("hård port") && ex !== null && !ex.note.includes("hård port"));

console.log("E — null-ärligheten (P3: osatt är osatt, modellen gissar aldrig)");
kontroll("E1 K = null ⇒ null", raknaIntervall(null, 0.5) === null);
kontroll("E2 K = undefined ⇒ null", raknaIntervall(undefined, 0.5) === null);
kontroll("E3 t = null ⇒ null", raknaIntervall(58, null) === null);
kontroll("E4 K = NaN ⇒ null", raknaIntervall(NaN, 0.5) === null);
kontroll("E5 t = NaN ⇒ null", raknaIntervall(58, NaN) === null);
kontroll("E6 fullviktsraden tiger likadant: null-K ⇒ null", raknaFullviktsIntervall(null, 0.5) === null
  && raknaFullviktsIntervall(58, null) === null);

console.log("F — raknaFullviktsIntervall: profilen behållen vid full data");
const fw = raknaFullviktsIntervall(58, 0.67);
kontroll("F1 [K·t, min(100, K·t + 100·(1−t))] — 58/0,67 ⇒ [38,86, 71,54]",
  fw !== null && nara(fw.nedre, 58 * 0.67) && nara(fw.ovre, 58 * 0.67 + 100 * 0.33));
kontroll("F2 fulltäckning ⇒ punkten [K, K]",
  (() => { const f = raknaFullviktsIntervall(58, 1); return f !== null && f.nedre === 58 && f.ovre === 58; })());
kontroll("F3 primärspannet är MINST LIKA BRETT som fullviktsspannet (filhuvudets löfte — bredd, ej inneslutning)",
  fw !== null && ex !== null
  && (ex.ovre - ex.nedre) >= (fw.ovre - fw.nedre) - 1e-9);

console.log("G — visningsformaten (detaljsida · chipp · spann — dokumenterade exempel)");
kontroll('G1 intervallText(null) och undefined ⇒ "—"',
  intervallText(null) === "—" && intervallText(undefined) === "—");
kontroll('G2 intervallText(58/0,67) = "58 [58–91] (täckning 67 %)" — filhuvudets exempel exakt',
  intervallText(ex) === "58 [58–91] (täckning 67 %)");
kontroll('G3 intervallPlusText(58/0,67) = "58 ± 16,5 (täckning 67 %)" — svenskt komma',
  intervallPlusText(ex) === "58 ± 16,5 (täckning 67 %)");
kontroll('G4 spannText(58/0,67) = "[58–91]"', spannText(ex) === "[58–91]");
kontroll('G5 spannText(null) ⇒ "—"', spannText(null) === "—");
kontroll("G6 decimaler utan trailingnollor: K=0, t=0,33 ⇒ halvbredd 33,5 (aldrig 33,50)",
  (() => { const t = intervallPlusText(raknaIntervall(0, 0.33)); return t.includes("± 33,5 ") && !t.includes("33,50"); })());
kontroll("G7 heltalspoäng skrivs utan decimaler (58 — aldrig 58,0)",
  intervallText(ex).startsWith("58 ") && !intervallText(ex).includes("58,0"));

console.log("H — determinism (P1: inga klockor, inga lokaler — hydrationssäkra)");
kontroll("H1 två beräkningar ⇒ JSON-identiskt span",
  JSON.stringify(raknaIntervall(58, 0.67, true)) === JSON.stringify(raknaIntervall(58, 0.67, true)));
kontroll("H2 formateringarna deterministiska (2× samma sträng)",
  intervallText(ex) === intervallText(ex) && intervallPlusText(ex) === intervallPlusText(ex) && spannText(ex) === spannText(ex));
kontroll("H3 noten bär spannet och ärlighetslöftet (aldrig det enda kunden ser — men alltid med)",
  ex !== null && ex.note.includes("[58–91]") && ex.note.includes("Modellen gissar aldrig"));

// ── kvitto ───────────────────────────────────────────────────────────────────
const totalt = pass + fail;
console.log(`\nSVIT MOTOR AKM3-OSAKERHET: ${pass} PASS / ${fail} FAIL av ${totalt} kontroller`);
console.log("RESULTAT: " + pass + "/" + totalt + " PASS");
process.exit(fail === 0 ? 0 : 1);
