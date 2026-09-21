#!/usr/bin/env node
/** s5-u2 o25 — tredje passet: eftersläpande komman före } eller ] i kursfilerna. */
import { readFileSync, writeFileSync } from "node:fs";
const ROT = "/home/ak1a/AK1";
for (const fil of ["data/kurser-tillagg/bk-08-intaktredovisningen.json", "data/kurser-tillagg/roic-05-den-ekonomiska-vinsten.json"]) {
  let t = readFileSync(ROT + "/" + fil, "utf8");
  const tra = [...t.matchAll(/",(\s*[\]}])/g)];
  for (const m of tra) console.log(fil.split("/").pop() + ": trailing → " + JSON.stringify(m[0].slice(0, 20)));
  t = t.replace(/",(\s*[\]}])/g, '"$1');
  writeFileSync(ROT + "/" + fil, t, "utf8");
  try {
    const k = JSON.parse(readFileSync(ROT + "/" + fil, "utf8"));
    console.log(fil.split("/").pop() + ": JSON GILTIG — " + k.chapters.length + " kapitel");
    const s = JSON.stringify(k);
    const ell = [...s.matchAll(/.{40}\.\.\..{40}/g)];
    for (const m of ell) console.log("  TRE-PUNKTER >>> " + m[0]);
  } catch (e) {
    console.log(fil.split("/").pop() + ": FORTFARANDE OGILTIG: " + e.message);
  }
}
