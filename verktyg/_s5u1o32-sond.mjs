#!/usr/bin/env node
/**
 * SOND för s5-u1 (omgång 32) — vitfläckskarta mot 501-registret
 * (public/deep-courses.json, ALLA textfält) inför val av +1 kurs med
 * varför-rader. Disk-först-doktrinen: resultatet pekar ut ytan;
 * anspråksfilen klaimar den FÖRE byggstart.
 *
 * Kör: node verktyg/_s5u1o32-sond.mjs
 */
import { readFileSync } from "node:fs";

const dc = JSON.parse(readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"));
const slugs = Object.keys(dc);
console.log("registerläge:", slugs.length);

/** Serialisera ALL text i en kurs (titel → kapitel). */
const blob = {};
for (const s of slugs) blob[s] = JSON.stringify(dc[s]).toLowerCase();

function agare(term) {
  const t = term.toLowerCase();
  return slugs.filter((s) => blob[s].includes(t));
}

// ── 1. Kandidat-probe: term → ägare ─────────────────────────────────────────
const kandidater = [
  // AKTIEMARKNADEN I PRAKTIKEN: blankning (am-10-kandidat)
  "blankning", "blankera", "blankerar", "kortförsäljning", "shorta",
  "short interest", "shortränta", "utlåningsränta för aktier", "recall",
  "inlösen av lånade", "squeeze", "tvingandeköp",
  // mörkpool / algo (förkastad av o26 men gränsen dokumenterad)
  "mörk pool", "mörkpool",
  // PORTFÖLJHANTERING: rebalansering (pf-16-kandidat)
  "återbalansering", "rebalansering", "återbalansera",
  // RISKHANTERING: konkurs/rekonstruktion (rk-17-kandidat)
  "rekonstruktion", "konkursprocess", "företagsrekonstruktion",
  // MAKRO: penningmängd, växelkurs (ma/mk-kandidater)
  "penningmängd", "växelkurs", "valutakurs",
  // STABILITET: covenant (st-09-kandidat)
  "covenant", "låne covenant", "kontraktuell vik",
  // UTDELNING: utdelningsdatum/kalender (ud-11?)
  "xd-dag", "xd dag", "styckränta",
  // TILLVÄXT: emissioner (tx-08?)
  "nyemission", "riktad emission", "emissionsrätter",
  // VÄRDERING: multihistorik (vr-11?)
  "multipelhistorik", "multelpersistens", "mean reversion",
];

console.log("\n═ PROBE: kandidatterm → ägande (0 = vit fläck) ═");
for (const k of kandidater) {
  const a = agare(k);
  const mark = a.length === 0 ? "  ← VIT FLÄCK" : a.length <= 2 ? "  ← TUNNT" : "";
  console.log(`«${k}»: ${a.length}${mark}${a.length > 0 && a.length <= 6 ? "  → " + a.join(", ") : ""}`);
}

// ── 2. Familjetitlar för de familjer som är aktuella ───────────────────────
for (const f of ["am", "pf", "rk", "st", "ma", "tx", "ud", "ln"]) {
  const med = slugs.filter((s) => s.startsWith(f + "-")).sort();
  console.log(`\n── ${f} (${med.length}) ──`);
  for (const m of med) console.log(`  ${m}: ${dc[m].title}`);
}
