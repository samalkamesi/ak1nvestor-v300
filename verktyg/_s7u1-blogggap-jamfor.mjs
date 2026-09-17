#!/usr/bin/env node
// s7-u1: jämför /blogg mot /en/blogg i Lighthouse-rådata (nätverk + longtasks)
import { readFileSync } from "node:fs";

const las = (f) =>
  JSON.parse(readFileSync(`data/forskning/OPTIMERING/lighthouse/${f}`, "utf8"));
const sv = las("blogg-blogg-gap-fore.json");
const en = las("en_blogg-blogg-gap-fore.json");

function nettlista(rapport) {
  const n = rapport.audits["network-requests"];
  if (!n || !n.details) return [];
  return n.details.items.map((i) => ({
    url: i.url.replace("http://localhost:3000", ""),
    typ: i.resourceType || "?",
    overford: i.transferSize || 0,
    tid: Math.round(i.networkRequestTime || 0),
  }));
}

const svN = nettlista(sv);
const enN = nettlista(en);
console.log(`SV requests: ${svN.length}, överfört ${(svN.reduce((a, b) => a + b.overford, 0) / 1024).toFixed(0)} KiB`);
console.log(`EN requests: ${enN.length}, överfört ${(enN.reduce((a, b) => a + b.overford, 0) / 1024).toFixed(0)} KiB`);

// URL → transferSize per sida
const tilMap = (lista) => {
  const m = new Map();
  for (const r of lista) m.set(r.url, (m.get(r.url) || 0) + r.overford);
  return m;
};
const svM = tilMap(svN);
const enM = tilMap(enN);
const alla = new Set([...svM.keys(), ...enM.keys()]);
const skillnader = [...alla]
  .map((u) => ({ url: u, sv: svM.get(u) || 0, en: enM.get(u) || 0 }))
  .filter((d) => d.sv !== d.en)
  .sort((a, b) => Math.abs(b.sv - b.en) - Math.abs(a.sv - a.en));
console.log("\n=== URL:ar med olika överförd mängd (sorterat) ===");
for (const d of skillnader.slice(0, 25))
  console.log(
    `sv ${(d.sv / 1024).toFixed(1)} KiB | en ${(d.en / 1024).toFixed(1)} KiB | ${d.url.slice(0, 100)}`
  );

// longtasks via TBT-breakdown: använd mainthread-work-breakdown + long-tasks
function tasks(rapport) {
  const lt = rapport.audits["long-tasks"];
  if (lt && lt.details) return lt.details.items;
  return [];
}
const svT = tasks(sv);
const enT = tasks(en);
console.log(`\n=== Long tasks ===`);
console.log(`SV: ${svT.length} tasks, startMs: ${svT.map((t) => t.startTime.toFixed(0)).join(",")}`);
console.log(`EN: ${enT.length} tasks, startMs: ${enT.map((t) => t.startTime.toFixed(0)).join(",")}`);
for (const t of svT.slice(0, 12))
  console.log(`SV task ${t.startTime.toFixed(0)}-${(t.startTime + t.duration).toFixed(0)} (${t.duration.toFixed(0)} ms) ${t.url?.slice(0, 90) || "?"}`);
for (const t of enT.slice(0, 12))
  console.log(`EN task ${t.startTime.toFixed(0)}-${(t.startTime + t.duration).toFixed(0)} (${t.duration.toFixed(0)} ms) ${t.url?.slice(0, 90) || "?"}`);

// mainthread per kategori
function mtb(rapport) {
  const a = rapport.audits["mainthread-work-breakdown"];
  if (!a || !a.details) return [];
  return a.details.items.map((i) => `${i.groupLabel}: ${(i.duration).toFixed(0)} ms`);
}
console.log("\n=== Main thread SV ===\n" + mtb(sv).join("\n"));
console.log("\n=== Main thread EN ===\n" + mtb(en).join("\n"));
