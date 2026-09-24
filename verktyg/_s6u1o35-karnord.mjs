/**
 * Sond omgång 35 (s6-u1, krishantering): kärnordskandidater för
 * KRISHANTERING-monstret mot samtliga lagers kärnord (kommentar-strippat
 * — v1-sondens läxa från omgång 34) + kartläggning av befintliga
 * kris/ras/krasch/panik/drawdown-ord i ALLA lager (kärn OCH stark).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HÄR = dirname(fileURLToPath(import.meta.url));
const LIB = join(HÄR, "../src/lib");

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

// Samla kärnord (kommentar-strippat) + starkord från alla lager
const filer = readdirSync(LIB).filter((f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts"));
const allaKarn = new Map(); // ord -> fil
const allaStark = new Map();
for (const f of filer) {
  const kod = readFileSync(join(LIB, f), "utf8").split("\n").filter((r) => !r.trim().startsWith("//")).join("\n");
  for (const block of kod.matchAll(/karnord: \[([^\]]+)\]/g))
    for (const om of block[1].matchAll(/"([^"]+)"/g)) allaKarn.set(diafri(om[1]), f);
  for (const block of kod.matchAll(/starkord: \[([^\]]+)\]/g))
    for (const om of block[1].matchAll(/"([^"]+)"/g)) allaStark.set(diafri(om[1]), f);
}
console.log("Lager: " + filer.length + " · kärnord: " + allaKarn.size + " · starkord: " + allaStark.size);

// 1) Befintliga kris-nära ord (gränskartan)
console.log("\n── Befintliga kris/ras/krasch/panik/drawdown/återhämtning-ord ──");
for (const [ord, fil] of [...allaKarn.entries()].sort()) {
  if (/kris|raset|krasch|panik|drawdown|aterhamtning|kollaps|turbulens/.test(ord))
    console.log("  KÄRN  «" + ord + "» ← " + fil.replace("ai-mentor-", "").replace("-fragor.ts", ""));
}
for (const [ord, fil] of [...allaStark.entries()].sort()) {
  if (/kris|ras|krasch|panik|drawdown|aterhamtning|kollaps/.test(ord))
    console.log("  STARK «" + ord + "» ← " + fil.replace("ai-mentor-", "").replace("-fragor.ts", ""));
}

// 2) Mina kandidater — exakt + tav ≤ 2 mot kärnord (J-fallets logik)
const kandidater = [
  "krishantering", "krishanteringens", "krisplan", "krisplanen", "krisprotokollet",
  "krischecklistan", "krisreglerna",
  "börsras", "börsraset", "börsfallet", "börskrasch", "börskraschen",
  "nedgångens aritmetik", "återhämtningstiden",
  "panikförsäljning", "panikförsäljningen",
  "krisportföljen", "kriskassan", "buffertkassan",
  "drawdown", "maxdrawdown", "upplevda förluster",
  "tid i fall", "krissparandet", "krislugn",
];
console.log("\n── Kandidater mot " + allaKarn.size + " kärnord (tav ≤ 2 = KOLLISION) ──");
let fria = 0;
for (const k of kandidater) {
  const b = diafri(k);
  const kolliderar = [];
  for (const [a, fil] of allaKarn.entries()) {
    if (a === b) kolliderar.push("EXAKT «" + a + "» ← " + fil);
    else if (a.includes(" ") || b.includes(" ")) continue;
    else {
      const tolerans = Math.max(a.length, b.length) <= 3 ? 0 : (Math.min(a.length, b.length) <= 7 ? 1 : 2);
      const d = tavstand(a, b);
      if (d <= Math.min(tolerans, 2) && a !== b) kolliderar.push("tav " + d + ": «" + a + "» ← " + fil);
    }
  }
  if (kolliderar.length === 0) { fria++; console.log("  FRITT  «" + k + "»"); }
  else console.log("  UPPTAGT «" + k + "» — " + kolliderar.join(" | "));
}
console.log("\nFria: " + fria + "/" + kandidater.length);
