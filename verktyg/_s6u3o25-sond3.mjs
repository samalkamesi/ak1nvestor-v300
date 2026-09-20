/**
 * SOND 3 spår 6 omgång 25 — rond 3: RISKHANTERING-blocket.
 * Kandidater: kontrahentrisken (rk-16) + korrelationsrisken (rk-10) +
 * cykelrisken (rk-05) — samt grannfamiljer (clearing, motpart, netting,
 * korrelation, cykel). Även bull/bear- och indexomläggnings-koll för
 * komplettering.
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
const filer = readFileSync(join(ROT, "verktyg", "_s6u3o25-sond.mjs"), "utf8")
  .split("\n").filter((l) => l.trim().startsWith('["')).map((l) => {
    const m = /\["[^"]+", "([^"]+)", "([A-Z_0-9-]+)"\]/.exec(l);
    return m ? [m[1], m[2]] : null;
  }).filter(Boolean);

const alla = new Map();
for (const [fil, arr] of filer) {
  const modul = await import(url(join(LIB, fil)));
  for (const m of modul[arr]) for (const k of m.karnord) {
    const d = diafri(k);
    if (!alla.has(d)) alla.set(d, new Set());
    alla.get(d).add(fil.replace("ai-mentor-", "").replace("-fragor.ts", "").replace(".ts", ""));
  }
}
const kort = (s) => [...s].join(",");

function kolla(familjer) {
  for (const [tema, familj] of Object.entries(familjer)) {
    console.log("\n[" + tema + "]");
    for (const f_raw of familj) {
      const f = diafri(f_raw);
      if (alla.has(f)) { console.log("  " + f_raw + " → ÄGD: " + kort(alla.get(f))); continue; }
      const gran = [];
      for (const [k, agare] of alla) {
        if (k.includes(" ") !== f.includes(" ")) continue;
        if (!k.includes(" ") && !f.includes(" ")) {
          const maxF = Math.max(maxFel(f.length), maxFel(k.length));
          if (redigeringstavstand(k, f) <= maxF) gran.push(k + " (" + [...agare][0] + ")");
        }
      }
      console.log("  " + f_raw + " → NULL" + (gran.length ? " MEN grannar: " + gran.slice(0, 6).join(", ") : " (RENT)"));
    }
  }
}

kolla({
  "KONTRAHENTRISKEN (rk-16)": ["kontrahent", "kontrahenten", "kontrahentrisk", "kontrahentrisken", "kontrahentrisken", "motpart", "motparten", "motpartsrisk", "motpartsrisker", "ccp", "central counterparty"],
  "CLEARING (rk-16)": ["clearing", "clearingen", "clearinghus", "clearinghuset", "clearingmedlem", "netting", "nettingen", "initial margin", "initialmargin", "variation margin", "variationmargin", "säkerhetskrav", "pantställning", "motpartsexponering"],
  "KORRELATIONSRISKEN (rk-10)": ["korrelationsrisk", "korrelationsrisken", "korrelationskoefficient", "korrelation", "korrelationen", "samvariation", "diversifieringskoefficient"],
  "CYKELRISKEN (rk-05)": ["cykelrisk", "cykelrisken", "konjunkturcykeln", "konjunkturcykler", "kapacitetscykeln", "lagcykeln", "bullwhip"],
  "BULL/BEAR djup": ["bullmarknad", "bearmarknad", "tjurmarknad", "björnmarknad", "marknadsfas", "marknadsfaser", "syklustopp"],
  "INDEXOMLÄGGNING (am-07)": ["indexomlaggning", "indexomläggning", "omläggningen", "indexforandring", "indexförändring", "obalanshandel"],
  "ETF-MASKINEN (am-08)": ["etfens inre mekanik", "skapelse och inlösen", "auktoriserad deltagare", "auktoriserade deltagare", "etf arbitrage", "etf-arbitrage", "inlösen", "nav handel"],
});

// Slutlig komplettering: riskhanttering-kategori + am-kategori registerdata
console.log("\n=== RISKHANTERING-registerdata:");
for (const r of KURSREGISTER.filter((x) => x.kategori === "RISKHANTERING")) console.log("  " + r.slug + " · " + r.minuten + " min · " + r.niva);
console.log("\n=== am-kategori (AKTIEMARKNADEN I PRAKTIKEN):");
for (const r of KURSREGISTER.filter((x) => x.kategori === "AKTIEMARKNADEN I PRAKTIKEN")) console.log("  " + r.slug + " · " + r.minuten + " min · " + r.niva);
