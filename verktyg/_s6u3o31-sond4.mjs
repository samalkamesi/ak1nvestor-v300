/**
 * SOND 4 (s6-u3, manifest auto-s6-1789965330060): SLUTLIG kärnordsgrannkontroll
 * för beteendefälla-lagret (M1 haloeffekten + M2 arbitragens gränser + M3
 * slumpens serier) mot LIVE-kedjans samtliga kärnord — med motorns egna
 * toleranser — plus sonder av oklara ord och kanoniska stöldprover.
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

const PLANERADE = {
  M1_haloeffekten: [
    "haloeffekten", "haloeffekt", "halo", "halofällan", "glorieffekten",
  ],
  M2_arbitragens_granser: [
    "arbitrage", "arbitraget", "arbitragen", "arbitragens gränser",
    "gränsarbitrage", "gränsarbitraget", "misspris", "misspriset", "misspriser",
    "finansieringsklockan", "tolkningsklockan", "kapitalhorisonten",
  ],
  M3_slumpens_serier: [
    "slumpens serier", "slumpserien", "slumpserier", "slumpsekvensen",
    "slumptal", "slumptalen", "slumpen", "apofeni", "apofenin",
    "klusterillusionen", "kluster", "lagen om små tal", "spelarens felslut",
    "felslutet", "myntkasten", "myntkast", "myntkastet", "serielängden",
    "basfrekvensen", "urvalsstorleken",
  ],
};

console.log("\n── Kärnord mot kedjans ALLA kärnord (LIVE, båda riktningar) ──");
let grannFel = 0;
for (const [familj, ord] of Object.entries(PLANERADE)) {
  console.log(`  [${familj}]`);
  for (const nk of ord) {
    const hotadeAv = [];
    for (const motor of MOTORER) {
      for (const mst of motor.monster) {
        for (const g of mst.karnord ?? []) {
          const gd = diafri(g);
          const nkd = diafri(nk);
          if (!gd || !nkd) continue;
          let farligt = false;
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

// Extra frågeprober
console.log("\n── Frågeprober (väntat NULL om inget annat äger) ──");
for (const f of [
  "vad är misspris?", "vad är ett misspris?", "vad är kluster?", "vad är klusterillusionen?",
  "vad är apofeni?", "vad är spelarens felslut?", "vad är myntkast?", "vad är basfrekvensen?",
  "vad är urvalsstorlek?", "vad är slumpen?", "vad är substitutet?", "vad är lagen om små tal?",
  "vad är serielängden?", "vad är felpriset?", "vad är gränsarbitrage?",
]) {
  const k = kedja(f);
  console.log(`  ${k ? "FEL→" + k.motor : "null"}: «${f}»`);
}

// Antistöld: mina nya ord FÅNGAR inte syskonens kanoniska?
console.log("\n── Antistöld: kedjetestets kanoniska frågor mot MINA planerade ord ──");
const kanoniska = [...kedjaKalla.matchAll(/kanonisk[ae]?:?\s*\[([^\]]+)\]|KANONISKA\s*=\s*\[([^\]]+)\]/g)].length;
console.log("  (info) kanoniska-block i kedjetestet: " + kanoniska + " — full kontroll körs i modultestets G-fall LIVE");
console.log(`\nSUMMA kärnordsrisker: ${grannFel}`);
