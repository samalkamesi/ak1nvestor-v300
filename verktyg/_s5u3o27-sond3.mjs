#!/usr/bin/env node
/**
 * s5-u3 o27 — SOND ROND 3: «de justerade talen» + grannkornighet för
 * kandidaterna roic-06 / ks-09-senioritet / od-11-ränteswap + kategoristrängar.
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

console.log("\n── «De justerade talen»-familjen");
for (const t of ["justerat resultat", "justerad EBITDA", "justerade tal", "engångspost", "engångsposter", "pro forma", "proforma", "exklusive engångs", "organisk tillväxt", "grundtal"]) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.slice(0, 10).join(", ") + (traf.length > 10 ? " …(" + traf.length + ")" : "") : "0"));
}

console.log("\n── Grannkornighet: rk-03-skuldfalla / km-040-banksektorn / rk-08-ranterisk / ks-05");
for (const g of ["rk-03-skuldfalla", "km-040-banksektorn", "rk-08-ranterisk", "ks-05-covenanter-och-kreditbetyg", "ks-03-skuldens-anatomi", "od-07-terminskontraktet"]) {
  const k = reg[g];
  if (!k) { console.log("  " + g + ": FINNS EJ"); continue; }
  console.log("  " + g + " [" + k.category + ", " + k.level + "]: " + (k.title || "") + " — why-topp: " + (k.why || "").slice(0, 220).replace(/\n/g, " ") + "…");
}

console.log("\n── Kategoristrängar + nivå + senaste slug i målfamiljer");
for (const f of ["roic", "ks", "od", "bk", "mt", "ln"]) {
  const lista = slugar.filter((s) => s.startsWith(f + "-"));
  const sista = lista[lista.length - 1];
  const k = reg[sista];
  console.log("  " + f + " (" + lista.length + "): kategori=»" + k.category + "« · senaste=" + sista + " [" + k.level + "]");
}
