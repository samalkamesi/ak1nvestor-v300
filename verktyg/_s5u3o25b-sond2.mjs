#!/usr/bin/env node
/**
 * s5-u3 o25 SOND 2: stål/verkstägsdjupet — gränsen mot km-041-industrisektorn
 * och övriga grannar. Kandidat: se-23-stalsektorn (stålcykeln, coil-priset,
 * förädlingskedjan) och/eller verkstadsdjupet.
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
    const s = JSON.stringify(reg[slug]).toLowerCase();
    const t = term.toLowerCase();
    let n = 0, i = -1;
    while ((i = s.indexOf(t, i + 1)) !== -1) n++;
    if (n > 0) traf.push(slug + " (" + n + ")");
  }
  return traf;
}

console.log("\n── ROND 1: stål- och verksamstermer");
for (const t of ["stålcykeln", "stålverk", "stålindustri", "valsverk", "coil", "plåt", "grossistpris", "järnmalmspriset", "skrot", "elektriskt stål", "kvartskriget", "kapacitetsutnyttjande stål", "verktygsmaskin", "verkstadsindustri", "verkstadskris", "bearbetning", "kullager", "sandvik", "atlas copco", "epiroc", "skf", "ssab", "hydraulik", "kompressorer"]) {
  const traf = sok(t);
  console.log("  «" + t + "»: " + (traf.length ? traf.join(", ").slice(0, 160) : "0"));
}

console.log("\n── ROND 2: km-041:s exakta ägande (industrisektorn)");
const km41 = reg["km-041-industrisektorn"];
if (km41) {
  console.log("  titel:", km41.title);
  console.log("  summary:", (km41.summary || "").slice(0, 300));
  const kap = km41.chapters_list || km41.chapters || [];
  if (Array.isArray(kap)) for (const k of kap) console.log("  kap:", (typeof k === "string" ? k : (k.titel || k.title || JSON.stringify(k).slice(0, 80))));
}

console.log("\n── ROND 3: km-043:s exakta ägande (energisektorn)");
const km43 = reg["km-043-energisektorn"];
if (km43) {
  console.log("  titel:", km43.title);
  console.log("  summary:", (km43.summary || "").slice(0, 300));
  const kap = km43.chapters_list || km43.chapters || [];
  if (Array.isArray(kap)) for (const k of kap) console.log("  kap:", (typeof k === "string" ? k : (k.titel || k.title || JSON.stringify(k).slice(0, 80))));
}

console.log("\n── ROND 4: syskonanspråk-läsning (VAL-rubriker)");
import { existsSync } from "node:fs";
for (const u of ["u1", "u2"]) {
  const p = ROT + "/data/vakten/auto-s5-1789962309223-s5-" + u + "-ansprak.md";
  console.log("  " + u + ": " + (existsSync(p) ? "läst ovan" : "ej på disk"));
}
