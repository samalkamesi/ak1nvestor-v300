/**
 * SOND omgång 21, s6-u2 (manifest auto-s6-1789768506578) — ämnesval i två ronder.
 *
 * ROND 1: vilka kurser i kandidatfamiljerna (MOAT, TILLVÄXT, BOKFÖRING) är
 * mentorväglösa, och vilka slugar nås redan?
 * ROND 2: kärnordskollisioner i BÅDA riktningarna med motorns riktiga
 * traff-semantik: (a) mina kanoniska frågor mot hela kedjan (0 fångster
 * krävs), (b) mina kandidat-kärnord mot kedjans kanoniska frågor (0
 * främmande fångster), (c) grannsvep: redigeringstavstånd mot alla kärnord.
 *
 * Funktionskarta ur widgetens importrader (tål syskonens samtidiga wireingar).
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// ── Funktionskarta ur widgetens importrader ─────────────────────────────────
const widgetKalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const FN_TILL_FIL = {};
for (const m of widgetKalla.matchAll(/import \{ (svaraLokalt\w+) \} from "@\/lib\/(ai-mentor-[a-z0-9-]+)";/g)) {
  FN_TILL_FIL[m[1]] = m[2] + ".ts";
}
const rad = widgetKalla.match(/const lokalt = ([^;]+);/);
const fns = [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]);
console.log("Widget: " + fns.length + " wireade motorer");

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
console.log("Register: " + KURSREGISTER.length + " kurser");

// ── Ladda motorer + kärnord + kanoniska + slugar ────────────────────────────
const MOTORER = [];
const KARNORD = [];
const KANONISKA = [];
const SLUGAR = new Set();
for (const fn of fns) {
  const fil = FN_TILL_FIL[fn];
  if (!fil) { console.log("  VARNING: ingen importrad för " + fn + " — hoppas över"); continue; }
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
for (const fil of new Set(Object.values(FN_TILL_FIL))) {
  const kalla = readFileSync(join(ROT, "src/lib/" + fil), "utf8");
  for (const lm of kalla.matchAll(/\/kurser\/([a-z0-9-]+)/g)) SLUGAR.add(lm[1]);
  for (const km of kalla.matchAll(/kursKalla\(reg, "([a-z0-9-]+)"/g)) SLUGAR.add(km[1]);
}
// Diskutläsning: owirade syskonmoduler (kärnord RäKNAS — konservativt)
const WIRADE = new Set(Object.values(FN_TILL_FIL));
for (const f of readdirSync(join(ROT, "src/lib"))) {
  if (!f.startsWith("ai-mentor-") || !f.endsWith("-fragor.ts") || WIRADE.has(f)) continue;
  try {
    const kalla = readFileSync(join(ROT, "src/lib/" + f), "utf8");
    const m = await import(pathToFileURL(join(ROT, "src/lib/" + f)).href);
    const arrNamn = Object.keys(m).find((k) => Array.isArray(m[k]) && /MONSTER/.test(k));
    if (arrNamn) {
      for (const mo of m[arrNamn]) KARNORD.push(...(mo.karnord ?? []));
      console.log("  (diskutläsning: " + f + ")");
    }
    for (const lm of kalla.matchAll(/\/kurser\/([a-z0-9-]+)/g)) SLUGAR.add(lm[1]);
  } catch { /* syskonfil mitt i skrivning */ }
}
console.log("Kedja: " + MOTORER.length + " motorer · " + KARNORD.length + " kärnord (inkl. disk) · " + KANONISKA.length + " kanoniska · " + SLUGAR.size + " slugar");

