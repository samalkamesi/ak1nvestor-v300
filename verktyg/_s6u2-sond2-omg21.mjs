/**
 * SOND2 omgång 21, s6-u2 — ROND 3: mina EXAKTA kärnordslistor (frysning)
 * mot kedjan: stöldtest (mina ord vs kedjans kanoniska), grannsvep,
 * omvänt (mina kanoniska frågor vs kedjan), plus motfråge-knapparnas
 * landning (de ska fångas av kedjen — knappar får aldrig landa null).
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const widgetKalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const FN_TILL_FIL = {};
for (const m of widgetKalla.matchAll(/import \{ (svaraLokalt\w+) \} from "@\/lib\/(ai-mentor-[a-z0-9-]+)";/g)) {
  FN_TILL_FIL[m[1]] = m[2] + ".ts";
}
const rad = widgetKalla.match(/const lokalt = ([^;]+);/);
const fns = [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]);

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);

const MOTORER = [];
const KARNORD = [];
const KANONISKA = [];
for (const fn of fns) {
  const fil = FN_TILL_FIL[fn];
  if (!fil) continue;
  const m = await import(pathToFileURL(join(ROT, "src/lib/" + fil)).href);
  MOTORER.push({ fn, fnk: m[fn] });
  const arrNamn = Object.keys(m).find((k) => Array.isArray(m[k]) && /MONSTER/.test(k));
  if (arrNamn) for (const mo of m[arrNamn]) {
    KARNORD.push(...(mo.karnord ?? []));
    for (const nk of mo.karnord ?? []) {
      const ren = nk.replace(/-/g, " ");
      if (ren.length <= 40 && !ren.includes("  ")) KANONISKA.push({ fraga: "vad är " + ren + "?", agare: fn, ord: nk });
    }
  }
}
// Diskutläsning (owirade syskonmoduler — konservativt med i kärnorden)
const WIRADE = new Set(Object.values(FN_TILL_FIL));
for (const f of readdirSync(join(ROT, "src/lib"))) {
  if (!f.startsWith("ai-mentor-") || !f.endsWith("-fragor.ts") || WIRADE.has(f)) continue;
  try {
    const m = await import(pathToFileURL(join(ROT, "src/lib/" + f)).href);
    const arrNamn = Object.keys(m).find((k) => Array.isArray(m[k]) && /MONSTER/.test(k));
    if (arrNamn) { for (const mo of m[arrNamn]) KARNORD.push(...(mo.karnord ?? [])); console.log("  (diskutläsning: " + f + ")"); }
  } catch { /* syskonfil mitt i skrivning */ }
}
console.log("Kedja: " + MOTORER.length + " motorer · " + KARNORD.length + " kärnord · " + KANONISKA.length + " kanoniska");

