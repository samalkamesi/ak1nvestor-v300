/**
 * SOND C (s6-u1, fönster 29) — SLUTGILTIG kärnordsfamilj för se-21
 * KEMISEKTORN (primärvals­byte efter v17-tvisten och v15-basfångsten).
 *
 * Sond B (_s6u1o29b-sond.mjs) bevisade: kemisektorn-familjen NULL + 0
 * grannar för 6 ord. Denna sond kompletterar med den FULLSTÄNDIGA planerade
 * kärnordslistan (kursernas egna begrepp: bulkkemi, specialkemi, gödsel,
 * ammoniak, kväve, fosfor, fosfat, balanspriset, Haber-Bosch m.fl.) — korta
 * ord grannkontrolleras här eftersom rond 3:s tolerans är strängare för dem.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

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
console.log("Kedjan LIVE: " + MOTORER.length + " motorer / " + MOTORER.reduce((s, m) => s + m.monster.length, 0) + " monsters");

// ── ROND 1: ytterligare kandidater → NULL ────────────────────────────────────
const KANDIDATER = [
  "vad är bulkkemi?", "vad är bulkkemin?",
  "vad är specialkemi?", "vad är specialkemin?",
  "vad är gödningskemin?", "vad är gödselindustrin?",
  "vad är ammoniaken?", "vad är ammoniak?",
  "vad är kväve?", "vad är fosfor?", "vad är fosfat?",
  "vad är kvävegödseln?",
  "vad är haber-bosch-processen?", "vad är haber-bosch?",
  "vad är balanspriset?", "vad är högkostnadspartnern?",
  "vad är energiräkningen?",
  "vad är molekylens ekonomi?",
  "vad är kemikaliesektorn?",
  "vad är kemicykeln?",
];
let nullFel = 0;
console.log("\n── ROND 1: kandidater (väntat NULL) ──");
for (const f of KANDIDATER) {
  const k = kedja(f);
  if (k) { nullFel++; console.log("  FÅNGAD ( fel ): «" + f + "» → " + k.motor); }
  else console.log("  null        : «" + f + "»");
}

// ── ROND 3: FULLSTÄNDIG grannkontroll ────────────────────────────────────────
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
  // Slutlig planerad familj — se-21 kemisektorn.
  "kemisektorn", "kemisk industri", "kemikaliesektorn",
  "bulkkemi", "bulkkemin", "specialkemi", "specialkemin",
  "gödningskemi", "gödselindustrin", "kvävegödseln",
  "ammoniak", "ammoniaken", "ammoniaksyntesen", "ammoniakprocessen",
  "haber-bosch-processen",
  "kväve", "kvävet", "kvävefixering",
  "fosfor", "fosforn", "fosfat", "fosfatbrottet", "fosforcykeln",
  "processindustrin", "energiintensiv", "energiräkningen",
  "balanspris", "balanspriset", "högkostnadspartnern",
  "molekylens ekonomi", "kemicykeln",
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
        if (a.includes(" ") || b.includes(" ")) continue;
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

console.log("\nRESULTAT: rond1-fel=" + nullFel + " · rond3-grannar=" + grannar);
process.exit(nullFel + grannar > 0 ? 1 : 0);
