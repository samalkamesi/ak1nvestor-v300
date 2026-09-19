/**
 * SOND rond 2 (omgång 24, s6-u1) — kandidatfamiljer genom kedjan LIVE.
 *
 * För varje kandidatfråga: hela kedjan måste svara NULL (annars ägs
 * formuleringen). För varje kandidat-kärnord: grannkontroll mot hela
 * kärnordsinventarien (tavstånd på ord-nivå, flerords: substring) —
 * grannar med tavstånd ≤ 2 markeras som risk (samma tolerans som
 * motorns traff för ord längd > 7).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const rad = widget.match(/const lokalt = ([^;]+);/);
const fns = [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]);
const fnTillFil = {};
for (const [, namn, fil] of widget.matchAll(/import \{ ([^}]+) \} from "@\/lib\/([^"]+)"/g)) {
  for (const n of namn.split(",")) {
    const v = n.trim();
    if (v.startsWith("svaraLokalt")) fnTillFil[v] = fil.endsWith(".ts") ? fil : fil + ".ts";
  }
}
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const fn of fns) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib", fnTillFil[fn])).href);
  MOTORER.push({ fn, namn: fn.replace("svaraLokalt", "").toLowerCase(), fnk: modul[fn] });
}
function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return m.namn;
  }
  return null;
}

// Kandidatfrågor — NULL krävs (ägs ej av kedjan)
const FRAGOR = [
  // A: försäkring + krypto (se-19, se-11)
  "vad är combined ratio?",
  "vad är en combined ratio?",
  "hur räknar man ut combined ratio?",
  "vad är floaten?",
  "vad är försäkringssektorn?",
  "hur analyserar jag försäkringsbolag?",
  "vad är försäkringsbolag?",
  "vad är krypto?",
  "vad är kryptovalutor?",
  "hur fungerar krypto?",
  // B: terminer + kombinerade optioner (od-07, od-04, od-05, od-06)
  "vad är en termin?",
  "vad är terminer?",
  "vad är ett terminskontrakt?",
  "vad är en straddle?",
  "vad är en collar?",
  "vad är delta?",
  // C: lönsamhetens mekanik (ln-03, ln-05, roic-03, roic-04)
  "vad är operativ hävstång?",
  "vad är marginaltrappan?",
  "vad är inkrementell roic?",
  "vad är värdeekvationen?",
  "vad är lönsamhet?",
  // D: valuta + bostad (ma-07, ma-08)
  "vad är köpkraftsparitet?",
  "vad är räntepariteten?",
  "vad är ppp?",
  "hur fungerar bostadsmarknaden?",
  "vad är bostadsmarknadens mekanik?",
  // E: riskens adresser (rs-06, rs-07, rs-08, rs-01)
  "vad är modellrisken?",
  "vad är leverantörsrisken?",
  "vad är riskens anatomi?",
  // F: multiplerna P/S + P/B (v04, v05)
  "vad är p/s?",
  "vad är price to sales?",
  "vad är p/b?",
  "vad är price to book?",
  "vad är ps-talet?",
  "vad är pb-talet?",
];
console.log("── FRÅGPROBER (NULL = fri) ──");
for (const f of FRAGOR) {
  const a = kedja(f);
  console.log((a === null ? "NULL  " : "FÅNGAD av " + a + "  ") + f);
}

// Kandidat-kärnord — grannkontroll mot inventarien
const inv = JSON.parse(readFileSync(join(ROT, "data/vakten/_s6u1-sond-omg24-karnord.json"), "utf8"));
const diafri = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
function tav(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
    }
    fore = [...nu];
  }
  return fore[m];
}
const KANDIDATER = [
  // A
  "combined ratio", "combined", "floaten", "float", "försäkringssektorn", "försäkringsbolag", "krypto", "kryptovaluta", "premieinkomster", "skadegörelse", "skadekostnad",
  // B
  "termin", "terminer", "terminskontrakt", "straddle", "collar", "förfallodagen",
  // C
  "operativ hävstång", "marginaltrappan", "inkrementell roic", "värdeekvationen", "lönsamhet",
  // D
  "köpkraftsparitet", "ränteparitet", "ppp", "bostadsmarknaden",
  // E
  "modellrisken", "leverantörsrisken", "riskens anatomi",
  // F
  "price to sales", "price to book", "ps-talet", "pb-talet",
];
console.log("\n── GRANNSKONTROLL (kärnord tav ≤ 2; flerords: substring i kärnord) ──");
for (const k of KANDIDATER) {
  const dk = diafri(k);
  const grannar = [];
  for (const [ord, agare] of inv.karnord) {
    if (dk.includes(" ") ? ord.includes(dk) || dk.includes(ord) : tav(dk, ord) <= 2) grannar.push(ord + "→" + agare);
  }
  console.log((grannar.length === 0 ? "RENT  " : "GRANNE(" + grannar.length + ")  ") + k + (grannar.length ? "  ·  " + grannar.slice(0, 5).join(" · ") : ""));
}