// ── ROND 1: kandidatfamiljernas läge ────────────────────────────────────────
console.log("\n── ROND 1: kandidatfamiljer");
const FAMILJER = ["MOAT", "TILLVÄXT", "BOKFÖRING & ÅRSREDOVISNING"];
for (const kat of FAMILJER) {
  const rs = KURSREGISTER.filter((r) => r.kategori === kat);
  const losa = rs.filter((r) => !SLUGAR.has(r.slug));
  console.log("  " + kat + ": " + (rs.length - losa.length) + "/" + rs.length + " nådda, lösa:");
  for (const r of losa) console.log("    " + r.slug + " — " + r.titel + " (" + r.minuter + " min, " + r.niva + ")");
  const nadda = rs.filter((r) => SLUGAR.has(r.slug));
  if (nadda.length) console.log("  nådda sedan tidigare: " + nadda.map((r) => r.slug).join(" "));
}

// ── ROND 2: kollisioner med motorns riktiga semantik ────────────────────────
console.log("\n── ROND 2: kandidatfrågor mot HELA kedjan (riktiga motorerna)");
const MINA_FRAGOR = [
  "vad är en moat?",
  "vad är en vallgrav?",
  "vad är moat?",
  "vad är byteskostnader?",
  "vad är byteskostnad?",
  "vad är inlåsning?",
  "vad är inlasning?",
  "vad är kostnadsöverlägsenhet?",
  "vad är organisk tillväxt?",
  "vad är förvärvad tillväxt?",
  "vad är volym pris och mix?",
  "vad är volym-pris-mix?",
];
for (const q of MINA_FRAGOR) {
  const svar = MOTORER.map((mo) => {
    try { return mo.fnk(q, KURSREGISTER) ? mo.fn : null; } catch { return mo.fn + "(KRASCH)"; }
  }).filter(Boolean);
  console.log("  \"" + q + "\" → " + (svar.length ? svar.join(", ") : "NULL (fri)"));
}

console.log("\n── ROND 2b: mina kandidat-kärnord mot kedjans kanoniska (stöldtest)");
const MINA_KARNORD = [
  "moat", "vallgrav", "vallgraven", "vallgravar",
  "byteskostnad", "byteskostnader", "byteskostnaderna", "inlåsning", "inlasningseffekt",
  "kostnadsöverlägsenhet", "organisk tillväxt", "förvärvad tillväxt", "volym pris och mix", "volympris",
];
// Speglad traff (samma semantik som modulerna)
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
let stold = 0;
for (const mk of MINA_KARNORD) {
  for (const kan of KANONISKA) {
    const fs = diafri(kan.fraga);
    if (traff(fs.split(" "), fs, mk)) {
      console.log("  STÖLD: kärnord \"" + mk + "\" fångar \"" + kan.fraga + "\" (" + kan.agare + ")");
      stold++;
    }
  }
}
console.log("  stöldfångster: " + stold);

console.log("\n── ROND 2c: grannsvep (tavstånd ≤ 2 mot kedjans kärnord)");
for (const mk of MINA_KARNORD) {
  const dm = diafri(mk);
  const grannar = KARNORD.map((k) => ({ k, d: tavstand(diafri(k), dm) })).filter((x) => x.d > 0 && x.d <= 2 && !diafri(x.k).includes(" ") && !dm.includes(" "));
  if (grannar.length) console.log("  \"" + mk + "\": " + grannar.map((g) => g.k + " (" + g.d + ")").join(", "));
}

console.log("\n── ROND 2d: mina frågors kanoniska formulering mot kedjan (även som starkord-kontext)");
// Kontroll: även frågor med SAMMA betydelse men andra formuleringar
const EXTRA_FRAGOR = [
  "förklarar moat",
  "moat förklarat",
  "hur fungerar byteskostnader?",
  "kunderna låser sig",
  "varför är moat viktigt?",
];
for (const q of EXTRA_FRAGOR) {
  const svar = MOTORER.map((mo) => {
    try { return mo.fnk(q, KURSREGISTER) ? mo.fn : null; } catch { return null; }
  }).filter(Boolean);
  console.log("  \"" + q + "\" → " + (svar.length ? svar.join(", ") : "NULL (fri)"));
}
