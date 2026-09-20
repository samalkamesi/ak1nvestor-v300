/**
 * SOND 4 spår 6 omgång 25 — rond 4: slutkandidater för monster 3 +
 * emissionsrisk/skuldfälla/kapitalcykeln/koncentration + granskning av
 * vilka källkurser som är nådda/lediga för de tre huvudkandidaterna.
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

const FAMILJ = {
  "KONCENTRATIONSRISK (rk-09)": ["koncentrationsrisk", "koncentrationsrisken", "koncentrationsrisker", "overviktsrisk"],
  "EMISSIONSRISK (rk-02)": ["emissionsrisk", "emissionsrisken", "utspadningsrisken", "emissionsrisker"],
  "SKULDFÄLLAN (rk-03)": ["skuldfalla", "skuldfällan", "skuldfalla", "skuldfallor"],
  "KAPITALCYKELN": ["kapitalcykel", "kapitalcykeln", "capital cycle"],
  "GDPR/DATARISK (rk-13)": ["gdpr", "datarisk", "datarisker", "dataintrang"],
  "KÄLLKURSER kontrahent": ["likviditetskris", "terminsavtal", "centraliserad bors"],
  "KÄLLKURSER korrelation": ["diversifiering", "samkorrelation"],
};
for (const [tema, familj] of Object.entries(FAMILJ)) {
  console.log("\n[" + tema + "]");
  for (const f_raw of familj) {
    const f = diafri(f_raw);
    if (alla.has(f)) { console.log("  " + f_raw + " → ÄGD: " + [...alla.get(f)].join(",")); continue; }
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

// Vilka kurser är nådda som käll-kandidater till de tre monstren?
const nadda = new Set();
for (const [fil, arr] of filer) {
  const modul = await import(url(join(LIB, fil)));
  for (const m of modul[arr]) {
    try {
      const svar = m.bygga(KURSREGISTER);
      if (svar.kalla?.slug) nadda.add(svar.kalla.slug);
      for (const kk of svar.kallor ?? []) if (kk.slug) nadda.add(kk.slug);
      for (const h of svar.handlings ?? []) { const mm = /\/kurser\/([a-z0-9-]+)/.exec(h.lank ?? ""); if (mm) nadda.add(mm[1]); }
      if (svar.fordjupa?.lank) { const m3 = /\/kurser\/([a-z0-9-]+)/.exec(svar.fordjupa.lank); if (m3) nadda.add(m3[1]); }
    } catch {}
  }
}
console.log("\n=== Källkandidater nådda? (× = redan källa/knapp i kedjan)");
for (const slug of ["rk-16-kontrahentrisken", "rk-10-korrelationsrisk", "rk-09-koncentrationsrisk", "rk-05-cykelrisk", "rk-04-likviditetskris", "rk-08-ranterisk", "am-08-etfens-inre-mekanik", "am-07-indexomlaggningen", "am-02-index-och-passivt-agande", "od-07-terminskontraktet", "od-04-kombinerade-optionspositioner", "warrant", "rk-15-cykelrisk", "pf-07-krishantering", "rs-06-riskens-anatomi"]) {
  const r = KURSREGISTER.find((x) => x.slug === slug);
  console.log("  " + slug + (r ? " · " + r.titel.slice(0, 60) : " · SAKNAS I REGISTER") + (nadda.has(slug) ? " · NÅDD" : " · LEDIG"));
}
