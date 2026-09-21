/**
 * SOND 2 (s6-u3, manifest auto-s6-1789965330060): kärnordsfamiljerna för
 * kandidaten TRIPPEL KATEGORISTÄNGNING — budpremien (kt-09) +
 * konglomeratrabatten (vr-09) + enhetsekonomin (tx-06/tx-07) — mot LIVE
 * kedjan (läser MOTORDEFS ur testa-ai-mentor-kedja.mjs och importerar
 * modulerna): (1) kandidatfrågor → NULL, (2) kärnordsgrannkontroll med
 * motorns egen tålighet (kort exakt, ≤7 bokstäver tavstånd 1, längre 2),
 * (3) ägarskap av riskord.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const kedjaKalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defs = [...kedjaKalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const d of defs) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ ...d, fnk: modul[d.fn], monster: modul[d.arr] });
}
function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return { svar: s, motor: m.namn };
  }
  return null;
}
console.log("Kedjan LIVE: " + MOTORER.length + " motorer / " + MOTORER.reduce((s, m) => s + m.monster.length, 0) + " monsters");

// ── ROND 1: kandidatfrågor (väntat NULL) ─────────────────────────────────────
const KANDIDATER = [
  // budpremien/budprocessen
  "vad är budpremien?", "vad är en budpremie?", "hur fungerar budprocessen?",
  "vad är ett offentligt bud?", "vad är ett kontantbud?",
  "vad är tvångsinlösen?", "vad är utköpsförfarandet?",
  "vad är minoritetsskyddet?", "hur räknas budpremien?",
  "vad händer med aktien när det kommer ett bud?",
  // konglomeratrabatten
  "vad är konglomeratrabatten?", "vad är en konglomeratrabatt?",
  "vad är summan av delarna?", "vad är delvärdering?",
  "vad är en konglomerat?", "varför handlar konglomerat under sitt värde?",
  "vad är holdingrabatten?",
  // enhetsekonomin
  "vad är enhetsekonomin?", "vad är enhetsekonomi?",
  "vad är kundanskaffningskostnaden?", "vad är kundens livstidsvärde?",
  "vad är ltv per cac?", "hur räknar man per enhet?",
  "vad är enhetsmarginale?", "vad är payback per kund?",
];
let nullFel = 0;
console.log("\n── ROND 1: kandidatfrågor (väntat NULL) ──");
for (const f of KANDIDATER) {
  const k = kedja(f);
  if (k) { nullFel++; console.log("  FÅNGAD ( fel ): «" + f + "» → " + k.motor); }
  else console.log("  null        : «" + f + "»");
}

// ── ROND 2: planerade kärnord — grannkontroll mot ALLA kärnord LIVE ─────────
const PLANERADE = {
  budpremien: [
    "budpremien", "budpremie", "budprocessen", "budprocess", "offentligt bud",
    "offentliga bud", "kontantbud", "aktiebud", "budpris", "budgivaren",
    "minoritetsskyddet", "minoritetsaktieägare", "utköpet", "utköpsförfarandet",
    "tvångsinlösen", "budaccept", "budtid", "acceptfrekvensen", "kontrollpremium",
  ],
  konglomeratrabatten: [
    "konglomeratrabatten", "konglomeratrabatt", "konglomeratet", "konglomerat",
    "summan av delarna", "delvärderingen", "delvärdering", "summavärderingen",
    "holdingrabatten", "holdingrabatt",
  ],
  enhetsekonomin: [
    "enhetsekonomin", "enhetsekonomi", "kundanskaffningskostnaden",
    "kundanskaffningskostnad", "livstidsvärdet", "livstidsvärde",
    "kundens livstidsvärde", "ltv per cac", "enhetsekonomin per kund",
    "enhetsmarginale", "enhetskostnaden", "per enhet",
  ],
};

function diafri(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}
function tavstand(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
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
// Motor-matchningens semantik: korta ord (≤3) exakt; längre ord tål 1 (≤7 bokstäver) eller 2 fel —
// för flerordsfraser krävs exakt inklusion. Grannen HOTAR om den kan fånga ett av mina ord.
function hotar(nk, grannOrd) {
  const nkd = diafri(nk);
  if (!nkd) return false;
  if (nkd.includes(" ")) return grannOrd.includes(nkd); // fras: exakt inklusion
  if (nkd.length <= 3) return grannOrd.includes(nkd);
  const max = nkd.length <= 7 ? 1 : 2;
  return grannOrd.some((o) => tavstand(o, nkd) <= max);
}

console.log("\n── ROND 2: planerade kärnord mot kedjans ALLA kärnord (LIVE) ──");
let grannFel = 0;
for (const [familj, ord] of Object.entries(PLANERADE)) {
  console.log(`  [${familj}]`);
  for (const nk of ord) {
    const hotadeAv = [];
    for (const motor of MOTORER) {
      for (const mst of motor.monster) {
        for (const g of mst.karnord ?? []) {
          // hot i BÅDA riktningar: deras ord fångar mitt, eller mitt fångar deras
          const gd = diafri(g);
          const nkd = diafri(nk);
          let farligt = false;
          if (!gd || !nkd) continue;
          if (gd.includes(" ") || nkd.includes(" ")) {
            farligt = gd.includes(nkd) || nkd.includes(gd);
          } else if (gd.length <= 3 || nkd.length <= 3) {
            farligt = gd === nkd;
          } else {
            const maxG = gd.length <= 7 ? 1 : 2;
            const maxN = nkd.length <= 7 ? 1 : 2;
            farligt = tavstand(gd, nkd) <= Math.min(maxG, maxN);
          }
          if (farligt) hotadeAv.push(`${motor.namn}«${g}»`);
        }
      }
    }
    if (hotadeAv.length) { grannFel++; console.log(`    RISK ${nk}: ` + [...new Set(hotadeAv)].join(", ")); }
    else console.log(`    rent: ${nk}`);
  }
}

// ── ROND 3: ägarskap av riskord — vilka motorer fångar dem idag ──────────────
console.log("\n── ROND 3: riskord genom kedjan ──");
for (const f of ["vad är ett bud?", "vad är bud?", "bud", "vad är arbitrage?", "vad är en koncern?", "vad är marginalen?", "vad är en holding?", "vad är premium?", "vad är en enhet?", "vad är en utdelning?"]) {
  const k = kedja(f);
  console.log(`  «${f}» → ${k ? k.motor : "null"}`);
}

console.log(`\nSUMMA: rond1-fel=${nullFel} rond2-risker=${grannFel}`);