function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
function tavstand(a, b) {
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
function traff(fragaOrd, fragaStr, nyckelord) {
  const nk = diafri(nyckelord);
  if (!nk) return false;
  if (nk.includes(" ")) return fragaStr.includes(nk);
  if (nk.length <= 3) return fragaOrd.includes(nk);
  const max = nk.length <= 7 ? 1 : 2;
  return fragaOrd.some((o) => tavstand(o, nk) <= max);
}

// ── Mina FRYSADE kärnordslistor (tillväxtdjup-lagrets två monsters) ─────────
const M1 = { // organisk vs förvärvad tillväxt
  karnord: ["organisk tillväxt", "organisktillväxt", "förvärvad tillväxt", "förvärvstillväxt", "organisk mot förvärvad", "organisk vs förvärvad"],
  starkord: ["organisk", "organiskt", "förvärv", "förvärvad", "förvärvade", "uppköp", "uppköp", "köpa bolag", "källa", "källan", "köpt tillväxt"],
};
const M2 = { // volym, pris och mix
  karnord: ["volym pris och mix", "volympris mix", "volym pris mix", "prismix", "mixeffekt", "prisvolym", "volym och pris", "pris och volym", "volymanalys"],
  starkord: ["volym", "pris", "mix", "sålt", "enhet", "enheter", "genomsnittspris", "intäkt", "intäkter", "dekompone"],
};

console.log("\n── A: mina KÄRNORD mot kedjans kanoniska (stöldtest — 0 krävs)");
let stold = 0;
for (const mk of [...M1.karnord, ...M2.karnord]) {
  for (const kan of KANONISKA) {
    const fs = diafri(kan.fraga);
    if (traff(fs.split(" "), fs, mk)) { console.log("  STÖLD: \"" + mk + "\" fångar \"" + kan.fraga + "\" (" + kan.agare + ")"); stold++; }
  }
}
console.log("  stöldfångster: " + stold);

console.log("\n── B: grannsvep (tavstånd ≤ 2, enstaka ord)");
for (const mk of [...M1.karnord, ...M2.karnord]) {
  const dm = diafri(mk);
  if (dm.includes(" ")) continue;
  const grannar = KARNORD.map((k) => ({ k, d: tavstand(diafri(k), dm) })).filter((x) => x.d > 0 && x.d <= 2 && !diafri(x.k).includes(" "));
  if (grannar.length) console.log("  \"" + mk + "\": " + grannar.map((g) => g.k + " (" + g.d + ")").join(", "));
}

console.log("\n── C: mina starkord som KÄRNORORDS-risk (fångar de kedjans kanoniska? starkord stjäl inte men mäts)");
let stoldStark = 0;
for (const mk of [...M1.starkord, ...M2.starkord]) {
  for (const kan of KANONISKA) {
    const fs = diafri(kan.fraga);
    if (traff(fs.split(" "), fs, mk)) { console.log("  (info) starkord \"" + mk + "\" träffar \"" + kan.fraga + "\" (" + kan.agare + ")"); stoldStark++; }
  }
}
console.log("  starkordsträffar mot kanoniska: " + stoldStark + " (info — starkord ger poäng bara EGET kärnord träffat)");

console.log("\n── D: mina kanoniska frågor mot HELA kedjan (0 fångster krävs)");
const MINA_KANONISKA = [];
for (const nk of [...M1.karnord, ...M2.karnord]) {
  const ren = nk.replace(/-/g, " ");
  MINA_KANONISKA.push("vad är " + ren + "?");
}
// + naturliga formuleringar
MINA_KANONISKA.push(
  "hur skiljer man organisk tillväxt från förvärvad?",
  "vad betyder organisk tillväxt?",
  "är tillväxten organisk eller köpt?",
  "vad driver tillväxten volym eller pris?",
  "hur dekompilerar man intäktstillväxt?",
  "vad är s-kurvan?",
  "vad är mättnad?",
  "tillväxtens gränser?",
);
for (const q of MINA_KANONISKA) {
  const svar = MOTORER.map((mo) => {
    try { return mo.fnk(q, KURSREGISTER) ? mo.fn : null; } catch { return null; }
  }).filter(Boolean);
  if (svar.length) console.log("  FÅNGAD: \"" + q + "\" → " + svar.join(", "));
}
console.log("  (endast fångade listas — tyst = NULL = fri)");

console.log("\n── E: motfråge-knappar (ska landa i kedjan — aldrig null)");
const KNAPPAR = [
  "vad är en moat?",
  "vad är en vallgrav?",
  "vad är kassaflödesanalysen?",
  "vad är en balansräkning?",
  "vad är intäktsdiversifiering?",
  "vad är arr?",
  "vad är resultaträkningen?",
];
for (const q of KNAPPAR) {
  const svar = MOTORER.map((mo) => {
    try { return mo.fnk(q, KURSREGISTER) ? mo.fn : null; } catch { return null; }
  }).filter(Boolean);
  console.log("  \"" + q + "\" → " + (svar.length ? svar.join(", ") : "NULL — VÄLJ ANNAN KNAPP"));
}

console.log("\n── F: TILLVÄXT-kursernas registerdata (källor måste vara äkta)");
for (const slug of ["tx-01-organisk-mot-forvarvad-tillvaxt", "tx-02-volym-pris-och-mix", "tx-03-nar-skapar-tillvaxt-varde", "tx-04-tillvaxtens-granser", "tx-05-tillvaxtens-forsta-lasning", "v01-forsaljningstillvaxt", "v02-arr-tillvaxt", "v03-intaktsdiversifiering"]) {
  const r = KURSREGISTER.find((x) => x.slug === slug);
  console.log("  " + slug + " → " + (r ? r.titel + " · " + r.minuten + " min · " + r.niva + " · " + r.kapitel + " kap" : "SAKNAS!!"));
}
