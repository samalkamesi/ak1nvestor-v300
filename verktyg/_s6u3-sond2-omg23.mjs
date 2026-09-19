/**
 * SOND omgång 23, s6-u3 — ROND 2: VÄRDERINGSMETODER-kandidater NULL-testade
 * genom hela kedjan LIVE (riktiga matchare, basen medtagen) + kärnords-
 * grannsvep (tavstånd ≤ 2 mot kedjans samtliga kärnord) + omvänd stöldprov
 * (mina kanoniska frågor mot kedjan UTAN mitt kommande lager — ska vara null).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const widgetKalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const FN_TILL_FIL = { svaraLokalt: "ai-mentor-svar.ts" };
for (const m of widgetKalla.matchAll(/import \{ (svaraLokalt\w+)(?:, )?(svaraLokalt\w+)? \} from "@\/lib\/(ai-mentor-[a-z0-9-]+)";/g)) {
  if (m[1]) FN_TILL_FIL[m[1]] = m[3] + ".ts";
  if (m[2]) FN_TILL_FIL[m[2]] = m[3] + ".ts";
}
const rad = widgetKalla.match(/const lokalt = ([^;]+);/);
const fns = [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]);

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);

const MOTORER = [];
const KARNORD = [];
let monsterAntal = 0;
for (const fn of fns) {
  const fil = FN_TILL_FIL[fn];
  if (!fil) { console.log("VARNING: " + fn + " utan importrad"); continue; }
  const m = await import(pathToFileURL(join(ROT, "src/lib/" + fil)).href);
  MOTORER.push({ namn: fn.replace("svaraLokalt", "").toLowerCase() || "bas", fnk: m[fn] });
  const arrNamn = Object.keys(m).find((k) => Array.isArray(m[k]) && /MONSTER/.test(k));
  if (arrNamn) { monsterAntal += m[arrNamn].length; for (const mo of m[arrNamn]) KARNORD.push(...(mo.karnord ?? [])); }
}
console.log("Kedja LIVE: " + MOTORER.length + " motorer · " + monsterAntal + " monsters · " + KARNORD.length + " kärnord");

function vem(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return m.namn;
  }
  return null;
}

const KANDIDATER = {
  "M1 REVERSE DCF (km-028 primär)": [
    "vad är reverse dcf?",
    "hur räknar man ut reverse dcf?",
    "vad är omvänd dcf?",
    "vad är en omvänd diskonteringsmodell?",
    "vad betyder baklänges dcf?",
    "vad är dcf?", /* grannkontroll: vem äger nakna dcf? */
    "hur räknar marknadens pris ut sig?", /* dummer */
  ],
  "M2 INTRINSIC VALUE (vm-02 primär)": [
    "vad är intrinsic value?",
    "vad är inre värde?",
    "vad är motiverat värde?",
    "hur räknar man ut motiverat värde?",
    "vad är verkligt värde?",
    "vad är fair value?",
    "vad är pris och värde?", /* vr-05-granne: ägs denna? */
    "vad är jämförelsebolag?", /* vr-06-granne */
  ],
  "M3 KASSAFLÖDESMULTIPLER (vm-07/vm-09/vm-10)": [
    "vad är fcf yield?",
    "vad är free cash flow yield?",
    "vad är kassaflödesavkastning?",
    "vad är p cf?",
    "vad är price to cash flow?",
    "vad är asset based valuation?",
    "vad är substansbaserad värdering?",
    "vad är substansvärde?", /* grannkontroll: grahamgolv? */
    "vad är realoptioner?", /* vm-05 — var hör den hemma? */
    "vad är en realoption?",
  ],
};

console.log("\n── Kandidatfrågor genom kedjan (NULL = fria):");
for (const [ide, fragor] of Object.entries(KANDIDATER)) {
  console.log("\n" + ide);
  for (const f of fragor) {
    const a = vem(f);
    console.log("  " + (a === null ? "NULL     " : "FÅNGAD " + a).padEnd(30) + " «" + f + "»");
  }
}

const PLANERADE = [
  // M1
  "reverse dcf", "omvänd dcf", "omvänd diskonteringsmodell", "baklänges dcf",
  // M2
  "intrinsic value", "inre värde", "motiverat värde", "verkligt värde", "fair value",
  // M3
  "fcf yield", "free cash flow yield", "kassaflödesavkastning",
  "price to cash flow", "p/cf", "asset based valuation", "substansbaserad värdering",
  "realoptioner", "realoption", "verkliga optioner",
];
console.log("\n── Kärnordsdisjunktion (tavstånd ≤ 2 mot kedjans " + KARNORD.length + " kärnord):");
const rens = (s) => s.replace(/[-/]/g, "");
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
  console.log("  " + (gran.length === 0 ? "FRITT   " : "GRANNE " + JSON.stringify(gran)).padEnd(70) + " «" + p + "»");
}

// Kursslug-sanity: de tio kurserna finns i registret
console.log("\n── Kursslug-sanity:");
const SLUGS = ["km-028-reverse-dcf", "vm-02-intrinsic-value", "vm-05-realoptioner", "vm-07-free-cash-flow-yield", "vm-09-pricetocashflow", "vm-10-assetbased-valuation", "vm-11-waccfallor", "vr-05-pris-och-varde", "vr-06-jamforelsebolagen", "vr-07-terminalvardet"];
for (const s of SLUGS) {
  const r = KURSREGISTER.find((x) => x.slug === s);
  console.log("  " + (r ? "OK  " : "SAKNAS ") + s + (r ? " · " + r.titel + " · " + r.minuter + " min · " + r.niva : ""));
}
