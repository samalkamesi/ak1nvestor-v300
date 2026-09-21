#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789989925484, omgång 26, byggare 3/3) — SOND:
 * tre vita fläckar i 483-registret. u3:s egna serier sedan o22-o25: bf, od, kt
 * (+ se). Kandidater sondas på kärntermer; grannkurser kontrolleras för gränsdragning.
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

console.log("\n── ROND 1: kandidater — ägandesond (u3-serierna bf/od/kt + alternativ)");
const KANDIDATER = [
  // bf-18-kandidater (beteendefinans)
  "narrativ", "berättelsen om bolaget", "Shiller", "narrative economics",
  "kompetensillusion", "illusion of skill", "social smitta", "smitta",
  // od-10-kandidater (options & derivat)
  "credit default", "CDS", "kreditderivat", "ränteswap", "swaption",
  "swap", "default swap", "referensportfölj",
  // kt-10-kandidater (katalysator)
  "avknoppning", "spin-off", "spin off", "börsintroduktion", "IPO",
  "noteringsbeslut", "emissionskurs", "täckningsgrad",
  // gränskontroller mot grannar
  "konkurs", "rekonstruktion", "kapitalbrist",
];
for (const t of KANDIDATER) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.join(", ") : "0"));
}

console.log("\n── ROND 2: grannkontroll — vad äger grannkurserna redan");
for (const g of [
  "od-09-forsakringsskrivandet", "od-02-implicit-volatilitet", "od-07-terminskontraktet",
  "ks-08-valutasakringen", "rk-16-kontrahentrisken", "st-03-altman-z-score",
  "st-05-refinansieringsmuren", "kt-09-budpremien-och-budprocessen", "kt-07-den-tillverkade-katalysatorn",
  "ks-04-emissionens-mekanik", "bf-17-nutidsbias-och-den-hyperboliska-kurvan",
  "bf-16-slumpens-serier", "bf-15-bubblans-anatomi", "km-035-flockbeteende",
  "se-11-krypto", "pe-03-forvarvsmaskinen",
]) {
  const k = reg[g];
  if (!k) { console.log("  " + g + ": FINNS EJ"); continue; }
  const text = JSON.stringify(k).toLowerCase();
  const orden = ["narrativ", "berättelse", "smitta", "swap", "credit default", " cds", "avknoppning", "spin-off", "börsintroduktion", "ipo", "konkurs", "rekonstruktion", "shiller"];
  const fynd = orden.filter((o) => text.includes(o));
  console.log("  " + g + ": " + (fynd.length ? "nämner " + fynd.join(", ") : "nämner inga"));
}
