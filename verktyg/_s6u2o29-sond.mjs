/**
 * SOND nästa fönster (s6-u2, verktygsprefix _s6u2o29-) — KATALYSATOR-
 * VARIABLERNA: v16 PRODUKTLANSERINGAR + v17 AVTAL & PARTNERSKAP.
 *
 * Förutsättning: fönstret efter omgång 27 (tvångsmekanik, _s6u2o28-) är
 * klart och kvitterat — detta är spårets nästa par ur de dokumenterat
 * öppna fälten (fönster-28-kedjetestet: «KATALYSATOR 3 lösa → 1 (v17
 * kvar)»; lagerlucka-sonden _s6u3-sond-lagerluckor.mjs visar även v16
 * löst — fönster-28-rättelsen: v16 OCH v17 är kategorins två sista lösa
 * kurser ⇒ detta fönster STÄNGER KATALYSATOR fullt länkad 11/11).
 *
 * Rond 1: kandidatfrågor skall vara NULL genom HELA den levande kedjan.
 * Rond 2: kontrollfrågor skall fångas av sina dokumenterade ägare.
 * Rond 3: grannkontroll — planerade kärnord mot SAMTLIGA lagens kärnord.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// Motorlistan läses LIVE ur kedjetestets MOTORDEFS (kan inte ljuga om ordningen).
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
console.log("Kedjan LIVE: " + MOTORER.length + " motorer / " + MOTORER.reduce((s, m) => s + m.monster.length, 0) + " monsters / register " + KURSREGISTER.length);
const kat = KURSREGISTER.filter((r) => r.kategori === "KATALYSATOR");
console.log("KATALYSATOR-kategorin: " + kat.length + " kurser");

// ── ROND 1: kandidatfrågor → NULL ────────────────────────────────────────────
const KANDIDATER = [
  // Monster 1 — v16 produktlanseringarna (katalysatorns händelsefaces)
  "vad är en produktlansering?", "vad är produktlanseringen?",
  "vad är produktlanseringar?", "hur fungerar produktlanseringar?",
  "vad är sell the news?", "vad är buy the rumor?",
  "vad är s-kurvan?", "vad är en s-kurva?",
  "vad är rnpv?",
  "vad är pdufa?", "vad är ett pdufa-datum?",
  "vad är verifieringsfasen?", "vad är förväntanfasen?",
  "vad är pipelinen?", "vad är en pipeline?",
  "vad är katalysatorkalendern?",       // misstänkt: kt-05 äger kalendern?
  "vad är penetrering?",
  "vad är lanseringsfällan?",
  "vad är hypecykeln?",
  // Monster 2 — v17 avtalen och partnerskapen
  "vad är avtal och partnerskap?",
  "vad är ett partnerskap?", "vad är partnerskap?",
  "vad är en avsiktsförklaring?",
  "vad är ett loi?", "vad är en mou?",
  "vad är take or pay?",
  "vad är ett ramavtal?",                // misstänkt: koncernläsning/handelsdag?
  "vad är tcv?", "vad är acv?",
  "vad är budpremien?",
  "vad är merger arbitrage?", "vad är merger arb?",
  "vad är budspreaden?",
  "vad är synergierna?", "vad är en synergifälla?",
  "vad är intäktsdelning?",
  "vad är avtalsstocken?",
];
let nullFel = 0;
console.log("\n── ROND 1: kandidater (väntat NULL) ──");
for (const f of KANDIDATER) {
  const k = kedja(f);
  if (k) { nullFel++; console.log("  FÅNGAD ( fel ): «" + f + "» → " + k.motor); }
  else console.log("  null        : «" + f + "»");
}

// ── ROND 2: kontroller → dokumenterade ägare ─────────────────────────────────
const KONTROLLER = [
  { f: "vad är en katalysator?",              agare: "?" },
  { f: "vad är katalysatorkedjor?",           agare: "?" },
  { f: "vad är guidningen?",                  agare: "?" },
  { f: "vad är den uteblivna katalysatorn?",  agare: "?" },
  { f: "vad är förväntningsanalys?",          agare: "?" },
  { f: "vad är kalibrering?",                 agare: "?" },
  { f: "vad är spread?",                      agare: "?" },
  { f: "vad är en straddle?",                 agare: "?" },
  { f: "vad är utspädning?",                  agare: "?" },
  { f: "vad är arbitrage?",                   agare: "?" },  // etfmekanikens not
  { f: "vad är aktivisten?",                  agare: "?" },
  { f: "vad är kundkoncentration?",           agare: "?" },
  { f: "vad är optionsförfallet?",            agare: "tvangsmekanik" },
  { f: "vad är marginalhandeln?",             agare: "tvangsmekanik" },
  { f: "vad är en co-investering?",           agare: "?" },
];
let kontrollFel = 0;
console.log("\n── ROND 2: kontroller (ägare dokumenterade) ──");
for (const { f, agare } of KONTROLLER) {
  const k = kedja(f);
  const fick = k ? k.motor : "NULL";
  const ok = agare === "?" ? true : fick === agare;
  if (!ok) kontrollFel++;
  console.log("  " + (ok ? "ok  " : "FEL ") + " «" + f + "» → " + fick + (agare !== "?" ? " (väntat " + agare + ")" : ""));
}

// ── ROND 3: grannkontroll — planerade kärnord mot alla lagens kärnord ────────
function diafri(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim()
    .normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}
function tavstand(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (!n) return m; if (!m) return n;
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
const PLANERADE = [
  // Monster 1 — produktlanseringen
  "produktlansering", "produktlanseringen", "produktlanseringar", "produktlanseringarna",
  "lanseringsdatum", "lanseringsdagen", "lanseringsfälla", "lanseringsfällan",
  "sell the news", "buy the rumor", "s-kurvan", "s-kurva", "rnpv", "pdufa",
  "verifieringsfasen", "verifieringsfas", "förväntanfasen", "förväntanfas",
  "katalysatorkalendern", "hypecykeln", "hypecykel", "penetreringen",
  // Monster 2 — avtalet
  "partnerskap", "partnerskapen", "avsiktsförklaring", "avsiktsförklaringen",
  "take or pay", "ramavtal", "ramavtalen", "budpremie", "budpremien",
  "merger arbitrage", "merger arb", "budspreaden", "synergifälla", "synergifällan",
  "synergierna", "intäktsdelning", "intäktsdelningen", "avtalsstock", "avtalsstocken",
  "avtalsvärde", "avtalsvärdet", "övertagpremie", "övertagpremien",
];
let grannfel = 0;
console.log("\n── ROND 3: grannkontroll " + PLANERADE.length + " planerade kärnord ──");
for (const ord of PLANERADE) {
  const a = diafri(ord);
  for (const m of MOTORER) {
    for (const m2 of m.monster) {
      for (const b0 of m2.karnord) {
        const b = diafri(b0);
        let farlig = false;
        if (a === b) farlig = true;
        else if (!a.includes(" ") && !b.includes(" ")) {
          const tolerans = Math.max(a.length, b.length) <= 3 ? 0 : (Math.min(a.length, b.length) <= 7 ? 1 : 2);
          if (tavstand(a, b) <= tolerans) farlig = true;
        } else if (a.includes(" ") && b.includes(" ") && (a.includes(b) || b.includes(a))) {
          farlig = true; // delfras-suggning
        }
        if (farlig) {
          grannfel++;
          console.log("  GRANNE: «" + ord + "» ~ " + m.namn + "«" + b0 + "» (tav " + tavstand(a, b) + ")");
        }
      }
    }
  }
}
if (grannfel === 0) console.log("  0 riskgrannar");

console.log(
  "\nSVAR: rond1-fel=" + nullFel + " · rond2-fel=" + kontrollFel + " · rond3-grannar=" + grannfel +
  (nullFel + kontrollFel + grannfel === 0 ? "  ⇒ GRÖNT LÄGE" : "  ⇒ RÄTTA PLANERINGEN"),
);
