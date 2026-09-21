#!/usr/bin/env node
/**
 * s5-u3 o27 — SOND ROND 4: ERSÄTTARE för roic-06 (viket åt u2:s klaim 23:50,
    disk-först). Fem kandidater mot 489-registret.
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

console.log("\n── Kandidat 1: TTM / rullande tolv (kvartalsläsningens fönster)");
for (const t of ["TTM", "rullande tolv", "tolvmånaders", "trailande", "rullande fyra kvartal", "moving annual"]) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.slice(0, 10).join(", ") + (traf.length > 10 ? " …(" + traf.length + ")" : "") : "0"));
}
console.log("\n── Kandidat 2: underhållscapex (FCF-kvalitet)");
for (const t of ["underhållscapex", "underhållskapex", "underhållsinvestering", "ersättningsinvestering", "maintenance capex", "tillväxtcapex", "växande capex"]) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.slice(0, 10).join(", ") + (traf.length > 10 ? " …(" + traf.length + ")" : "") : "0"));
}
console.log("\n── Kandidat 3: totalavkastning mot prisindex");
for (const t of ["totalavkastningsindex", "totalavkastning", "prisindex", "aktiesplit", "splittad", "återinvesterade utdelningar", "total return"]) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.slice(0, 10).join(", ") + (traf.length > 10 ? " …(" + traf.length + ")" : "") : "0"));
}
console.log("\n── Kandidat 4: minoritetsintressen");
for (const t of ["minoritetsintresse", "minoritetsposter", "minoriteter", "extern minoritet"]) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.slice(0, 10).join(", ") + (traf.length > 10 ? " …(" + traf.length + ")" : "") : "0"));
}
console.log("\n── Kandidat 5: nettoskuldbron");
for (const t of ["nettoskuld", "net cash", "nettokassa", "skuldfri balansräkning"]) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.slice(0, 10).join(", ") + (traf.length > 10 ? " …(" + traf.length + ")" : "") : "0"));
}

console.log("\n── Grannkornighet för de mest lovande");
for (const g of ["km-006-kvartalsrapporten", "km-003-kassaflodesanalysen", "v19-kapitalforbranning", "ln-02-resultatkvalitet-och-accruals", "am-02-index-och-passivt-agande", "km-024-segmentrapportering", "bk-04-koncernredovisningens-grunder", "v06-ev-ebitda"]) {
  const k = reg[g];
  if (!k) { console.log("  " + g + ": FINNS EJ"); continue; }
  const text = JSON.stringify(k).toLowerCase();
  const orden = ["ttm", "rullande tolv", "rullande fyra", "underhåll", "maintenance", "ersättningsinv", "totalavkastning", "prisindex", "aktiesplit", "minoritet", "nettoskuld", "nettokassa"];
  const fynd = orden.filter((o) => text.includes(o));
  console.log("  " + g + " [" + k.category + "]: " + (fynd.length ? "nämner " + fynd.join(", ") : "nämner inga"));
}
