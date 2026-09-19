/**
 * SOND omgång 23, s6-u1 — ROND 2: INDIKATOR-familjen NULL-testad genom
 * hela kedjan LIVE (riktiga matchare, BASMOTORN MEDTAGEN — rundkontroll
 * för importradens två namn), + prototyp-stöldprov: planerade kärnord vs
 * kedjans kärnord (tavstånd ≤ 2 = granne) + gränskontroller mot kända
 * ägare (tidsaxelns konjunkturindikatorer, faktordjupets momentum,
 * tsdjupets fibonacci/volymprofiler, basens teknisk analys).
 *
 * Presedens: _s6u3-sond2-omg22.mjs (omgång 22:s rond 2).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const widgetKalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const FN_TILL_FIL = {};
for (const m of widgetKalla.matchAll(/import \{ (svaraLokalt\w*)(?:, )?(\w+)? \} from "@\/lib\/(ai-mentor-[a-z0-9-]+)";/g)) {
  // \w* (ej \w+): BASMOTORN importeras som naket «svaraLokalt» — och dess
  // importrad bär «fallbackSvar» som andra namn (ej svaraLokalt-prefix) —
  // omgång 21:s kända regex-fälla, här hanterad i båda ändar.
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
  if (!fil) { console.log("VARNING: " + fn + " utan importrad"); continue; }
  const m = await import(pathToFileURL(join(ROT, "src/lib/" + fil)).href);
  MOTORER.push({ namn: fn.replace("svaraLokalt", "").toLowerCase() || "bas", fnk: m[fn] });
  const arrNamn = Object.keys(m).find((k) => Array.isArray(m[k]) && /MONSTER/.test(k));
  if (arrNamn) for (const mo of m[arrNamn]) KARNORD.push(...(mo.karnord ?? []));
}
// Diskutläsning: owirade ai-mentor-*-fragor.ts (syskon mitt i leverans)
const { readdirSync } = await import("node:fs");
const WIRADE = new Set(Object.values(FN_TILL_FIL));
for (const f of readdirSync(join(ROT, "src/lib"))) {
  if (!f.startsWith("ai-mentor-") || !f.endsWith("-fragor.ts") || WIRADE.has(f)) continue;
  try {
    const m = await import(pathToFileURL(join(ROT, "src/lib/" + f)).href);
    const arrNamn = Object.keys(m).find((k) => Array.isArray(m[k]) && /MONSTER/.test(k));
    if (arrNamn) { for (const mo of m[arrNamn]) KARNORD.push(...(mo.karnord ?? [])); console.log("  (diskutläsning: " + f + ")"); }
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

// ── Kandidatfrågor för indikatordjup-monstret ───────────────────────────────
console.log("\n── Kandidatfrågor genom kedjan (NULL = fria):");
const KANDIDATER = [
  // Huvudfamiljen
  "vad är tekniska indikatorer?",
  "vad är en teknisk indikator?",
  "hur fungerar tekniska indikatorer?",
  // Glidande medelvärden
  "vad är glidande medelvärde?",
  "vad är glidande medelvärden?",
  "vad är moving average?",
  "vad är moving averages?",
  "vad är guldencross?",
  "vad är golden cross?",
  "vad är death cross?",
  "vad är dödkorset?",
  "vad är gmv?",
  "vad är ema?",
  // RSI
  "vad är rsi?",
  "vad är relative strength index?",
  "vad är överköpt?",
  "vad är översålt?",
  "vad betyder översålt?",
  // MACD
  "vad är macd?",
  "vad är macd-linjen?",
  "vad är signal linjen?",
  // Bollinger
  "vad är bollinger bands?",
  "vad är bollingerband?",
  "vad är bollingersqueeze?",
  "vad är squeeze?",
  // Stöd/motstånd + trendlinjer
  "vad är stöd och motstånd?",
  "vad är en stödnivå?",
  "vad är motståndsnivåer?",
  "vad är en stödzon?",
  "vad är trendlinjer?",
  "vad är en trendlinje?",
  // Candlesticks
  "vad är candlestick?",
  "vad är candlesticks?",
  "vad är candlestick-mönster?",
  "vad är en doji?",
  "vad är hammer?",
  "vad är engulfing?",
  // Chartmönster + matrisen
  "vad är chartmönster?",
  "vad är 25-cellers matrisen?",
  // Oscillator
  "vad är en oscillator?",
  "vad är momentumoscillator?",
  // Whipsaw
  "vad är whipsaw?",
];
for (const f of KANDIDATER) {
  const a = vem(f);
  console.log("  " + (a === null ? "NULL      " : "FÅNGAD " + a).padEnd(28) + " «" + f + "»");
}

// ── Gränskontroller: KÄNDA ägares frågor (dokumenterar ansvarsfördelning) ──
console.log("\n── Gränskontroller (skall vara FÅNGADE av ägaren):");
const GRANSER = [
  ["vad är momentum?", "faktordjup"],
  ["vad är fibonacci-retracements?", "tsdjup"],
  ["vad är volymprofilen?", "tsdjup"],
  ["vad är konjunkturindikatorer?", "tidsaxel"],
  ["vad är framskrivande indikatorer?", "tidsaxel"],
  ["vad är teknisk analys?", "bas"],
  ["vad är konfluens?", "bas"],
  ["vad är ak1ts?", "bas"],
];
for (const [f, vantat] of GRANSER) {
  const a = vem(f);
  console.log("  " + String(a).padEnd(22) + " (väntat " + vantat + ")  «" + f + "»" + (a === vantat ? "" : "  ← AVVIKELSE"));
}

// ── Kärnordsdisjunktion: planerade kärnord vs kedjans ───────────────────────
const PLANERADE = [
  // Huvudfamiljen (fraser — naket «indikator» VIKAS: tavstånd 2 mot
  // «indikatorer» i tidsaxelns «framskrivande indikatorer»-frågor)
  "teknisk indikator", "tekniska indikatorer",
  // Glidande medelvärden (ts-12)
  "glidande medelvärde", "glidande medelvärden", "moving average", "moving averages",
  "gmv", "ema", "guldencross", "golden cross", "death cross", "dödkors", "dödkorset",
  // RSI (ts-13)
  "rsi", "relative strength index", "överköpt", "överköpta", "översålt", "översålda",
  // MACD (ts-14)
  "macd", "signal linjen", "signallinjen",
  // Bollinger (ts-15)
  "bollinger", "bollingerband", "bollinger bands", "bollingersqueeze",
  // Stöd/motstånd (ts-16)
  "stöd och motstånd", "stödnivå", "stödnivåer", "motståndsnivå", "motståndsnivåer",
  "stödzon", "stödzoner", "stödlinje", "stödlinjer",
  // Trendlinjer (ts-17)
  "trendlinje", "trendlinjer", "trendlinjen",
  // Candlesticks (ts-11)
  "candlestick", "candlesticks", "candlestickmönster", "doji", "hammer", "engulfing",
  // Chartmönster (ts-18)
  "chartmönster", "chartmönstren",
  // Matrisen (ts-10)
  "25 cellers", "25 cellers matrisen",
  // Oscillator/whipsaw
  "oscillator", "oscillatorer", "momentumoscillator", "whipsaw",
];
console.log("\n── Kärnordsdisjunktion (tavstånd ≤ 2 mot kedjans " + KARNORD.length + " kärnord):");
const rens = (s) => s.replace(/-/g, "");
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
  console.log("  " + (gran.length === 0 ? "FRITT   " : "GRANNE " + JSON.stringify(gran)).padEnd(60) + " «" + p + "»");
}

// ── KANONISK genom kedjan (skall vara NULL — ska bli lagrets fråga) ────────
console.log("\n── Kanonisk genom HELA kedjan: «vad är tekniska indikatorer?» ⇒ " + vem("vad är tekniska indikatorer?"));
