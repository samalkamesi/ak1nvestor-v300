/**
 * SOND 2 omgång 24 (s6-u2) — NULL-test av delbegreppsformuleringar för
 * kandidaterna moatdjup (mt-blockets 7 mentorväglösa kurser) och
 * bull/bear-marknaden (bf-15 + bull-boken lösa) + grannkontroll.
 *
 * Kör: node verktyg/_s6u2-sond2-omg24.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const kedjeSrc = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defsBlock = kedjeSrc.slice(kedjeSrc.indexOf("const MOTORDEFS = ["), kedjeSrc.indexOf("];", kedjeSrc.indexOf("const MOTORDEFS = [")));
const MOTORDEFS = [...defsBlock.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4] }));
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
  if (n === 0) return m; if (m === 0) return n;
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) { nu[0] = i; for (let j = 1; j <= m; j++) { const c = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1; nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + c); } fore = [...nu]; }
  return fore[m];
}
const allaKarnord = new Set();
for (const m of motorer) for (const monster of m.arr) for (const k of monster.karnord) allaKarnord.add(diafri(k));

// ── Rond 2a: NULL-test — moat-DELBEGREPP (moat/vallgrav ägs av extra) ──────
const KANDIDATER = [
  "vad är prisfullmakten?",
  "vad är prisfullmakt?",
  "hur testar man prisfullmakten?",
  "vad är byteskostnader?",
  "vad är byteskostnad?",
  "hur räknar man på byteskostnader?",
  "vad är inlåsningseffekten?",
  "vad är kostnadsöverlägsenhet?",
  "vad är kostnadsoverlagsenhet?",
  "vad är kvalitetspremien?",
  "hur mäter man en moat i siffror?",
  "vallgraven i siffror?",
  "hur föds en vallgrav?",
  "hur byggs en vallgrav?",
  // bull/bear + bubbla
  "vad är en bullmarknad?",
  "vad är en bearmarknad?",
  "vad är bull market?",
  "vad är bear market?",
  "vad är ett börsras?",
  "vad är en börsbubbla?",
  "hur uppstår en bubbla?",
  "vad är bubblans anatomi?",
  "boom and bust?",
  "vad är boom and bust?",
  // terminer (od-07 löst)
  "vad är en termin?",
  "vad är terminer?",
  "vad är ett terminskontrakt?",
  // operativ hävstång (ln-03 löst)
  "vad är operativ hävstång?",
  "vad är marginaltrappan?",
];
console.log("== ROND 2a: NULL-test ==");
for (const f of KANDIDATER) {
  const r = kedja(f);
  console.log(`  ${r ? `[${String(r.motor).padStart(2)} ${r.namn}]` : "NULL          "} ${f}`);
}

// ── Rond 2b: grannkontroll för kvarvarande kärnordskandidater ───────────────
const PROTO = [
  "prisfullmakten", "prisfullmakt", "byteskostnader", "byteskostnad", "inlasningseffekten",
  "kostnadsoverlagsenhet", "kvalitetspremien", "bullmarknad", "bearmarknad", "bull market",
  "bear market", "boursras", "terminskontrakt", "termin", "operativ havstavng", "marginaltrappan",
];
console.log("\n== ROND 2b: grannar inom motorns tolerans (1 för ≤7 bokstäver, 2 för ≥8) ==");
for (const p of PROTO) {
  const tol = p.includes(" ") ? 0 : p.length <= 3 ? 0 : p.length <= 7 ? 1 : 2;
  const grannar = [];
  for (const k of allaKarnord) {
    if (p.includes(" ") !== k.includes(" ")) continue;
    const d = tav(p, k);
    if (d > 0 && d <= Math.max(tol, 2)) grannar.push(`${k}(${d})`); // visa även ≤2 för läslighet
  }
  console.log(`  ${p} (tol=${tol})${grannar.length ? " → " + grannar.join(", ") : " → (rent)"}`);
}
