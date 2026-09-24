#!/usr/bin/env node
/**
 * s5-u3 o27 — SOND ROND 2: nya kandidater efter rond 1:s förkastanden
 * (pf-04 äger rebalansering, ek-04 överanpassning, km-067/ib NAV-rabatten,
 * ks-03/rk-08 räntebindning/duration).
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

console.log("\n── ROND 2: kandidater");
const KANDIDATER = [
  // återköp (ud? tx? ny)
  "återköp", "återköpsprogram", "inlösen av aktier", "aktieinlösen", "buyback", "minskar aktieantalet",
  // kapitalcykeln
  "kapitalcykel", "kapitalcykeln", "overkapacitet", "överkapacitet", "cykeln i kapital", "utbudscykel",
  // senioritet
  "förmånsrätt", "senioritet", "prioritetsordning", "subordination", "efterställd", "rekonstruktion",
  // ränteswap
  "ränteswap", "swapavtal", "swapkurvan", "fast mot rörlig",
  // gränsvakter
  "utdelningsutrymme", "AKM2", "portföljbolag", "placeringar",
];
for (const t of KANDIDATER) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.slice(0, 10).join(", ") + (traf.length > 10 ? " …(" + traf.length + ")" : "") : "0"));
}

console.log("\n── Grannkontroll för de överlevande");
for (const g of [
  "ud-01-payout-ratio", "ud-02-aterinvestering", "ud-09-utdelningens-hallbarhet", "ks-02-kapitalallokering",
  "rk-05-cykelrisk", "rk-15-cykelrisk", "se-16-sektoranalysens-metod", "se-20-gruv-och-metallsektorn",
  "se-18-rederi-och-shipping", "ks-05-covenanter-och-kreditbetyg", "st-03-altman-z-score",
  "km-040-banksektorn", "se-24-banksektorn", "se-19-forsakringssektorn", "pc-03-case-swedbank",
]) {
  const k = reg[g];
  if (!k) { console.log("  " + g + ": FINNS EJ"); continue; }
  const text = JSON.stringify(k).toLowerCase();
  const orden = ["återköp", "aktieinlösen", "kapitalcykel", "överkapacitet", "förmånsrätt", "senioritet", "rekonstruktion", "ränteswap", "riskvägt", "rorac", "noplat", "sterbhus"];
  const fynd = orden.filter((o) => text.includes(o));
  console.log("  " + g + ": " + (fynd.length ? "nämner " + fynd.join(", ") : "nämner inga"));
}
