/**
 * SOND nästa fönster (s6-u2, verktygsprefix _s6u2o28-) — TVÅNGSMEKANIK:
 * am-09 MARGINALHANDELN + kt-08 OPTIONSFÖRFALLETS DAG.
 *
 * Förutsättning: omgång 27 (manifest auto-s6-1789912510460) är KLART och
 * kvitterat — detta är nästa fönster i spåret; kandidaterna är dokumenterat
 * öppna (u2-omg27-anspråket «ÖPPET FÖR SYSKONEN» + u1:s nedställda
 * marginalhandels-fynd i _s6u1e-sond-omg27.mjs).
 *
 * Rond 1: kandidatfrågor skall vara NULL genom HELA den levande kedjan.
 * Rond 2: kontrollfrågor skall fångas av sina dokumenterade ägare.
 * Rond 3: grannkontroll — planerade kärnord mot SAMTLIGA lagens kärnord.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// Motorlistan läses LIVE ur kedjetestets MOTORDEFS (kan inte ljuga om ordningen).
const kedjaKalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defs = [...kedjaKalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const d of defs) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ ...d, fnk: modul[d.fn], monster: modul[d.arr] });
}
function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return { svar: s, motor: m.namn };
  }
  return null;
}
console.log("Kedjan LIVE: " + MOTORER.length + " motorer / " + MOTORER.reduce((s, m) => s + m.monster.length, 0) + " monsters / register " + KURSREGISTER.length);

// ── ROND 1: kandidatfrågor → NULL ────────────────────────────────────────────
const KANDIDATER = [
  // Monster 1 — am-09 marginalhandeln (u1:s rond-1-rensade lista, oförändrad
  // princip: strukna former dokumenteras i rond 2s kontroller).
  "vad är marginalhandel?", "vad är marginalhandeln?", "hur fungerar marginalhandel?",
  "vad är ett belåningskonto?", "vad är belåningskontot?",
  "vad är det belåningsbara värdet?", "vad är belåningsvärdet?",
  "hur räknar man ut belåningsvärdet?",
  "vad är ett marginalkrav?", "vad är marginalkravet?",
  "vad är värdeandelen?",
  "vad är kaskadpunkten?", "vad är min kaskadpunkt?", "hur räknar man ut kaskadpunkten?",
  "vad är kaskaden?",
  "vad är en tvångsförsäljning?", "vad är kravdagen?", "vad är en kravdag?",
  "vad är underhållskravet?",
  "vad är belåningsfaktorerna?", "vad är en belåningsfaktor?",
  "vad är marginalens två betydelser?",
  // Monster 2 — kt-08 optionsförfallets dag (spår-5-sondens «noll kursägare»-
  // familj + dagens gränsvakter).
  "vad är optionsförfallet?", "vad är förfalloptron?", "vad är en förfalloptron?",
  "vad är magnetkartan?",
  "vad är uteståendet?",
  "vad är open interest?",
  "vad är pin-risken?",
  "vad är utestående kontrakt?",   // skuggningsmisstänkt: optionsdjup «kontrakt»?
  "vad är gamma-hedgning?",        // skuggningsmisstänkt: optionshantverk «gamma»?
  "vad är volatilitetens torka?",
  "vad är rullningen?",
  "vad är häxtimman?",
  "vad är stängningsauktionen?",   // skuggningsmisstänkt: handelsdagen am-05?
];
let nullFel = 0;
console.log("\n── ROND 1: kandidater (väntat NULL) ──");
for (const f of KANDIDATER) {
  const k = kedja(f);
  if (k) { nullFel++; console.log("  FÅNGAD ( fel ): «" + f + "» → " + k.motor); }
  else console.log("  null        : «" + f + "»");
}

// ── ROND 2: kontroller → dokumenterade ägare ─────────────────────────────────
const KONTROLLER = [
  { f: "vad är hävstång?",              agare: "bas" },
  { f: "vad är margin call?",           agare: "bas" },
  { f: "vad är margin of safety?",      agare: "?" },
  { f: "vad är marginalen?",            agare: "?" },
  { f: "vad är värderingsmarginalen?",  agare: "?" },
  { f: "vad är utlåningsgrad?",         agare: "?" },
  { f: "vad är utlåningsräntan?",       agare: "?" },
  { f: "vad är belåningsgrad?",         agare: "?" },   // väntat sektorn (tav 2) — gräns
  { f: "vad är belåningsräntan?",       agare: "?" },   // väntat handelsdagen (tav 2) — gräns
  { f: "vad är förfallodagen?",         agare: "?" },   // väntat optionshantverk (d0) — gräns
  { f: "vad är delta?",                 agare: "?" },   // väntat optionshantverk — gräns
  { f: "vad är en köpoption?",          agare: "?" },
  { f: "vad är gamman?",                agare: "?" },   // väntat optionshantverk/optionsdjup — gräns
  { f: "vad är auktionen?",             agare: "?" },   // handelsdagen?
];
let kontrollFel = 0;
console.log("\n── ROND 2: kontroller (ägare dokumenterade) ──");
for (const { f, agare } of KONTROLLER) {
  const k = kedja(f);
  const fick = k ? k.motor : "NULL";
  const ok = agare === "?" ? true : fick === agare;
  if (!ok) kontrollFel++;
  console.log("  " + (ok ? "ok  " : "FEL ") + " «" + f + "» → " + fick + (agare !== "?" ? " (väntat " + agare + ")" : ""));
}

// ── ROND 3: grannkontroll — planerade kärnord mot alla lagens kärnord ────────
function diafri(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim()
    .normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}
function tavstand(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (!n) return m; if (!m) return n;
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      const kostnad = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kostnad);
    }
    fore = [...nu];
  }
  return fore[m];
}
const MINA_KARNORD = [
  // Monster 1 — am-09 (u1:s rond-3-lista, oförändrad).
  "marginalhandel", "marginalhandeln", "belåningskonto", "belåningskontot",
  "belåningsvärde", "belåningsvärdet", "belåningsbara", "marginalkrav",
  "marginalkravet", "marginkrav", "värdeandel", "värdeandelen",
  "kaskadpunkt", "kaskadpunkten", "kaskaden", "tvångsförsäljning",
  "tvångsförsäljningen", "kravdag", "kravdagen", "underhållskrav",
  "underhållskravet", "belåningsfaktor", "belåningsfaktorerna",
  // Monster 2 — kt-08 (rond 1 avgör vilka som överlever).
  "optionsförfallet", "förfalloptron", "magnetkarta", "magnetkartan",
  "uteståendet", "pin-risken", "volatilitetens torka", "häxtimman",
  "rullningen",
];
let grannar = 0;
console.log("\n── ROND 3: grannkontroll (" + MINA_KARNORD.length + " planerade kärnord mot hela kedjan) ──");
for (const m of MOTORER) {
  for (const monster of m.monster) {
    for (const frk of monster.karnord ?? []) {
      const a = diafri(frk);
      for (const mk of MINA_KARNORD) {
        const b = diafri(mk);
        if (a === b) { grannar++; console.log("  EXAKT DUBBLETT: «" + mk + "» = " + m.namn + "«" + frk + "»"); continue; }
        if (a.includes(" ") || b.includes(" ")) continue; // flerordsfraser matchar via includes, ej tavstånd
        const tolerans = Math.max(a.length, b.length) <= 3 ? 0 : (Math.min(a.length, b.length) <= 7 ? 1 : 2);
        const d = tavstand(a, b);
        if (d <= Math.min(tolerans, 2) && a !== b) {
          grannar++;
          console.log("  GRANNE tav " + d + ": «" + mk + "» ~ " + m.namn + "«" + frk + "»");
        }
      }
    }
  }
}
if (grannar === 0) console.log("  0 riskgrannar — kärnorden mekaniskt fria.");

// Delmängds-faran: dokumenteras i anspråket (traff kräver helordsmatch eller
// tavstånd — delsträngar endast för flerordsfraser).

console.log("\nRESULTAT: rond1-fel=" + nullFel + " · rond2-fel=" + kontrollFel + " · rond3-grannar=" + grannar);
process.exit(nullFel + kontrollFel + grannar > 0 ? 1 : 0);
