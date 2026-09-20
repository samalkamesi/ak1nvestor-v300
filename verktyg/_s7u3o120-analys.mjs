#!/usr/bin/env node
/**
 * o118 — djupanalys av BEFINTLIGA Lighthouse-rapporter (o110 EFTER-generationen)
 * för att isolera /en/blogg TBT-anomalin (≈1 100 ms) mot /ar/blogg (344) och
 * /blogg sv (329,5) på SAMMA träd/bygge (W2XS0).
 *
 * Extraherar per rapport:
 *  - total-blocking-time + first-contentful-paint/largest-contentful-paint
 *  - long-tasks-auditen: varje task (url, start, duration) + summa per url
 *  - mainthread-work-breakdown: kategorier med duration
 *  - dom-size, total-byte-weight, unused-js, bootup-time (script eval per url)
 *
 * Utdata: data/forskning/OPTIMERING/lighthouse/o118-djupanalys-befintlig.json
 * (maskinläsbart) + kompakt tabell på stdout.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KAT = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse");
const RAPPORTER = [
  ["en_blogg-A", "en_blogg-s7u2o110-efterA.json"],
  ["en_blogg-B", "en_blogg-s7u2o110-efterB.json"],
  ["en_blogg-C", "en_blogg-s7u2o110-efterC.json"],
  ["ar_blogg-A", "ar_blogg-s7u2o110-efterA.json"],
  ["ar_blogg-B", "ar_blogg-s7u2o110-efterB.json"],
  ["blogg-sv-A", "blogg-s7u2o110-efterA.json"],
  ["blogg-sv-B", "blogg-s7u2o110-efterB.json"],
];

function num(a) {
  return typeof a?.numericValue === "number" ? Math.round(a.numericValue) : null;
}

const ut = {};
for (const [etikett, fil] of RAPPORTER) {
  let r;
  try {
    r = JSON.parse(readFileSync(join(KAT, fil), "utf8"));
  } catch (e) {
    ut[etikett] = { fel: e.message };
    continue;
  }
  const A = r.audits ?? {};
  const rad = {
    tbt: num(A["total-blocking-time"]),
    fcp: num(A["first-contentful-paint"]),
    lcp: num(A["largest-contentful-paint"]),
    domElement: A["dom-size"]?.details?.items?.[0]?.totalDOMElements ?? null,
    byteVikt: num(A["total-byte-weight"]),
    longTasks: [],
    longTaskSumma: null,
    perUrl: {},
    mainthread: {},
    bootupTotal: num(A["bootup-time"]),
    bootupPerUrl: {},
    scriptEllerAnnat: {},
  };
  const lt = A["long-tasks"]?.details?.items ?? [];
  let sum = 0;
  for (const t of lt) {
    const dur = Math.round(t.duration);
    const start = Math.round(t.startTime);
    sum += dur;
    rad.longTasks.push({ url: t.url ?? t.attributableUrl ?? "?", start, dur });
    const nyckel = (t.url ?? "dokument/okand").split("/").pop().slice(0, 60);
    rad.perUrl[nyckel] = (rad.perUrl[nyckel] ?? 0) + dur;
  }
  rad.longTaskSumma = sum;
  for (const it of A["mainthread-work-breakdown"]?.details?.items ?? []) {
    rad.mainthread[it.group ?? it.label ?? "?"] = Math.round(it.duration);
  }
  for (const it of A["bootup-time"]?.details?.items ?? []) {
    rad.bootupPerUrl[(it.url ?? "?").split("/").pop().slice(0, 60)] = {
      eval: Math.round(it.scripting ?? 0),
      parse: Math.round(it.scriptParseCompile ?? 0),
    };
  }
  ut[etikett] = rad;
}

// Kompakt stdout-tabell
const kol = ["en_blogg-A", "en_blogg-B", "en_blogg-C", "ar_blogg-A", "ar_blogg-B", "blogg-sv-A", "blogg-sv-B"];
console.log("rapport".padEnd(14), "TBT".padStart(6), "LTsum".padStart(7), "LTn".padStart(4), "DOM".padStart(6), "FCP".padStart(6), "LCP".padStart(6));
for (const k of kol) {
  const r = ut[k];
  if (!r || r.fel) { console.log(k, "FEL", r?.fel); continue; }
  console.log(
    k.padEnd(14),
    String(r.tbt).padStart(6),
    String(r.longTaskSumma).padStart(7),
    String(r.longTasks.length).padStart(4),
    String(r.domElement).padStart(6),
    String(r.fcp).padStart(6),
    String(r.lcp).padStart(6),
  );
}
console.log("\n— longtasks per URL (topp per rapport) —");
for (const k of kol) {
  const r = ut[k];
  if (!r || r.fel) continue;
  const topp = Object.entries(r.perUrl).sort((a, b) => b[1] - a[1]).slice(0, 4);
  console.log(k, "→", topp.map(([u, d]) => `${u}:${d}ms`).join(" · ") || "(inga)");
}
console.log("\n— mainthread-kategorier —");
for (const k of kol) {
  const r = ut[k];
  if (!r || r.fel) continue;
  const topp = Object.entries(r.mainthread).sort((a, b) => b[1] - a[1]).slice(0, 5);
  console.log(k, "→", topp.map(([u, d]) => `${u}:${d}`).join(" · "));
}

const utfil = join(KAT, "o118-djupanalys-befintlig.json");
writeFileSync(utfil, JSON.stringify(ut, null, 1));
console.log(`\nSkriven: ${utfil}`);
