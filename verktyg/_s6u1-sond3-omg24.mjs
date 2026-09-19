/**
 * SOND rond 3 (omgång 24, s6-u1) — försäkring+krypto-familjens sista
 * gränser: bitcoin/blockchain-grannar, float↔moat, teckning↔warrant,
 * monster-id-disjunktion, och motfrågor som INTE får stjälas.
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
  MOTORER.push({ fn, namn: fn.replace("svaraLokalt", "").toLowerCase() || "bas", fnk: modul[fn] });
}
function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return m.namn;
  }
  return null;
}

const FRAGOR = [
  "vad är bitcoin?",
  "vad är blockchain?",
  "vad är blockkedjan?",
  "vad är ethereum?",
  "vad är float?",
  "vad är combined?",
  "vad är försäkring?",
  "vad är premieinkomster?",
  "vad är skadegörelse?",
  "vad är teckningsresultat?",
  // Motfrågor som INTE får stjälas (ska förbli hos sina ägare/null):
  "vad är en moat?",            // extra
  "vad är warranter och teckningsoptioner?", // warrant
  "vad är bankers stabilitet?", // sektor (bank)
  "hur analyserar jag banker?", // sektor
  "vad är en forsakringsfond?",
];
console.log("── FRÅGPROBER ──");
for (const f of FRAGOR) {
  const a = kedja(f);
  console.log((a === null ? "NULL  " : "FÅNGAD av " + a + "  ") + f);
}

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
  "bitcoin", "blockchain", "blockkedjan", "ethereum", "float", "combined",
  "försäkring", "forsakring", "premieinkomster", "premie", "skadegörelse",
  "skador", "teckningsresultat", "underwriting", "försäkringsmatematik",
  "krypto", "kryptovaluta", "kryptovalutor", "volatilitet krypto",
];
console.log("\n── GRANNSKONTROLL (kärnord) ──");
for (const k of KANDIDATER) {
  const dk = diafri(k);
  const grannar = [];
  for (const [ord, agare] of inv.karnord) {
    if (dk.includes(" ") ? ord.includes(dk) || dk.includes(ord) : tav(dk, ord) <= 2) grannar.push(ord + "→" + agare);
  }
  console.log((grannar.length === 0 ? "RENT  " : "GRANNE(" + grannar.length + ")  ") + k + (grannar.length ? "  ·  " + grannar.slice(0, 6).join(" · ") : ""));
}

// Monster-id-disjunktion
const ids = new Set(inv.karnord.map(([, agare]) => agare.split("/")[1]));
for (const id of ["forsakring", "combinedratio", "floaten", "krypto", "kryptosektor"]) {
  console.log((ids.has(id) ? "UPPTAGET id  " : "FRITT id  ") + id);
}

// Toleransbevis float↔moat enligt motorns längdregler
console.log("\ntav(float,moat)=" + tav("float", "moat") + " (float 5 tecken → motortolerans 1 ⇒ ingen kollision)");
console.log("tav(floaten,moaten)=" + tav("floaten", "moaten") + " (floaten 7 tecken → motortolerans 1)");
