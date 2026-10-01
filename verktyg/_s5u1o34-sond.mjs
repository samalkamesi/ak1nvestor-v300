#!/usr/bin/env node
// _s5u1o35-sond.mjs — sond mot public/deep-courses.json (507 kurser, ALLA textfält):
// räknar kursägare per term (case-insensitive, svensk+engelsk stavning).
// Kandidater för omgång o35 (u1:s +1-kurs):
//   A) bf-19 ankaret (o33-sondens proade vitfläck, aldrig levererad)
//   B) kt-13 aktivismen (o33-sondens kandidat, slotten togs av vd-bytet)
//   C) ma-10 räntekurvan (eget påfund — familjekönot från o27)
//   D) rp-08 positionsstorleken/Kelly (eget)
//   E) rp-08 alt: återbalansering (eget)
//   F) tx-08 TAM/marknadsanden (eget)
//   G) am-11 handelsstoppet (eget)
//   H) ma-10 alt: penningmängden (eget)
//   + kontroll: vm-05-realoptioner (finns den sedan tidigare? kollar ägarskap)
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const reg = JSON.parse(readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"));
const slugs = Object.keys(reg);

function textOf(kurs) {
  const out = [];
  (function walk(v) {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  })(kurs);
  return out.join("\n");
}
const corpus = new Map();
for (const s of slugs) corpus.set(s, textOf(reg[s]).toLowerCase());

function owners(term) {
  const t = term.toLowerCase();
  const hits = [];
  for (const [s, txt] of corpus) if (txt.includes(t)) hits.push(s);
  return hits;
}

const termer = [
  // A) bf-19-ankaret
  ["ankare"], ["ankarne"], ["anchoring"], ["förankringseffekt"], ["förankrad"], ["52-veckors"], ["utgångspunktstal"],
  // B) kt-13-aktivismen
  ["aktivist"], ["aktieägaraktivism"], ["aktivistfond"], ["engagemangsbrev"], ["aktivistkampanj"], ["styrelsekupp"],
  // C) ma-10-räntekurvan
  ["avkastningskurva"], ["räntekurva"], ["yield curve"], ["inverterad kurva"], ["kurvinvertering"], ["kurvan inverteras"], ["tvåårsränta"], ["tioränta"], ["löptidspremie"], ["löptidsstruktur"],
  // D) rp-08-positionsstorlek
  ["positionsstorlek"], ["position sizing"], ["kelly"], ["satsningsfraktion"], ["insatsstorlek"],
  // E) rp-08-alt-återbalansering
  ["återbalansering"], ["rebalansering"], ["rebalansera"],
  // F) tx-08-tam
  ["tam"], ["marknadspotential"], ["marknadsandel"], ["sam och som"], ["marknadsstorlek"], ["anden av marknaden"],
  // G) am-11-handelsstoppet
  ["handelsstopp"], ["circuit breaker"], ["kretsbrytare"], ["handelsavbrott"],
  // H) ma-10-alt-penningmängden
  ["penningmängd"], ["pengemultiplikator"], ["m1"], ["m2"], ["centralbankens balansräkning"],
  // kontroll vm-05
  ["realoption"], ["reala optioner"],
  // extra kontroller mot nära grannar
  ["beta"], ["kapitalviktning"], ["jämviktsränta"], ["styrränta"],
];

console.log("ANTAL KURSER I REGISTRET:", slugs.length, "\n");
for (const [t] of termer) {
  const hits = owners(t);
  console.log(`«${t}» — ${hits.length} kursägare${hits.length ? ": " + hits.slice(0, 10).join(", ") + (hits.length > 10 ? ` (+${hits.length - 10} till)` : "") : "  <<VIT FLÄCK>>"}`);
}

// vm-05-realoptioner: när kom den in? (git-loggen vittnar)
console.log("\n--- vm-05-realoptioner git-historik (sista 2) ---");
try {
  console.log(execSync("cd /home/ak1a/AK1 && git log --oneline --follow -2 -- data/kurser-tillagg/vm-05-realoptioner.json 2>/dev/null || echo '(ingen egen kursfil — äldre leveransväg)'", { encoding: "utf8" }));
} catch (e) { console.log("(git-log misslyckades)"); }
