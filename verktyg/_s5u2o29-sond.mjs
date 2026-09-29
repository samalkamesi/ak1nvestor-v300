#!/usr/bin/env node
/**
 * SOND för s5-u2 (manifest auto-s5-1790664909035) — vitfläckskarta mot
 * 495-registret (public/deep-courses.json, ALLA textfält) inför val av
 * +2 kurser med varför-rader. Disk-först-doktrinen: resultatet pekar ut
 * ytan; anspråksfilen klaimar den FÖRE byggstart.
 *
 * Kör: node verktyg/_s5u2o29-sond.mjs
 */
import { readFileSync } from "node:fs";

const dc = JSON.parse(readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"));
const slugs = Object.keys(dc);

/** Serialisera ALL text i en kurs (titel → kapitel). */
function allText(slug) {
  const c = dc[slug];
  return JSON.stringify(c).toLowerCase();
}
const blob = {};
for (const s of slugs) blob[s] = allText(s);

function agare(term) {
  const t = term.toLowerCase();
  return slugs.filter((s) => blob[s].includes(t));
}

// ── 1. Familjeöversikt: titlar per familj (för seriebeslut) ──────────────────
const familjer = ["ud", "ln", "st", "vr", "vm", "od", "pe", "rs", "am", "ma", "kt", "ks", "sj", "mt", "ek"];
console.log("═`.repeat(0)═ FAMILJETITLAR ═".replace("═`.repeat(0)═", "═"));
for (const f of familjer) {
  const med = slugs.filter((s) => s.startsWith(f + "-")).sort();
  console.log(`\n── ${f} (${med.length}) ──`);
  for (const m of med) console.log(`  ${m}: ${dc[m].title}`);
}

// ── 2. Kandidat-probe: term → ägare ──────────────────────────────────────────
const kandidater = [
  // arbetskapital / kapitalbinding
  "arbetskapital", "nettoarbetskapital", "kassakonverteringscykel", "kapitalbindning",
  "lageromsättningshastighet", "fordringsdagar", "leverantörsskuld",
  // utdelning
  "särskild utdelning", "extrautdelning", "utdelningspolicy", "direktavkastning",
  "utdelningshistorik", "omvänd split",
  // värdering
  "summan av delarna", "sotp", "reverserad dcf", "ägarvinst", "kapitaliseringsgrad",
  "ersättningsvärde", "tailschen", "tobin",
  // optioner
  "volatilitetsleende", "vega", "theta", "gamman", "grekerna", "underliggande tillgång",
  "utfärdade optioner", "stäLdbocker", "callable", "inlösen",
  // risk/stabilitet
  "valutarisk", "valutasäkring", "valutaexponering", "transaktionsrisk",
  "operativ risk", "processor", "bolagsstyrning", "insynslista",
  "likviditetsfälla", "refinansierings",
  // marknad
  "courtage", "depå", "likviditetsgarant", "market maker", "mörk pool",
  "short interest", "utlåningsränta",
  // makro
  "kvantitativ lättnad", "avkastningskurva", "inverted yield", "växelkurs",
  "penningpolitisk", "kreditflöde", "m2",
  // övrigt
  "konkurs", "rekonstruktion", "emissionsrätter", "teckningsrätt",
  "verklig ägare", "ställd garanti", "kassakrav",
];

console.log("\n═ PROBE: kandidatterm → ägande (0 = vit fläck) ═");
for (const k of kandidater) {
  const a = agare(k);
  const mark = a.length === 0 ? "  ← VIT FLÄCK" : a.length <= 2 ? "  ← TUNNT" : "";
  console.log(`«${k}»: ${a.length}${mark} ${a.length > 0 && a.length <= 6 ? "→ " + a.join(", ") : ""}`);
}
