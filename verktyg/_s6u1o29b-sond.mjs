/**
 * SOND B (s6-u1, fönster 29) — efter v17-tvisten: syskonet s6-u2:s fysiska
 * bygge (handelsemotor, 22:24–22:25 lokal) äger avtalsgrenen trots mitt
 * äldre anspråk (22:19:54 mot deras 22:22:10) — duplikat är förlorat
 * arbete, jag väljer nytt territorium.
 *
 * Primärval: v15 NÄTVERKSEFFEKTER (MOAT:s sista lösa kurs sedan syskonet
 * aktiverar v13 — KATEGORICLOSURE MOAT).
 * Reserv: se-21 KEMISEKTORN (SEKTORANALYS:s enda lösa — closure).
 *
 * Rond 1: kandidatfrågor skall vara NULL genom HELA den levande kedjan
 * (nu 71 motorer — syskonets handelsemotor inräknad om wiread; sonden
 * läser MOTORDEFS LIVE).
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
console.log("Handelsemotor i defs: " + (defs.some((d) => d.namn === "handelsemotor") ? "JA (syskonet wiread)" : "NEJ ännu"));

// ── ROND 1: kandidatfrågor → NULL ────────────────────────────────────────────
const KANDIDATER = [
  // v15 nätverkseffekter — moatens fjärde klassiker.
  "vad är nätverkseffekter?", "vad är nätverkseffekten?",
  "vad är en nätverkseffekt?",
  "vad är metcalfes lag?", "vad är metcalfe-lagen?",
  "vad är tvåsidiga nätverk?", "vad är ett tvåsidigt nätverk?",
  "vad är plattformseffekten?",
  "vad är direkt nätverkseffekt?", "vad är indirekt nätverkseffekt?",
  "vad är nätverkets täthet?",
  "vad är kritiska massan?", "vad är den kritiska massan?",
  "vad är winner takes it all?", "vad är winner-takes-all?",
  "vad är ekosystemlåsningen?",   // skuggningsmisstänkt: ekosystemdjup?
  "vad är komplementörerna?",
  "vad är datafördelen?",         // skuggningsmisstänkt: moatdjup?
  // se-21 kemisektorn — reservval.
  "vad är kemisektorn?",
  "vad är kvävefixeringen?",
  "vad är ammoniakprocessen?",
  "vad är fosforcykeln?",
  "vad är processindustrin?",
  "vad är energikostnadens andel?",
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
  { f: "vad är en moat?",                  agare: "?" },
  { f: "vad är moat-erosion?",             agare: "?" },
  { f: "vad är prisfullmakten?",           agare: "moatdjup" },
  { f: "vad är byteskostnaderna?",         agare: "moatdjup" },
  { f: "vad är kostnadsöverlägsenheten?",  agare: "?" },
  { f: "vad är patent?",                   agare: "?" },  // v13 — syskonets källa
  { f: "vad är kvalitetspremien?",         agare: "?" },
  { f: "vad är sell the news?",            agare: "?" },  // syskonets monster 1
  { f: "vad är en avsiktsförklaring?",     agare: "?" },  // syskonets monster 2
  { f: "vad är gruvsektorn?",              agare: "?" },  // se-20:s ägare
  { f: "vad är kemisektorn?",              agare: "?" },
  { f: "vad är en moat i siffror?",        agare: "?" },
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
  // v15-nätverkseffekter (primär).
  "nätverkseffekt", "nätverkseffekten", "nätverkseffekter",
  "metcalfes lag", "tvåsidigt nätverk", "tvåsidiga nätverk",
  "plattformseffekt", "plattformseffekten",
  "direktnätverk", "indirekt nätverkseffekt",
  "nätverkets täthet", "kritiska massan",
  "winner takes it all", "winner-takes-all",
  "komplementör", "komplementörerna", "datafördel", "datafördelen",
  // se-21-kemisektorn (reserv — rond 1 avgör).
  "kemisektorn", "kvävefixering", "ammoniakprocessen",
  "fosforcykeln", "processindustrin", "energiintensiv",
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

console.log("\nRESULTAT: rond1-fel=" + nullFel + " · rond2-fel=" + kontrollFel + " · rond3-grannar=" + grannar);
process.exit(nullFel + kontrollFel + grannar > 0 ? 1 : 0);
