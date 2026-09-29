/**
 * _s6u2o38-sond.mjs — kärnordsdisjunktion för ÅTERSTÄNGNINGEN (vr-10 + ud-10).
 * Kör: node verktyg/_s6u2o38-sond.mjs
 * Testar kandidater mot ALLA befintliga lagers kärnord (kommentar-strippat,
 * samma semantik som kedjetestets J-fall): exakt kollision + tav-avstånd.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, readFileSync } from "node:fs";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

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

// Kandidater monster 1 (vr-10 ENHETSMULTIPLAR) + monster 2 (ud-10 EX-DAGEN)
const KANDIDATER = [
  // M1
  "enhetsmultipl", "enhetsmultiplar", "enhetsmultiplen", "enhetsmultipln",
  "ev per ton", "ev per abonnent", "ev per kilowattimme",
  "kapacitetston", "kapacitetstoner", "kapacitetspriset",
  "pris per ton", "priset per ton", "pris per abonnent",
  "pris per kilowattimme", "levererad kilowattimme", "levererade kilowattimmar",
  "producerad ton", "producerade ton", "kapacitetsfaktor", "kapacitetsfaktorn",
  "installerad kilowatt", "installerade kilowatt", "uttagsgrad", "uttagsgraden",
  "uttagningen", "överbyggd kapacitet", "döda enheten", "enhetsmarginal",
  "enhetsmarginalen", "enhetsvärlden", "tonräknaren",
  // M2
  "ex-dag", "ex-dagen", "ex-dagar", "ex-dags", "ex-kurs", "ex-kursen",
  "ex-kurser", "teoretisk ex-kurs", "teoretiska ex-kursen", "teoretiska ex-kurs",
  "avstämningsdag", "avstämningsdagen", "avstämningsdatum",
  "ex-spärren", "äganderättsdagen", "äganderättsdag",
  "frukosthandeln", "utdelningsdagen", "utdelningsjusteringen",
  "totalavkastningsindex", "utdelningsmekanik", "utdelningsmekaniken",
  "kursjusteringen", "ex-dagsjägarne", "utdelningskortläget",
];

const filer = readdirSync(join(ROT, "src/lib")).filter(
  (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts")
);
const andra = new Map(); // kärnord -> [fil]
let antalOrd = 0;
for (const fil of filer) {
  const kod = readFileSync(join(ROT, "src/lib", fil), "utf8")
    .split("\n").filter((r) => !r.trim().startsWith("//")).join("\n");
  for (const block of kod.matchAll(/karnord: \[([^\]]+)\]/g)) {
    for (const om of block[1].matchAll(/"([^"]+)"/g)) {
      const w = diafri(om[1]);
      if (!andra.has(w)) andra.set(w, []);
      andra.get(w).push(fil);
      antalOrd++;
    }
  }
}

console.log("lager lästa: " + filer.length + " · unika kärnord: " + andra.size + " (totalt " + antalOrd + ")");
console.log("kandidater: " + KANDIDATER.length);
let kollisioner = 0;
for (const k of KANDIDATER) {
  const b = diafri(k);
  const exakt = andra.get(b);
  if (exakt) { console.log("EXAKT: «" + k + "» = " + exakt.join(", ")); kollisioner++; continue; }
  const grannar = [];
  for (const [w, fs] of andra) {
    if (b.includes(" ") || w.includes(" ")) continue; // fraser: endast exakt
    const tol = Math.max(w.length, b.length) <= 3 ? 0 : (Math.min(w.length, b.length) <= 7 ? 1 : 2);
    const d = tavstand(w, b);
    if (d <= tol && d > 0) grannar.push(d + ":«" + w + "»" + fs[0].replace("ai-mentor-", "").replace("-fragor.ts", ""));
  }
  if (grannar.length) { console.log("TAV   «" + k + "» → " + grannar.join(" ")); kollisioner++; }
}
console.log(kollisioner === 0 ? "RENSAT: 0 kollisioner, 0 grannar" : "KLUSTER: " + kollisioner + " kandidater behöver åtgärd");
