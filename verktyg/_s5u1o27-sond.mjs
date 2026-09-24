#!/usr/bin/env node
/**
 * s5-u1 (manifest auto-s5-1790027118738, omgång 27) — SOND: nästa u1-steg i
 * spårets kö (ks-09 / ma-09 / am-10) mot hela 489-registret (alla textfält)
 * + grannkontroll mot kända ägare.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const slugar = Object.keys(reg);
console.log("Register: " + slugar.length + " kurser");

function sok(term) {
  const traf = [];
  for (const slug of slugar) {
    const k = reg[slug];
    const stack = JSON.stringify(k);
    let n = 0, i = -1;
    while ((i = stack.indexOf(term, i + 1)) !== -1) n++;
    if (n > 0) traf.push(slug + " (" + n + ")");
  }
  return traf;
}

console.log("\n── ROND 1: am-10-kandidater (AKTIEMARKNADEN I PRAKTIKEN:s tionde steg)");
for (const t of ["mörk pool", "mörka pooler", "dark pool", "systematic internaliser", "off-trade", "algohandel", "algoritmhandel", "högfrekvens", "high frequency", "courtage", "transaktionskostnad", "slippage", "settlement", "clearing", "central motpart", "CCP", "market maker", "markedsmakrer", "spreadkostnad", "handelskostnad"]) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.slice(0, 8).join(", ") + (traf.length > 8 ? " …" : "") : "0 träffar TOTALT"));
}

console.log("\n── ROND 2: ma-09-kandidater (MAKROEKONOMI & RÄNTA:s nionde steg)");
for (const t of ["riksgäld", "statsskuld", "statsbudget", "skuldtak", "kreditbetyg för stater", "statsobligationsauktion", "aupärr", "utbudet av statsobligationer", "naturfrekvens", "NAIRU", "nairu", "output gap", "produktionsgap", "potentialproduktion", "arbetsmarknadsspänning", "lediga jobb", "vakanser", "jäv", "betalningsbalans"]) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.slice(0, 8).join(", ") + (traf.length > 8 ? " …" : "") : "0 träffar TOTALT"));
}

console.log("\n── ROND 3: ks-09-kandidater (KAPITALSTRUKTUR:s nionde steg — ENDAST om ks-09 osprunget)");
for (const t of ["kapitalreturnering", "särskild utdelning", "amorteringsplan", "utdelningspolicy", "återköpsprogram", "repurchase", "delisting", "avnotering", "buyback"]) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.slice(0, 8).join(", ") + (traf.length > 8 ? " …" : "") : "0 träffar TOTALT"));
}

console.log("\n── ROND 4: grannarnas ägande (am-familjen + rk-16 + ma-familjen)");
for (const g of ["am-04-marknadsstruktur", "am-01-likviditet-och-spread", "am-05-handelsdagens-auktioner", "rk-16-kontrahentrisken", "ma-04-konjunkturindikatorerna", "ma-05-kreditpremien", "ma-01-transmissionsmekaniken", "mk-06-penningpolitik", "mk-04-statsobligationer"]) {
  const k = reg[g];
  if (!k) { console.log("  " + g + ": FINNS EJ"); continue; }
  const text = JSON.stringify(k).toLowerCase();
  const orden = ["mörk", "pool", "algo", "högfrekvens", "courtage", "transaktionskostnad", "slippage", "settlement", "clearing", "motpart", "market maker", "likviditet", "riksgäld", "statsskuld", "auktion", "naturfrekvens", "output gap", "vakans", "arbetslöshet"];
  const fynd = orden.filter((o) => text.includes(o));
  console.log("  " + g + ": " + (fynd.length ? "nämner " + fynd.join(", ") : "nämner inga av sondermorden"));
}
