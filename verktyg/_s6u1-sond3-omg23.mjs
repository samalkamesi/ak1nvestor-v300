/**
 * SOND omgång 23, s6-u1 — ROND 4 (VAL): REALEKONOMI-familjens slutliga
 * kärnordslista mot HELA kedjans kärnord (tavstånd ≤ 2 = granne, PLUS den
 * funktionella matchar-toleransen per längd: ≤3 exakt, 4–7 → 1, ≥8 → 2)
 * + slutliga frågeprober (inkl. kanonisk «vad är realekonomin?»).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const widgetKalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const FN_TILL_FIL = {};
for (const m of widgetKalla.matchAll(/import \{ (svaraLokalt\w*)(?:, )?(\w+)? \} from "@\/lib\/(ai-mentor-[a-z0-9-]+)";/g)) {
  if (m[1]) FN_TILL_FIL[m[1]] = m[3] + ".ts";
  if (m[2] && m[2].startsWith("svaraLokalt")) FN_TILL_FIL[m[2]] = m[3] + ".ts";
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
const { readdirSync } = await import("node:fs");
const WIRADE = new Set(Object.values(FN_TILL_FIL));
for (const f of readdirSync(join(ROT, "src/lib"))) {
  if (!f.startsWith("ai-mentor-") || !f.endsWith("-fragor.ts") || WIRADE.has(f)) continue;
  try {
    const m = await import(pathToFileURL(join(ROT, "src/lib/" + f)).href);
    const arrNamn = Object.keys(m).find((k) => Array.isArray(m[k]) && /MONSTER/.test(k));
    if (arrNamn) for (const mo of m[arrNamn]) KARNORD.push(...(mo.karnord ?? []));
  } catch { /* syskonfil mitt i skrivning */ }
}
console.log("Kedja LIVE: " + MOTORER.length + " motorer · " + KARNORD.length + " kärnord (inkl. disk)");

function vem(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return m.namn;
  }
  return null;
}

// Slutliga kärnord (REALEKONOMI_MONSTER)
const KARN = [
  // Paraplyet
  "realekonomi", "realekonomin", "realekonomins",
  // Arbetsmarknaden (mk-02)
  "arbetslöshet", "arbetslösheten", "arbetslöshetsgrad", "arbetslöshetsgraden",
  "sysselsättning", "sysselsättningen", "arbetsmarknad", "arbetsmarknaden",
  "arbetskraftsdeltagande", "nairu", "phillips-kurvan", "phillipskurvan", "aku",
  // Handelsbalansen (mk-03)
  "handelsbalans", "handelsbalansen", "bytesbalans", "bytesbalansen",
  "handelsöverskott", "handelsunderskott", "j-kurvan", "reer", "utrikeshandel",
  // Oljepriset (mk-10)
  "oljepris", "oljepriset", "oljeprisets", "olja", "råolja", "brent", "opec",
  // Finanspolitiken (mk-07)
  "finanspolitik", "finanspolitiken", "finanspolitisk", "statsbudget", "statsbudgeten",
  "statsfinanser", "statsfinanserna", "skattepolitik", "utgiftstak", "överskottsmål",
  "multiplikatoreffekt",
  // Geopolitiken (mk-05)
  "geopolitik", "geopolitiken", "geopolitisk", "gpr", "sanktioner", "handelskrig",
  // Kina-ekonomin (mk-11)
  "kinaekonomi", "kinaekonomin", "kina", "kinas ekonomi", "kinesiska ekonomin",
  "evergrande",
];

console.log("\n── Slutlig kärnordsdisjunktion (" + KARN.length + " ord) mot kedjans " + KARNORD.length + ":");
const rens = (s) => s.replace(/-/g, "");
const funkTolerans = (len) => (len <= 3 ? 0 : len <= 7 ? 1 : 2);
for (const p of KARN) {
  const gran = [];
  const funkGran = [];
  for (const k of KARNORD) {
    const a = rens(k), b = rens(p);
    if (a === b) { gran.push(k + " (IDENTISK)"); funkGran.push(k + " (IDENTISK)"); continue; }
    if (Math.abs(a.length - b.length) > 2) continue;
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    const d = dp[a.length][b.length];
    if (d <= 2) gran.push(k + " (d=" + d + ")");
    if (d <= funkTolerans(rens(p).length)) funkGran.push(k + " (d=" + d + ")");
  }
  const status = funkGran.length === 0 ? (gran.length === 0 ? "FRITT   " : " blanket2-granne (funk-säker)") : " FUNK-KROCK " + JSON.stringify(funkGran);
  console.log("  " + String(gran.length === 0 ? "FRITT" : "GRANNE " + JSON.stringify(gran)).padEnd(52) + status.padEnd(30) + " «" + p + "»");
}

console.log("\n── Slutliga frågeprober (NULL = fria):");
for (const f of [
  "vad är realekonomin?", "vad är realekonomi?", "vad är den reala ekonomin?",
  "vad är nairu?", "vad är phillips-kurvan?", "vad är aku?",
  "vad är bytesbalansen?", "vad är reer?", "vad är j-kurvan?", "vad är utrikeshandel?",
  "vad är opec?", "vad är brent?", "vad är råolja?",
  "vad är utgiftstak?", "vad är överskottsmål?", "vad är statsbudgeten?",
  "vad är gpr?", "vad är sanktioner?", "vad är handelskrig?",
  "vad är evergrande?", "vad är kina?",
  // kontroller: tidigare lagers territorier skall stanna
  "vad är bnp?", "vad är penningpolitik?", "vad är inflation?",
  "vad är ränta?", "vad är valutarisk?", "vad är konjunkturindikatorer?",
]) {
  console.log("  " + String(vem(f)).padEnd(20) + " «" + f + "»");
}
