#!/usr/bin/env node
/**
 * s5-u1 (manifest auto-s5-1789962309223) — SOND: byggentreprenads-ytan
 * (se-22-kandidat) mot hela 476-registret (alla textfält) + grannkontroll
 * mot kända ägare (km-069 orderbok, km-042 fastighetsektorn, bk-familjen
 * pågående arbeten, tx-familjen cykel, rs-familjen risk).
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

const KANDIDATER = [
  "byggentreprenad", "byggbransch", "byggsektorn", "entreprenad", "entreprenör",
  "bygg och anläggning", "bygg- och anläggning", "procent på färdigt", "andelen färdigt",
  "färdigställandegrad", "orderstock", "orderingång", "pågående arbeten",
  "totalentreprenad", "fast pris", "slutlikvid", "garantibehåll", "underentreprenör",
  "byggkonjunktur", "hogkonjunktur", "bostadsbyggande", "infrastructure",
];
console.log("\n── ROND 1: kandidattermer (kursägare + bokträffar)");
for (const t of KANDIDATER) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.join(", ") : "0 träffar TOTALT"));
}

console.log("\n── ROND 2: grannarnas ägande (vad de redan äger)");
for (const g of ["km-069-orderbok-och-prissattning", "km-042-fastighetsektorn", "bk-01-balansrakningen", "bk-02-resultatrakningen", "se-15-logistik", "se-04-logistiksektorn", "tx-01-organisk-mot-forvarvad-tillvaxt", "rs-04-riskmatrisen", "st-04-stabilitet-genom-kreditcykeln", "ln-04-kapitalbindning-och-rorelsekapital"]) {
  const k = reg[g];
  if (!k) { console.log("  " + g + ": FINNS EJ"); continue; }
  const text = JSON.stringify(k).toLowerCase();
  const orden = ["orderstock", "orderingång", "orderbok", "pågående arbeten", "entreprenad", "bygg", "fast pris", "slutlikvid", "garanti"];
  const fynd = orden.filter((o) => text.includes(o));
  console.log("  " + g + ": " + (fynd.length ? "nämner " + fynd.join(", ") : "nämner inga av sondermorden"));
}
