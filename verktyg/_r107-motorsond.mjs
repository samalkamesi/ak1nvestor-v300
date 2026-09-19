#!/usr/bin/env node
// ROND 107-sond: motorregisters-inventering — vilka motorfiler lever i trädet
// mot registrets 42 (09-03)? Skriver /tmp/r107-motorsond.txt.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ut = [];

const register = JSON.parse(fs.readFileSync(path.join(REPO, "data", "motorregister.json"), "utf8"));
const regFiler = new Map(register.motorer.map((m) => [m.fil, m.namn]));
ut.push(`registret: ${register.motorer.length} motorer, uppdaterad ${register.uppdaterad}`);

// kandidat-motorer i trädet
const monster = [];
for (const [dir, re] of [
  ["src/lib", /-motor\.ts$/],
  ["src/lib/akm2", /\.ts$/],
  ["src/lib/portfolj-forskning", /\.ts$/],
  ["src/lib/autonom", /\.ts$/],
  ["src/lib", /ai-mentor-.*-fragor\.ts$/],
]) {
  const d = path.join(REPO, dir);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    if (re.test(f)) monster.push(path.join(dir, f));
  }
}
// dataset-moduler (v150 fas A)
const datasetDir = path.join(REPO, "src", "lib", "dataset");
if (fs.existsSync(datasetDir)) {
  for (const f of fs.readdirSync(datasetDir)) {
    if (f.endsWith(".ts") && !f.endsWith(".test.ts")) monster.push(`src/lib/dataset/${f}`);
  }
}
monster.sort();

const iReg = [];
const nya = [];
for (const f of monster) {
  if (regFiler.has(f)) iReg.push(f);
  else nya.push(f);
}
ut.push(`trädet: ${monster.length} kandidatfiler — ${iReg.length} i registret, ${nya.length} NYA:`);
for (const f of nya) ut.push(`  + ${f}`);

// registerposter vars fil försvann
const borta = register.motorer.filter((m) => !fs.existsSync(path.join(REPO, m.fil)));
ut.push(`registret: ${borta.length} poster vars fil saknas i trädet:`);
for (const m of borta) ut.push(`  - ${m.namn} (${m.fil})`);

// testtäckning: vilka testa-*.mjs + validera-motorer refererar varje kandidat?
const sviter = fs.readdirSync(path.join(REPO, "verktyg")).filter((f) => f.startsWith("testa-") && f.endsWith(".mjs"));
const svitInnehall = new Map();
for (const s of sviter) {
  try {
    svitInnehall.set(s, fs.readFileSync(path.join(REPO, "verktyg", s), "utf8"));
  } catch { /* hoppas */ }
}
try {
  svitInnehall.set("validera-motorer.mjs", fs.readFileSync(path.join(REPO, "verktyg", "validera-motorer.mjs"), "utf8"));
} catch { /* hoppas */ }

const utanTest = [];
const medTest = [];
for (const f of monster) {
  const bas = path.basename(f, ".ts");
  const traffar = [...svitInnehall.entries()].filter(([, src]) => src.includes(bas)).map(([s]) => s);
  if (traffar.length === 0) utanTest.push(f);
  else medTest.push(`${f} ← ${traffar.slice(0, 3).join(", ")}${traffar.length > 3 ? ` (+${traffar.length - 3})` : ""}`);
}
ut.push("");
ut.push(`testtäckning: ${medTest.length} med svit-referens, ${utanTest.length} UTAN:`);
for (const f of utanTest) ut.push(`  ? ${f}`);

fs.writeFileSync("/tmp/r107-motorsond.txt", ut.join("\n") + "\n");
console.log(ut.join("\n"));
