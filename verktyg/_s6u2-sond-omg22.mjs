/**
 * SOND s6-u2 omgång 22 (spår 6) — hitta mentorväglösa block + testa kandidater.
 * Otrackad engångssond enligt spårets presedens.
 *
 * Rond 1: genomräkning — vilka kurser nås av någon motors källmärkning?
 * Rond 2: kandidatfrågor genom HELA kedjan (med basmotorn — omgång 21:s läxa:
 *          importlistor med flera namn måste stödjas).
 * Rond 3: kärnordsgrannar (tavstånd) mot hela kedjans kärnord.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// Motorerna ur widgetens importrader (med stöd för importlistor med flera namn)
const widgetKalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const FN_TILL_FIL = {};
for (const m of widgetKalla.matchAll(/import \{ ([^}]+) \} from "@\/lib\/(ai-mentor-[a-z0-9-]+)";/g)) {
  for (const namn of m[1].split(",").map((x) => x.trim())) {
    if (namn.startsWith("svaraLokalt")) FN_TILL_FIL[namn] = m[2] + ".ts";
  }
}
const komp = widgetKalla.match(/const lokalt = ([^;]+);/);
const ordning = komp ? [...komp[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]) : [];
const basMed = ordning.includes("svaraLokalt");
console.log("motorer i widgetens kedja:", ordning.length, "(basen med?", basMed ? "JA" : "NEJ — FEL!");

const MOTORER = [];
for (const fn of ordning) {
  const fil = FN_TILL_FIL[fn];
  if (!fil) { console.error("SAKNAR FIL för", fn); continue; }
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + fil)).href);
  MOTORER.push({ fn, fnk: modul[fn], modul });
}
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
console.log("register:", KURSREGISTER.length, "kurser");

// ── ROND 1: nådda kurser (slugar i källmärkning från bygga()) ────────────────
const nadda = new Set();
const arrNamn = (modul) => Object.keys(modul).find((k) => Array.isArray(modul[k]) && /MONSTER/.test(k));
let monsterTotal = 0;
const KARNORD = []; // hela kedjans kärnord
for (const m of MOTORER) {
  const arr = m.modul[arrNamn(m.modul)];
  if (!arr) continue;
  monsterTotal += arr.length;
  for (const mo of arr) {
    for (const nk of mo.karnord ?? []) KARNORD.push({ ord: nk, agare: m.fn });
    const s = mo.bygga(KURSREGISTER);
    for (const k of s.kallor ?? []) if (k.slug) nadda.add(k.slug);
    if (s.kalla?.slug) nadda.add(s.kalla.slug);
    for (const h of s.handlings ?? []) if (h.lank.startsWith("/kurser/")) nadda.add(h.lank.replace("/kurser/", ""));
    if (s.fordjupa?.lank?.startsWith("/kurser/")) nadda.add(s.fordjupa.lank.replace("/kurser/", ""));
  }
}
console.log("monsters totalt:", monsterTotal, "· nådda kurser:", nadda.size, "· lösa:", KURSREGISTER.length - nadda.size, "· kedjekärnord:", KARNORD.length);

// Lösa per kategori
const perKat = {};
for (const r of KURSREGISTER) {
  if (!perKat[r.kategori]) perKat[r.kategori] = { totalt: 0, losa: 0 };
  perKat[r.kategori].totalt++;
  if (!nadda.has(r.slug)) perKat[r.kategori].losa++;
}
const sorterat = Object.entries(perKat).sort((a, b) => b[1].losa - a[1].losa);
console.log("\n== ROND 1: mentorväglösa per kategori (lösa/totalt) ==");
for (const [kat, v] of sorterat) if (v.losa > 0) console.log(kat.padEnd(34), v.losa + "/" + v.totalt);

// ── Kedjefunktion + matcher (samma semantik) ────────────────────────────────
function kedja(fraga) {
  for (const m of MOTORER) {
    try { const s = m.fnk(fraga, KURSREGISTER); if (s) return { motor: m.fn, amne: s.amne }; } catch { /* */ }
  }
  return null;
}
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

// ── ROND 2: kandidatfrågor genom kedjan ─────────────────────────────────────
const KANDIDATER = process.argv[2]
  ? JSON.parse(readFileSync(process.argv[2], "utf8"))
  : [];
if (KANDIDATER.length) {
  console.log("\n== ROND 2: kandidatfrågor genom " + MOTORER.length + " motorer ==");
  for (const q of KANDIDATER) {
    const r = kedja(q);
    console.log((r ? "FÅNGAS av " + r.motor : "NULL            ").padEnd(50), "«" + q + "»");
  }
}

// ── ROND 3: kärnordsgrannar (enda kärnorden, tavstånd ≤ 2) ──────────────────
const MINA_ORD = process.argv[3] ? JSON.parse(readFileSync(process.argv[3], "utf8")) : [];
if (MINA_ORD.length) {
  console.log("\n== ROND 3: grannar mot kedjans " + KARNORD.length + " kärnord ==");
  let fynd = 0;
  for (const mitt of MINA_ORD) {
    const nm = diafri(mitt);
    if (nm.includes(" ")) continue; // flerordsfraser kontrolleras i rond 2
    for (const k of KARNORD) {
      const nk = diafri(k.ord);
      if (nk.includes(" ")) continue;
      if (nk === nm) { console.log("EXAKT:", mitt, "=", k.ord, "(" + k.agare + ")"); fynd++; continue; }
      if (Math.abs(nk.length - nm.length) > 2) continue;
      const max = Math.min(nk.length, nm.length) <= 7 ? 1 : 2;
      const d = tavstand(nk, nm);
      if (d <= max) { console.log("GRANNE (d=" + d + "):", mitt, "~", k.ord, "(" + k.agare + ")"); fynd++; }
    }
  }
  console.log(fynd === 0 ? "0 grannar — HELT FRITT" : fynd + " fynd — justera kärnord");
}
