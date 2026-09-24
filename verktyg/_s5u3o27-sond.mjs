#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1790027118738, omgång 27, byggare 3/3) — SOND:
 * tre vita fläckar i 489-registret. Kön från o26 (u2:s köpa-not): roic-06
 * finansiella bolags ROIC (»rent«), samt egna kandidater i tunna familjer
 * (ln 5, roic 5, sj 7, st 7, tx 7, ib 7, ek 7, rp 7).
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

console.log("\n── ROND 1: kandidater — ägandesond");
const KANDIDATER = [
  // roic-06-kandidat (finansiella bolags avkastning — u2:s könot »rent«)
  "riskvägt kapital", "riskvägda", "kapitalbas", "RORAC", "avkastning på eget kapital för bank",
  "finansiella bolag", "bankens balansräkning", "utlåningsgrad",
  // rp-08-kandidat (återbalansering)
  "rebalansering", "återbalansering", "viktåterställning", "korridor", "rebalanseringspremie",
  "återbalanseringspremie", "volatilitetsskörd",
  // ek-08-kandidat (överanpassning)
  "overfitting", "överanpassning", "överanpassat", "data snooping", "p-hacking",
  "ur ur provet", "out-of-sample", "frihetsgrader", "deflaterad",
  // tx-08-kandidat (CAGR-läsfällor)
  "CAGR", "sammansatt årlig", "ändpunkt", "basår", "basårs", "procentuell från noll",
  // ib-08-kandidat (NAV-rabatten och bergången)
  "NAV", "nav-rabatt", "rabatt mot substans", "substansrabatt", "crossover", "bergång",
  // st-08-kandidat (räntebindningen)
  "bindningstid", "räntebindning", "ränterisk", "duration", " rörlig ränta", "fast ränta",
  // gränskontroller
  "volatilitetsdraget", "walk-forward", "provtid", "kapitalbindning",
];
for (const t of KANDIDATER) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.slice(0, 8).join(", ") + (traf.length > 8 ? " …(" + traf.length + ")" : "") : "0"));
}

console.log("\n── ROND 2: grannkontroll — vad äger grannkurserna redan");
for (const g of [
  "roic-01-avkastning-pa-investerat-kapital", "roic-02-avkastningstrappan", "roic-04-vardeekvationen", "roic-05-den-ekonomiska-vinsten",
  "se-24-banksektorn", "se-19-forsakringssektorn", "se-06-finanssektorn",
  "rp-03-riskparitet", "rp-05-sekvensrisken", "rp-06-volatilitetsdraget", "rp-07-vantan-i-svansen",
  "ek-04-backtestens-hantverk", "ek-07-walk-forward-i-motorn", "ek-05-monte-carlo-i-motorn",
  "tx-04-tillvaxtens-granser", "tx-01-organisk-mot-forvarvad-tillvaxt",
  "ib-02-substansens-kvalitet", "ib-04-avkastningsrakningen", "vr-09-konglomeratrabatten",
  "st-01-soliditet-och-rantetackning", "ks-03-skuldens-anatomi",
]) {
  const k = reg[g];
  if (!k) { console.log("  " + g + ": FINNS EJ"); continue; }
  const text = JSON.stringify(k).toLowerCase();
  const orden = ["riskvägt", "kapitalbas", "roe", "rebalanser", "återbalanser", "korridor", "overfitting", "överanpass", "out-of-sample", "frihetsgrader", "cagr", "ändpunkt", "basår", "nav", "substansrabatt", "crossover", "bindningstid", "ränterisk", "duration", "räntebindning", "portföljvikter", "provtid"];
  const fynd = orden.filter((o) => text.includes(o));
  console.log("  " + g + ": " + (fynd.length ? "nämner " + fynd.join(", ") : "nämner inga"));
}
