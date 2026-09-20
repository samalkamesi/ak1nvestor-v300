/**
 * SOND 2 spår 6 omgång 25 — rond 2: tekniska indikatorer-blocket
 * (RSI/MACD/bollinger/glidande medelvärde/elliott/chart-mönster) +
 * bull/bear-djupkoll + basens tekniska monster exakt + AK1TS-registerdata.
 */
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const HÄR = fileURLToPath(new URL(".", import.meta.url));
const ROT = join(HÄR, "..");
const LIB = join(ROT, "src", "lib");
const url = (p) => "file://" + join(p);

function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
function redigeringstavstand(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (n === 0) return m; if (m === 0) return n;
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
function maxFel(len) { return len <= 3 ? 0 : len <= 7 ? 1 : 2; }

const { KURSREGISTER } = await import(url(join(LIB, "ai-mentor-register.ts")));

// Samla kärnord ur ALLA monster-filer (källskannning — samma urval som sond 1)
const filer = readFileSync(join(ROT, "verktyg", "_s6u3o25-sond.mjs"), "utf8")
  .split("\n").filter((l) => l.trim().startsWith('["')).map((l) => {
    const m = /\["[^"]+", "([^"]+)", "([A-Z_0-9-]+)"\]/.exec(l);
    return m ? [m[1], m[2]] : null;
  }).filter(Boolean);

const alla = new Map(); // ord -> motorer
let antalMonster = 0;
for (const [fil, arr] of filer) {
  const modul = await import(url(join(LIB, fil)));
  const monster = modul[arr];
  antalMonster += monster.length;
  for (const m of monster) for (const k of m.karnord) {
    const d = diafri(k);
    if (!alla.has(d)) alla.set(d, new Set());
    alla.get(d).add(fil);
  }
}
console.log("kärnord: " + alla.size + " · monsters: " + antalMonster + " · register: " + KURSREGISTER.length);

// ── Rond 2a: indikator-familjer ─────────────────────────────────────────────
console.log("\n=== ROND 2a: tekniska indikatorer");
const FAMILJ = {
  "RSI": ["rsi", "relative strength index", "relativ styrka index", "överköpt", "översålt", "oversolt"],
  "MACD": ["macd", "moving average convergence", "konvergensdivergens", "signalorgan"],
  "GLIDANDE MEDELVÄRDE": ["glidande medelvärde", "glidande medelvärden", "moving average", "moving averages", "ma", "sma", "ema", "medelvärdeskurva", "dagens genomsnitt"],
  "BOLLINGER": ["bollinger", "bollingerband", "bollinger band", "bollingerbanden", "bollinger bands"],
  "ELLIOTT": ["elliott", "elliott wave", "elliotvåg", "elliottvågor", "vågteori", "vågorna"],
  "CHART-MÖNSTER": ["chartmonster", "chart monster", "chartmönster", "chart mönster", "mönsterdiagram", "huvudaxlar", " axelbrott"],
  "STÖD/MOTSTÅND": ["stodniva", "stödnivå", "motstandsniva", "motståndsnivå", "stöd och motstånd", "utbrott", "breakout"],
  "MOMENTUM": ["momentum", "momentumindikator", "hastighetsmått", "trendstyrka"],
  "BULL/BEAR-komplettering": ["bullmarknad", "bearmarknad", "bullmarknaden", "bearmarknaden", "tjurmarknad", "björnmarknad"],
};
for (const [tema, familj] of Object.entries(FAMILJ)) {
  console.log("\n[" + tema + "]");
  for (const f_raw of familj) {
    const f = diafri(f_raw);
    if (alla.has(f)) { console.log("  " + f_raw + " → ÄGD av " + [...alla.get(f)].map((s) => s.replace("ai-mentor-", "").replace("-fragor.ts", "")).join(", ")); continue; }
    const gran = [];
    for (const [k, agare] of alla) {
      if (k.includes(" ") !== f.includes(" ")) continue;
      if (!k.includes(" ") && !f.includes(" ")) {
        const maxF = Math.max(maxFel(f.length), maxFel(k.length));
        if (maxF > 0 && redigeringstavstand(k, f) <= maxF) gran.push(k + " (" + [...agare][0].replace("ai-mentor-", "").replace("-fragor.ts", "") + ")");
        else if (maxF === 0 && k === f) gran.push(k);
      }
    }
    console.log("  " + f_raw + " → NULL" + (gran.length ? " MEN grannar: " + gran.slice(0, 5).join(", ") : " (RENT)"));
  }
}

// ── Rond 2b: basens tekniska monster exakt ─────────────────────────────────
console.log("\n=== ROND 2b: basens tekniska monsters kärnord (vad FÅNGAR basen?)");
const basModul = await import(url(join(LIB, "ai-mentor-svar.ts")));
const teknisk = basModul.MONSTER.filter((m) => m.id.includes("teknisk") || m.amne?.includes("teknisk"));
for (const m of teknisk) console.log("  bas/" + m.id + ": " + m.karnord.join(" · "));

// ── Rond 2c: AK1TS-registerdata (minuten-fällan) ───────────────────────────
console.log("\n=== ROND 2c: AK1TS-kursernas registerdata");
for (const r of KURSREGISTER.filter((x) => x.kategori === "AK1TS FÖRDJUPNING")) {
  console.log("  " + r.slug + " · minuter=" + r.minuter + " · nivå=" + r.niva + " · kapitel=" + r.kapitel + " · quiz=" + r.quiz);
}
console.log("\n=== BOKMASTER-böcker som källor (candlestick/bollinger/chart):");
for (const slug of ["japanese-candlestick-charting", "bollinger-on-bollinger-bands", "encyclopedia-of-chart-patterns", "martin-pring-on-market-momentum", "technical-analysis-financial-markets", "technical-analysis-of-stock-trends"]) {
  const r = KURSREGISTER.find((x) => x.slug === slug);
  console.log("  " + slug + " · " + (r ? "FINNS minuter=" + r.minuten : "SAKNAS"));
}
