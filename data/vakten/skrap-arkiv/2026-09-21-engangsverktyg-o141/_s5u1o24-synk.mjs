#!/usr/bin/env node
/**
 * Registersynk — s5-u1 omgång 24: sj-07-forlustavdrag-och-kvotering.
 * HELA kedjan i EN process (atomärt; s5-u2 omg3-läxan): insert → karta →
 * sökindex → speglar → siffror → llms mönstersträngt (läser aktuellt
 * totaltal ur registret, aldrig generisk regex — s5-u1:s llms-läxa).
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const lasAntal = () => Object.keys(JSON.parse(readFileSync("public/deep-courses.json", "utf8"))).length;
const FÖRE = lasAntal();
console.log("register före:", FÖRE);

// 1. insert (idempotent — slug finns = avslut kod 0)
console.log(execSync("node verktyg/lagg-till-kurs.mjs data/kurser-tillagg/sj-07-forlustavdrag-och-kvotering.json", { encoding: "utf8" }).trim());
const EFTER = lasAntal();
console.log("register efter:", EFTER);
if (EFTER !== FÖRE + 1) { console.error(`FEL: väntade ${FÖRE + 1}, fick ${EFTER}.`); process.exit(1); }

// 2-5. karta, sökindex, speglar, siffror
for (const steg of [
  "node scripts/bygg-larvag-karta.ts",
  "node verktyg/kor-sokindex.mjs",
  "node verktyg/kor-speglar-slugar.mjs",
  "node verktyg/rakna-siffror.mjs",
]) {
  console.log("─ " + steg);
  const ut = execSync(steg, { encoding: "utf8" }).trim().split("\n").slice(-3).join("\n");
  console.log(ut);
}

// 6. llms mönstersträngt: "<FÖRE> kurser" → "<EFTER> kurser" i båda filerna
for (const fil of ["public/llms.txt", "public/llms-full.txt"]) {
  let t = readFileSync(fil, "utf8");
  const fra = `${FÖRE} kurser`, till = `${EFTER} kurser`;
  const n = t.split(fra).length - 1;
  if (n === 0) { console.error(`FEL: 0 förekomster av "${fra}" i ${fil} — vägrar generellt byte.`); process.exit(1); }
  t = t.split(fra).join(till);
  writeFileSync(fil, t);
  const efter = t.split(till).length - 1;
  console.log(`─ llms ${fil}: ${n} ställen "${fra}" → "${till}"`);
  if (efter !== n) { console.error("FEL: byte ej bit-exakt i " + fil); process.exit(1); }
}

// 7. siffror-paritet
const siffror = JSON.parse(readFileSync("data/siffror.json", "utf8"));
const kurserSiffra = siffror.kurser ?? siffror.kursantal ?? siffror.antalKurser;
console.log("siffror.json kurser:", kurserSiffra);
if (Number(kurserSiffra) !== EFTER) { console.error(`FEL: siffror ${kurserSiffra} ≠ register ${EFTER}`); process.exit(1); }

// 8. karta-paritet (konstanten i genererad fil)
const karta = readFileSync("src/lib/larvag-karta.ts", "utf8");
const konst = Number((karta.match(/LARVAG_ANTAL_KURSER = (\d+)/) || [])[1]);
console.log("larvag-karta konstant:", konst);
if (konst !== EFTER) { console.error(`FEL: karta ${konst} ≠ register ${EFTER}`); process.exit(1); }

console.log(`\nSYNK GRÖN: register ${FÖRE}→${EFTER}, karta ${konst}, siffror ${kurserSiffra}, llms ×${EFTER} (mönstersträngt).`);
