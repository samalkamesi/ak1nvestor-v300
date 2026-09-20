/**
 * SOND 2 omgång 25 (s6-u2, manifest auto-s6-1789864506792) — slutgiltiga
 * kärnord för KONTRAHENT-lagret + OMVÄND STÖLD-prototyp (att mina kärnord
 * inte fångar andra lagers kanoniska frågor) + widgetnära formuleringar.
 *
 * Kör: node verktyg/_s6u2-sond2-omg25.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const kedjeSrc = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defsBlock = kedjeSrc.slice(kedjeSrc.indexOf("const MOTORDEFS = ["), kedjeSrc.indexOf("];", kedjeSrc.indexOf("const MOTORDEFS = [")));
const MOTORDEFS = [...defsBlock.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const motorer = [];
for (const d of MOTORDEFS) {
  const mod = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  motorer.push({ ...d, fn: mod[d.fn], arr: mod[d.arr] });
}
function kedja(fraga) {
  for (let i = 0; i < motorer.length; i++) {
    const svar = motorer[i].fn(fraga, KURSREGISTER);
    if (svar) return { motor: i, namn: motorer[i].namn, svar };
  }
  return null;
}
function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
function tav(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
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

const allaKarnord = new Set();
for (const m of motorer) for (const monster of m.arr) for (const k of monster.karnord) allaKarnord.add(diafri(k));

// ── Slutliga kandidat-kärnord för kontrahent-lagret ─────────────────────────
const MINA_KARNORD = [
  // monster 1: kontrahentrisken + nettingen
  "kontrahent", "kontrahentrisk", "kontrahentrisk", "kontrahenter", "motpart", "motparten", "motparter",
  "netting", "motpartsrisk", "lehman", "nettoavtal",
  // monster 2: clearinghuset + marginalerna
  "clearinghus", "clearingcentral", "central motpart", "centrala motparten", "collateral", "säkerhetskrav",
  "garantifond", "default-trappa", "pant", "haircut", "haircuts",
];
console.log("== MINA KÄRNORDS NÄRMASTE GRANNAR (hot = inom motorns tolerans) ==");
for (const p of MINA_KARNORD) {
  const pd = diafri(p);
  const max = pd.includes(" ") ? 999 : (pd.length <= 3 ? 0 : pd.length <= 7 ? 1 : 2);
  const hot = [], nara = [];
  for (const k of allaKarnord) {
    if (k === pd) { hot.push(k + "(DUBBLETT)"); continue; }
    if (k.includes(" ") !== pd.includes(" ")) continue;
    const d = tav(pd, k);
    if (d <= max) hot.push(`${k}(${d})`);
    else if (d <= max + 2) nara.push(`${k}(${d})`);
  }
  console.log(`  ${p} [max=${max}]${hot.length ? " HOT: " + hot.join(", ") : ""}${nara.length ? " nära: " + nara.join(", ") : ""}`);
}

// ── Testfrågor genom kedjan (får vara NULL eller snudda bara mina) ──────────
console.log("\n== TESTFRÅGOR (måste vara NULL innan wiring) ==");
for (const f of [
  "vad är kontrahentrisk?",
  "vad är en kontrahent?",
  "vem är motparten?",
  "vad är motpartsrisk?",
  "vad är netting?",
  "vad är ett clearinghus?",
  "vad är en clearingcentral?",
  "vad är collateral?",
  "vad är en garantifond?",
  "vad är en haircut?",
  "vad är säkerhetskrav?",
  "vem betalar när en bank går omkull?",
  "vad hände med lehman?",
]) {
  const r = kedja(f);
  console.log(`  ${r ? `[${String(r.motor).padStart(2)} ${r.namn}]` : "NULL          "} ${f}`);
}

// ── OMVÄND STÖLD: mina kärnord mot KEDJETESTETS kanoniska frågor ────────────
// (same match logic as the engine: kärnord måste träffa frågan)
function traff(fragaOrd, fragaStr, nyckelord) {
  const nk = diafri(nyckelord);
  if (!nk) return false;
  if (nk.includes(" ")) return fragaStr.includes(nk);
  if (nk.length <= 3) return fragaOrd.includes(nk);
  const max = nk.length <= 7 ? 1 : 2;
  return fragaOrd.some((o) => tav(o, nk) <= max);
}
const kanoniskaBlock = kedjeSrc.slice(kedjeSrc.indexOf("const KANONISKA = ["), kedjeSrc.indexOf("];", kedjeSrc.indexOf("const KANONISKA = [")));
const KANONISKA = [...kanoniskaBlock.matchAll(/\{ fraga: "([^"]+)",\s*motor: (\d+) \}/g)].map((m) => m[1]);
console.log("\n== OMVÄRD STÖLD-PROTOTYP: mina kärnord mot " + KANONISKA.length + " kanoniska frågor ==");
let stolder = 0;
for (const f of KANONISKA) {
  const fs = diafri(f);
  const fo = fs.split(" ");
  const tjuvar = MINA_KARNORD.filter((k) => traff(fo, fs, k));
  if (tjuvar.length) { stolder++; console.log(`  STÖLD: "${f}" fångas av: ${tjuvar.join(", ")}`); }
}
if (!stolder) console.log("  0 stölder — alla kanoniska frågor lämnas ifred");
