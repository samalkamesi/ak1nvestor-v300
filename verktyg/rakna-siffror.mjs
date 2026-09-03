#!/usr/bin/env node
/**
 * RÄKNA SIFFROR — sajtens guldkälla för alla kurs-/bok-/quiz-tal.
 *
 * Skriver data/siffror.json som src/lib/siffror.ts importerar (byggtids-
 * konstant, ~100 byte — aldrig 17 MB deep-courses.json i klient-bundle).
 *
 * Kör efter varje kurstillägg:  node verktyg/rakna-siffror.mjs
 * Kvalitetsvakten kontrollerar att filen matchar verkligheten.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = realpathSync(join(dirname(fileURLToPath(import.meta.url)), ".."));
const sokerFil = (p) => {
  // realpath när filen finns (symlink-/traversal-skydd); nya filer kontrolleras
  // lexikalt mot repo-roten innan de skapas.
  let verklig;
  try {
    verklig = realpathSync(p);
  } catch {
    verklig = resolve(p);
  }
  const rot = process.platform === "win32" ? REPO + "\\" : REPO + "/";
  if (!(verklig + "").startsWith(rot)) {
    throw new Error(`sökväg utanför repo-roten avvisad: ${p}`);
  }
  return verklig;
};

const kurser = JSON.parse(readFileSync(sokerFil(join(REPO, "public", "deep-courses.json")), "utf8"));
const lista = Object.values(kurser);

let quiz = 0;
let bokmaster = 0;
for (const k of lista) {
  if (k.category === "BOKMASTER") bokmaster++;
  for (const ch of k.chapters ?? []) quiz += Array.isArray(ch.quiz) ? ch.quiz.length : 0;
}

const kanon = JSON.parse(readFileSync(sokerFil(join(REPO, "data", "bokkanon.json")), "utf8"));
const kanonBocker = Array.isArray(kanon.bocker) ? kanon.bocker.length : 0;
const kanonSomKurs = Array.isArray(kanon.bocker)
  ? kanon.bocker.filter((b) => b.status === "kurs").length
  : 0;

// Fas-mängderna ur kurs-access.ts (kanonisk källa för låsningen)
const access = readFileSync(sokerFil(join(REPO, "src", "lib", "kurs-access.ts")), "utf8");
const antal = (namn) => {
  const m = access.match(new RegExp(`${namn}[^=]*=\\s*new Set\\(\\[(.*?)\\]\\)`, "s"));
  return m ? (m[1].match(/"/g) ?? []).length / 2 : 0;
};
const fas2 = antal("FAS2_KURSER");
const fas3 = antal("FAS3_KURPER") || antal("FAS3_KURSER");

const siffror = {
  _kalla: "public/deep-courses.json + data/bokkanon.json + src/lib/kurs-access.ts — genererad av verktyg/rakna-siffror.mjs; kör skriptet efter varje kurstillägg",
  kurser: lista.length,
  bokmaster,
  quiz,
  quizXp: quiz * 10,
  kanonBocker,
  kanonSomKurs,
  fas2Kurser: fas2,
  fas3Kurser: fas3,
  uppdaterad: new Date().toISOString().slice(0, 10),
};

const ut = join(REPO, "data", "siffror.json");
writeFileSync(sokerFil(ut), JSON.stringify(siffror, null, 2) + "\n");
console.log(
  `Skrev data/siffror.json: ${siffror.kurser} kurser · ${siffror.bokmaster} BOKMASTER · ${siffror.quiz} quiz · kanon ${siffror.kanonBocker} (${siffror.kanonSomKurs} som kurs) · Fas2 ${siffror.fas2Kurser} · Fas3 ${siffror.fas3Kurser}`
);
