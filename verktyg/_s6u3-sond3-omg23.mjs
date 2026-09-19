/**
 * SOND omgång 23, s6-u3 — ROND 3: slutgiltiga VARDEGRUND-formuleringar +
 * grannkärnord för de nya varianterna (tillgångsbaserad, terminalvärde).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const widgetKalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const FN_TILL_FIL = { svaraLokalt: "ai-mentor-svar.ts" };
for (const m of widgetKalla.matchAll(/import \{ (svaraLokalt\w+)(?:, )?(svaraLokalt\w+)? \} from "@\/lib\/(ai-mentor-[a-z0-9-]+)";/g)) {
  if (m[1]) FN_TILL_FIL[m[1]] = m[3] + ".ts";
  if (m[2]) FN_TILL_FIL[m[2]] = m[3] + ".ts";
}
const rad = widgetKalla.match(/const lokalt = ([^;]+);/);
const fns = [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]);

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);

const MOTORER = [];
const KARNORD = [];
for (const fn of fns) {
  const fil = FN_TILL_FIL[fn];
  if (!fil) continue;
  const m = await import(pathToFileURL(join(ROT, "src/lib/" + fil)).href);
  MOTORER.push({ namn: fn.replace("svaraLokalt", "").toLowerCase() || "bas", fnk: m[fn] });
  const arrNamn = Object.keys(m).find((k) => Array.isArray(m[k]) && /MONSTER/.test(k));
  if (arrNamn) for (const mo of m[arrNamn]) KARNORD.push(...(mo.karnord ?? []));
}
function vem(fraga) {
  for (const m of MOTORER) { const s = m.fnk(fraga, KURSREGISTER); if (s) return m.namn; }
  return null;
}

const FRAGOR = [
  // M1 vardegrund
  "vad är intrinsic value?",
  "hur räknar man ut intrinsic value?",
  "vad är motiverat värde?",
  "hur räknar man ut motiverat värde?",
  "vad är fair value?",
  "vad är verkligt värde?",
  "vad är aktiens värde?",
  "vad är motiverat aktiepris?",
  // M2 realoptioner
  "vad är realoptioner?",
  "vad är en realoption?",
  "vad är verkliga optioner?",
  "vad är en real option?", /* risktest: optionsdjupets 'option'? */
  "hur värderar man flexibilitet?",
  "vad är värdet av att vänta?",
  // M3 kassaflödesavkastning / asset-based
  "vad är kassaflödesavkastning?",
  "hur räknar man ut kassaflödesavkastning?",
  "vad är asset based valuation?",
  "vad är tillgångsbaserad värdering?",
  "hur värderar man tillgångar?",
  "vad är balansräkningens värde?", /* dummer-lik */
  // grannkontroller
  "vad är terminalvärdet?", /* vr-07-granne */
  "vad är wacc?", /* vm-11-granne: varderjustering äger? */
];
console.log("── Frågor genom kedjan (NULL = fria):");
for (const f of FRAGOR) {
  const a = vem(f);
  console.log("  " + (a === null ? "NULL     " : "FÅNGAD " + a).padEnd(30) + " «" + f + "»");
}

const PLANERADE = [
  "intrinsic value", "motiverat värde", "motiverade värde", "verkligt värde", "fair value",
  "motiverat aktiepris",
  "realoptioner", "realoption", "verkliga optioner", "verklig option", "real option",
  "flexibilitetens värde", "värdet av att vänta",
  "kassaflödesavkastning", "kassaflödesavkastningen",
  "asset based valuation", "tillgångsbaserad värdering", "tillgångsvärdering",
];
console.log("\n── Kärnordsdisjunktion (tavstånd ≤ 2 mot " + KARNORD.length + " kärnord):");
const rens = (s) => s.replace(/[-/]/g, "");
for (const p of PLANERADE) {
  const gran = KARNORD.filter((k) => {
    const a = rens(k), b = rens(p);
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 2) return false;
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return dp[a.length][b.length] <= 2;
  });
  console.log("  " + (gran.length === 0 ? "FRITT   " : "GRANNE " + JSON.stringify(gran)).padEnd(70) + " «" + p + "»");
}
