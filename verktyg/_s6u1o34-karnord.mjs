/**
 * SOND _s6u1o34-karnord — ränteswap-monstrets kärnordskandidater mot
 * HELA kedjans LIVE-kärnord (omgång 34, manifest auto-s6-1790029519192).
 *
 * Läser ALLA ai-mentor-*-fragor.ts + ai-mentor-svar.ts i src/lib/,
 * extraherar varje karnord:-array ur källtexten och rapporterar exakta
 * kollisioner (diafri-normaliserade) för kandidatlistan nedan.
 *
 * Kör: node verktyg/_s6u1o34-karnord.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const LIB = "/home/ak1a/AK1/src/lib";

function diafri(s) {
  return s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC").trim();
}

// Kandidater — kursens EGNA begrepp (instrumentets inre maskineri).
const KANDIDATER = [
  // instrumentet självt
  "ränteswapen", "ränteswap", "ränteswappar", "ränteswapparna",
  "swappen", "swapparna", "swapavtal", "swapavtalet", "swapprogram",
  // mekaniken
  "nättingen", "nätting", "säkringsidentiteten", "säkringsidentitet",
  "swapkurvan", "swapkurva", "brytvärdet", "brytvärde", "brytvärdes",
  "dubbelssäkring", "dubbelssäkringen", "amorteringsglidet", "amorteringsglid",
  "överstäckning", "överstäckta", "räntebyte", "ränteavtalet",
  "fasta benet", "rörliga benet", "två benen", "benens riktning",
  "nominella beloppet", "nominellt belopp",
  // kursens exemplar
  "Storheden",
  // referensräntan
  "STIBOR", "stibor", "referensräntan", "referensränta",
  // syntetiska
  "syntetiskt", "syntetiska", "syntetiskt fast",
];

// Läs alla lager och extrahera kärnord.
const filer = readdirSync(LIB).filter(
  (f) => (f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts")) || f === "ai-mentor-svar.ts",
);
const allaKarnord = new Map(); // diafri(ord) -> "fil:ord"
let antalLager = 0;
let antalOrd = 0;
for (const fil of filer) {
  const text = readFileSync(join(LIB, fil), "utf8");
  // hitta alla karnord: [ ... ]-block (inkl. flerlinjiga)
  const re = /karnord:\s*\[([^\]]*)\]/g;
  let m;
  let har = false;
  while ((m = re.exec(text)) !== null) {
    const block = m[1];
    const reStr = /"([^"]+)"|'([^']+)'/g;
    let s;
    while ((s = reStr.exec(block)) !== null) {
      const ord = s[1] ?? s[2];
      const nyckel = diafri(ord);
      if (!allaKarnord.has(nyckel)) allaKarnord.set(nyckel, `${fil}:${ord}`);
      antalOrd++;
      har = true;
    }
  }
  if (har) antalLager++;
}

console.log(`Lager med kärnord: ${antalLager} (av ${filer.length} filer)`);
console.log(`Kärnord totalt (poster): ${antalOrd}, unika: ${allaKarnord.size}`);
console.log("");

let kollisioner = 0;
const fria = [];
for (const k of KANDIDATER) {
  const nyckel = diafri(k);
  const agare = allaKarnord.get(nyckel);
  if (agare) {
    console.log(`KOLLISION: «${k}» → ${agare}`);
    kollisioner++;
  } else {
    fria.push(k);
  }
}
console.log("");
console.log(`Kollisioner: ${kollisioner} · Fria: ${fria.length}`);
console.log("FRIA:", fria.join(" · "));
