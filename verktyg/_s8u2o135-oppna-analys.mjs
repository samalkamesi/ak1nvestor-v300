#!/usr/bin/env node
// _s8u2o135-oppna-analys.mjs — spår 8 s8-u2 (o135): inventering av feljaktens ÖPPNA fynd
// Read-only: läser feljakt-fynd.jsonl + feljakt-bedomningar.jsonl, listar öppna per klass.
// Skriver rådata till data/vakten/_s8u2o135-oppna.json (gitignorerad sondklass per konvention).
import fs from "node:fs";
import path from "node:path";

const ROT = "/home/ak1a/AK1";
const fyndFil = path.join(ROT, "data/vakten/feljakt-fynd.jsonl");
const bedomFil = path.join(ROT, "data/vakten/feljakt-bedomningar.jsonl");
const utFil = path.join(ROT, "data/vakten/_s8u2o135-oppna.json");

function lasJsonl(fil) {
  const rader = fs.readFileSync(fil, "utf8").split("\n").filter((r) => r.trim());
  const poster = [];
  for (const rad of rader) {
    try {
      poster.push(JSON.parse(rad));
    } catch {
      // hoppar korrupt rad — aldrig dö för en enskild rad
    }
  }
  return poster;
}

const fynd = lasJsonl(fyndFil);
const bedomningar = lasJsonl(bedomFil);

// Samma kopplingsnyckel som lage-verktyget: fyndets ts mot bedömningens ts
const domdaTs = new Set();
for (const b of bedomningar) {
  if (b && typeof b.ts === "string") domdaTs.add(b.ts);
}

const oppna = fynd.filter((f) => f && typeof f.ts === "string" && !domdaTs.has(f.ts));

// Gruppering: spår + normaliserad fyndrubrik
function nyckel(f) {
  const sp = f["spår"] ?? f.spar ?? "?";
  const rubrik = (f.fynd ?? "?").replace(/\s*\(.*?\)\s*$/, "").trim();
  return `${sp} | ${rubrik}`;
}
const grupper = new Map();
for (const f of oppna) {
  const k = nyckel(f);
  if (!grupper.has(k)) grupper.set(k, []);
  grupper.get(k).push(f);
}

const sammanfattning = [...grupper.entries()]
  .map(([k, list]) => ({
    klass: k,
    antal: list.length,
    hoga: list.filter((f) => f.allvar === "HÖG" || f.allvar === "KRITISK").length,
    tidsfonster: list.map((f) => f.ts).sort().slice(0, 1).concat(list.map((f) => f.ts).sort().slice(-1)),
    exempel: list[0],
  }))
  .sort((a, b) => b.antal - a.antal || a.klass.localeCompare(b.klass));

fs.writeFileSync(
  utFil,
  JSON.stringify({ genererad: new Date().toISOString(), totalt: fynd.length, oppna: oppna.length, oppnaLista: oppna, grupper: sammanfattning }, null, 1)
);

console.log(`totalt=${fynd.length} bedomda=${domdaTs.size} oppna=${oppna.length}`);
for (const g of sammanfattning) {
  console.log(`${String(g.antal).padStart(3)}st HÖG=${g.hoga} | ${g.klass} | ${g.tidsfonster[0]} .. ${g.tidsfonster[g.tidsfonster.length - 1]}`);
}
console.log(`RAADATA=${utFil}`);
