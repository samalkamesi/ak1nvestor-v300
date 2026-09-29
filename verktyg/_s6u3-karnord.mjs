/**
 * SOND _s6u3-karnord (rond 2) — kärnordsdisjunktion för PE/IB-stängningens
 * tre monsters kandidat-kärnord mot ALLA levande lagers KÄRNORD.
 *
 * Läxor omsatta (omgång 34/35/41): ALLA kärnordsblock per fil (regex på
 * hela filen), kommentar-stripp (// -rader kan nämnas i dokumentationen),
 * koll enligt motorns traff-semantik: korta ord (≤3 tk) exakta, ≤7 tk tål
 * 1 fel, längre tål 2 — dvs kollision om redigeringstavstånd ≤ den taket.
 * Flerordsfraser kollas som delsträng i diafri-normaliserad form.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const LIB = join(import.meta.dirname, "..", "src/lib");

function diafri(s) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .normalize("NFC");
}
function tav(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (!n || !m) return Math.max(n, m);
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    fore = [...nu];
  }
  return fore[m];
}

// Extrahera kärnord per fil ur ALLA karnord: [ ... ]-block (kommentarer strippas).
const filer = readdirSync(LIB).filter((f) => f.startsWith("ai-mentor-") && (f.includes("fragor") || f === "ai-mentor-svar.ts"));
const lagerKarnord = new Map(); // kärnord → [fil]
for (const f of filer) {
  const raw = readFileSync(join(LIB, f), "utf8");
  const utanKommentarer = raw.replace(/^[ \t]*\/\/.*$/gm, "");
  for (const block of utanKommentarer.matchAll(/karnord:\s*\[([^\]]*)\]/gs)) {
    for (const sm of block[1].matchAll(/"([^"]+)"/g)) {
      const ord = sm[1];
      if (!lagerKarnord.has(ord)) lagerKarnord.set(ord, []);
      lagerKarnord.get(ord).push(f);
    }
  }
}
console.log("lager:", filer.length, "· levande kärnord:", lagerKarnord.size);

// Kandidater för de tre monstren (ib-06 evighetskapitalet · pe-08 avgiftsmaskinen · pe-09 rekapen)
const kandidater = {
  "ib-06 evighetskapitalet": [
    "evighetskapital", "evighetskapitalet", "evighetsägaren",
    "evergreen", "realiseringsfrihet", "inlösningsfrihet", "tidpunktsfrihet",
    "inlösenrätt", "realiseringstvång", "kapitalets klockor", "två klockor",
    "evighetsromantiken", "evighetsprotokollet", "panikrummet",
    "likviditetsillusionen", "ägandet utan slutdatum", "utgång på rabatt",
  ],
  "pe-08 avgiftsmaskinen": [
    "avgiftsmaskinen", "avgiftsavtalet", "fasta hjulet", "resultathjulet",
    "tröskeln", "uppfångsten", "fördelningstrappan", "vattenfallet",
    "carried interest", "carryn", "clawback", "återbetalningsskyldigheten",
    "spärrkontot", "avgiftsbördan", "nordisk kurs", "två och tjugo", "2/20",
    "fondförvaltaren", "kapitalförvaltarna", "plant läge",
  ],
  "pe-09 utdelningsrekapitaliseringen": [
    "utdelningsrekapitaliseringen", "rekapitaliseringen", "rekapen",
    "dividend recap", "irr-magin", "nybelåningen", "riskflyttningen",
    "dubbelseendet", "norra trä", "stenbro", "skulden som betalar ägaren",
    "pengarna före utgången", "utdelningen som lån",
  ],
};

let kollisioner = 0;
for (const [monster, ord] of Object.entries(kandidater)) {
  console.log("\n=== " + monster + " ===");
  for (const k of ord) {
    const dk = diafri(k);
    const traffar = [];
    for (const [befint, fil] of lagerKarnord) {
      const db = diafri(befint);
      let kol = false;
      if (dk.includes(" ") || db.includes(" ")) kol = dk === db;
      else {
        const tak = Math.min(dk.length <= 3 ? 0 : dk.length <= 7 ? 1 : 2, db.length <= 3 ? 0 : db.length <= 7 ? 1 : 2);
        kol = tav(dk, db) <= tak;
      }
      if (kol) traffar.push(befint + " → " + [...new Set(fil)].join(","));
    }
    if (traffar.length) {
      kollisioner += traffar.length;
      console.log("  KOLLISION «" + k + "»: " + traffar.join(" | "));
    } else {
      console.log("  ok «" + k + "»");
    }
  }
}
console.log("\nTOTALT kollisioner: " + kollisioner);
