#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789962309223, omgång 25, försök 2) — SOND B:
 * tredje kursval efter mtime-förlusten av se-22 till u1 (deras klaim 05:48:53,
22:dje levererad i e6a20f9c). Arv klaimat och hedrat: bf-17 + od-09 (föregångar-
försökets filer på disk, bitidentiska med anspråkets leveransplan).
 *
 * Denna sond letar se-23-kandidat: fri sektor i 477-registret (alla textfält).
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
    const stack = JSON.stringify(reg[slug]);
    let n = 0, i = -1;
    const t = term.toLowerCase();
    const s = stack.toLowerCase();
    while ((i = s.indexOf(t, i + 1)) !== -1) n++;
    if (n > 0) traf.push(slug + " (" + n + ")");
  }
  return traf;
}

console.log("\n── ROND 1: sektorskandidater — ägandesond");
const KANDIDATER = [
  // Bank
  "banksektorn", "bankbranschen", "nettoräntenetto", "nettomarginalränta", "kreditförlust",
  "kreditförlustnivå", "kapitaltäckning", "utlåningstillväxt", "kreditportfölj", "stress test",
  // Telekom
  "telekomsektorn", "telekombranschen", "basstation", "fiberutbyggnad", "abonnemangsintäkter",
  // Läkemedel/bioteknik
  "läkemedelssektorn", "läkemedelsbolag", "biotekniksektorn", "patentklyfta", "patentutgång",
  "läkemedelspipeline", "godkännande",
  // Energi/el
  "energisektorn", "elbolag", "elpris", "vattenkraft", "kärnkraft", "reglerad avkastning",
  "elnät", "effektbehov",
  // Övriga Nordic-klassiker
  "stålverken", "stålindustrin", "verkstadssektorn", "telekom",
];
for (const t of KANDIDATER) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.join(", ") : "0"));
}

console.log("\n── ROND 2: grannkontroll — vem nämner bank/telecom/läkemedel/energi i förbifart");
for (const g of ["km-042-fastighetsektorn", "km-060-covered-calls", "se-06-finanssektorn", "se-19-forsakringssektorn", "ma-08-realrantan", "ma-03-realrantan", "ln-03-marginaltrappan-och-operativ-havstavng", "st-04-stabilitet-genom-kreditcykeln", "bk-05-kassaflodesanalysen", "vm-02", "rs-08", "am-09-marginalhandeln"]) {
  const k = reg[g];
  if (!k) { console.log("  " + g + ": FINNS EJ"); continue; }
  const text = JSON.stringify(k).toLowerCase();
  const orden = ["bank", "telekom", "läkemedel", "energi", "elpris", "patent", "kredit", "räntenetto"];
  const fynd = orden.filter((o) => text.includes(o));
  console.log("  " + g + ": " + (fynd.length ? "nämner " + fynd.join(", ") : "nämner inga"));
}
