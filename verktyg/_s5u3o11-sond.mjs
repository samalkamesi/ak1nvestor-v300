#!/usr/bin/env node
// Sond för s5-u3 omgång 11: mäter kategori × nivå-luckor i public/deep-courses.json.
// Otrackad engångssond (spårets presedens) — läs bara, skriver inget.
import { readFileSync } from "node:fs";

const r = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const slugs = Object.keys(r);
console.log("TOTALT:", slugs.length);

// Fynd: vilket fält bär nivån?
const ex = r[slugs[0]];
console.log("Exempelfält:", Object.keys(ex).join(", "));

const kat = {};
for (const s of slugs) {
  const k = r[s];
  const katName = k.category || "?";
  if (!kat[katName]) kat[katName] = { N: 0, I: 0, A: 0, andra: 0 };
  const niv = String(k.level ?? k.niva ?? k.svarighet ?? "?").toLowerCase();
  if (niv.startsWith("ny") || niv.includes("beginner")) kat[katName].N++;
  else if (niv.startsWith("int") || niv.includes("mediate")) kat[katName].I++;
  else if (niv.startsWith("av") || niv.includes("advanced")) kat[katName].A++;
  else kat[katName].andra++;
}

const names = Object.keys(kat).sort(
  (a, b) => kat[a].N + kat[a].I + kat[a].A - (kat[b].N + kat[b].I + kat[b].A),
);
for (const n of names) {
  const k = kat[n];
  console.log(
    String(k.N + k.I + k.A + k.andra).padStart(3),
    n,
    "| N:", k.N, "I:", k.I, "A:", k.A,
    k.andra ? "andra:" + k.andra : "",
  );
}
