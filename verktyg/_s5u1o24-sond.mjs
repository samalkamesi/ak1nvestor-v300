#!/usr/bin/env node
// s5-u1 omgång 24 — temasond: vita fläckar i u1:s kandidatfamiljer (RISK/TILLVÄXT/MOAT/SKATT & JURIDIK).
import { readFileSync } from "node:fs";

const reg = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const kurser = Object.values(reg);
const sok = (ord) => kurser.filter((k) => {
  const txt = JSON.stringify(k).toLowerCase();
  return ord.some((o) => txt.includes(o));
}).map((k) => k.slug + " [" + k.category + "]");

const kandidater = {
  "RISK · regulatorisk/politisk risk (rs-10?)": ["regulatorisk risk", "politisk risk", "tillståndsris", "myndighetsris", "lagstiftningsris"],
  "RISK · cyberrisk/IT-drift (rs-10?)": ["cyberrisk", "cyberattac", "it-avbrott", "dataintrång", "ransomware"],
  "RISK · ränterisk i portföljen": ["ränterisk", "räntekänslighet", "duration"],
  "TILLVÄXT · internationalisering (tx-06?)": ["internationalisering", "geografisk expansion", "utlandsexpansion", "nya marknader"],
  "TILLVÄXT · återkommande intäkter (tx-06?)": ["återkommande intäkt", "arr-intäkt", "subscriptions", "abonnemangsintäkt"],
  "TILLVÄXT · prissättning som tillväxtmotor": ["prissättningsmakt", "prisökningar som", "price realization", "prissättningskraft"],
  "MOAT · regulatorisk vallgrav/licens (mt-09?)": ["regulatorisk vallgrav", "tillstånd som vallgrav", "licensiering", "licensbarriär", "myndighetskrav"],
  "MOAT · distributionsvallgrav": ["distributionsnät", "distributionsfördel", "hyllplats", "shelf space"],
  "SKATT · förlustkvotering (sj-07?)": ["kvotering", "förlustavdrag", "förlustutjämning"],
  "SKATT · K4 och deklarationspraktik": ["k4-blankett", "deklarationsblankett", "inkomstdeklaration"],
  "SKATT · 3:12/fåmansbolag": ["3:12", "fåmansbolag", "fåmanföretag", "utdelningsskatteskillnad"],
};
for (const [namn, ord] of Object.entries(kandidater)) {
  const traf = sok(ord);
  console.log((traf.length ? "TRÄFF " + traf.length : "VIT   0     ") + " | " + namn + (traf.length ? " → " + traf.slice(0, 4).join(", ") : ""));
}
