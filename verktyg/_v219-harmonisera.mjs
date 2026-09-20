#!/usr/bin/env node
/**
 * VÅG 219 — svitharmonisering: svaraLokaltPengarstid i alla AI-Mentorn-sviters
 * L01-KOMPONENTER-kedja (dokumentationsplikten). Rot: fullsvep attempt 3 —
 * ALLA 40 sviter RÖDA med exakt 'okänd kedjekomponent: svaraLokaltPengarstid'
 * (widgeten wireade pengarstid utan harmonisering — v189:s kända mönster).
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROTA = "/home/ak1a/agent/ak1";
const VERK = ROTA + "/verktyg";

// Kredit: vem wireade pengarstid i widgeten?
let kredit = "auto-s6-fönstret";
try {
  const logg = execFileSync(
    "git",
    ["-C", ROTA, "log", "--oneline", "-1", "--", "src/lib/ai-mentor-pengarstid-fragor.ts"],
    { encoding: "utf8", timeout: 30_000 },
  ).trim();
  if (logg) kredit = logg.slice(0, 80);
} catch { /* citatet är prydnad, inte krav */ }
console.log("pengarstid-kredit:", kredit);

const SPLITTRA = `"svaraLokaltMarknadsrytm",]`;
const INFOGA = `"svaraLokaltPengarstid",\n  // V219-harmonisering (rond 114): pengarstid wireades i widgeten utan svitharmonisering\n  // (föregångare: ${kredit.replace(/\n/g, " ")}) — mellan optionshantverk och marknadsrytm.\n  "svaraLokaltMarknadsrytm",]`;

const filer = readdirSync(VERK).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f));
let andrade = 0;
const problem = [];
for (const fil of filer) {
  const sokvag = VERK + "/" + fil;
  const text = readFileSync(sokvag, "utf8");
  if (text.includes('"svaraLokaltPengarstid"')) {
    problem.push(fil + " (har redan pengarstid — lämnad orörd)");
    continue;
  }
  const antal = text.split(SPLITTRA).length - 1;
  if (antal !== 1) {
    problem.push(fil + ` (${antal} träffar av svansmönstret — manuell granskning krävs)`);
    continue;
  }
  writeFileSync(sokvag, text.replace(SPLITTRA, INFOGA));
  andrade++;
}
console.log(`harmoniserade: ${andrade}/${filer.length} sviter`);
if (problem.length) console.log("noteringar:\n  " + problem.join("\n  "));
console.log(andrade >= 35 ? "V219-FÖRBEREDELSE: OK" : "V219-FÖRBEREDELSE: FÖR FÅ — avbryt");
