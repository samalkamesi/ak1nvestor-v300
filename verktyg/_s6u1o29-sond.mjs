/**
 * SOND (s6-u1, nästa fönster i spår 6) — AVTALSKATALYSATORN: v17 AVTAL &
 * PARTNERSKAP (KATALYSATOR:s sista lösa kurs — kategoriclosure).
 *
 * Förutsättning: s6-u2 fönstret-efter-omgång-27 (tvångsmekanik, 826fb55f)
 * dokumenterade «KATALYSATOR 3 lösa → 1 (v17 kvar)» — detta är spårets
 * dokumenterat öppna fält; mentorlösa-sonden (2026-09-20) bekräftar:
 * KATALYSATOR har exakt 1 lös kurs = v17-avtal-partnerskap.
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
  // v17 avtal & partnerskap — katalysatorns kontrakterade gren.
  "vad är avtalskatalysatorn?", "vad är en avtalskatalysator?",
  "vad är ett partneravtal?", "vad är ett partnerskapsavtal?",
  "vad är partnerskapsavtalet?",
  "vad är ett samarbetsavtal?", "vad är samarbetsavtalet?",
  "vad är ett ramavtal?", "vad är ramavtalet?",
  "vad är ett volymsavtal?", "vad är volymsavtalet?",
  "vad är ett intäktsdelningsavtal?",
  "vad är avtalsstocken?",
  // «orderstocken» → TIDSAXELNS (rond 1-fångst, dokumenterad gräns — bärs
  // i TEXT med attribution; kärnordet «avtalsstock» är mitt).
  "vad är avtalsvärdet?",
  "vad är bindningstiden?",
  "vad är termineringsrätten?",
  "vad är uppsägningsklausulen?",
  "vad är en avsiktsförklaring?",   // skuggningsmisstänkt: kt-04 utebliven katalysator?
  "vad är förskottsintäkterna?",
  // «upparbetade intäkter» → BASENS (rond 1-fångst — dokumenterad gräns,
  // bärs i TEXT med attribution).
  "vad är en milstolpebetalning?",
  // «viktiga avtal» → BASENS (rond 1-fångst — basens generella katalysator-
  // monster äger formuleringen; den kontrakterade grenen är min).
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
  { f: "vad är en katalysator?",            agare: "?" },
  { f: "vad är en katalysatorkedja?",       agare: "?" },  // kt-03:s territorium
  { f: "vad är den uteblivna katalysatorn?", agare: "?" }, // kt-04:s territorium
  { f: "vad är guidningen?",                agare: "nyaterritorier" },
  { f: "vad är optionsförfallet?",          agare: "tvangsmekanik" },
  { f: "vad är kundkoncentration?",         agare: "?" },  // rs-02:s familj
  { f: "vad är relaterade parter?",         agare: "?" },  // km-026:s familj
  { f: "vad är marginalhandeln?",           agare: "tvangsmekanik" },
  { f: "vad är en activist?",               agare: "?" },  // nya territorier?
  // Rond 1-fångstarna som kontroller (dokumenterade gränser):
  { f: "vad är orderstocken?",              agare: "tidsaxel" },
  { f: "vad är upparbetade intäkter?",      agare: "bas" },
  { f: "vad är viktiga avtal?",             agare: "bas" },
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
  "avtalskatalysator", "avtalskatalysatorn", "avtalskatalysatorer",
  "partneravtal", "partneravtalet", "partnerskapsavtal", "partnerskapsavtalet",
  "samarbetsavtal", "samarbetsavtalet", "ramavtal", "ramavtalet",
  "volymsavtal", "volymsavtalet", "intäktsdelningsavtal", "intäktsdelningsavtalet",
  "avtalsstock", "avtalsstocken",
  "avtalsvärde", "avtalsvärdet", "bindningstid", "bindningstiden",
  "termineringsrätt", "termineringsrätten", "uppsägningsklausul", "uppsägningsklausulen",
  "avsiktsförklaring", "avsiktsförklaringen",
  "förskottsintäkt", "förskottsintäkterna",
  "milstolpebetalning", "milstolpebetalningarna",
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
