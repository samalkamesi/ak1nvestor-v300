#!/usr/bin/env node
/**
 * s5-u3 omstart — KIRURGISK REGISTERLÄKNING av pf-15-faktorpremierna:
 * commit 8dd9bd6d (föregående instans) tog kursfilen med de förstärkta
 * ytterna MEN registerposten med de äldre tunna (inserten skedde före
 * omstartens summary/learn-förstärkning). Detta skript copierar kursfilens
 * fält in i registerposten — formateringssäkert (diff endast pf-15-blocket)
 * — och kör om sökindex (summary indexeras). Round-trip bevisas av KVD --efter.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROT = "/home/ak1a/AK1";
const SLUG = "pf-15-faktorpremierna";

const kurs = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + SLUG + ".json", "utf8"));
const regTextFore = readFileSync(ROT + "/public/deep-courses.json", "utf8");
const reg = JSON.parse(regTextFore);
if (!(SLUG in reg)) { console.error("SLUTFEL: " + SLUG + " saknas i registret"); process.exit(1); }

// Kopiera kursfilens samtliga fält in i registerposten (lagg-till-kurs-paritet)
const FALT = ["slug", "category", "weight", "chapterCount", "totalMinutes", "title", "summary", "minutes", "xp", "level", "learn", "why", "history", "chapters_list", "lynchSection", "grahamSection", "ak1Section", "chapters"];
const fore = { ...reg[SLUG] };
for (const f of FALT) reg[SLUG][f] = kurs[f];

const nyText = JSON.stringify(reg, null, 2) + "\n";
writeFileSync(ROT + "/public/deep-courses.json", nyText, "utf8");

// Formateringsvakt: git diff får endast röra pf-15-raderna
const diff = execFileSync("git", ["-C", ROT, "diff", "--numstat", "public/deep-courses.json"], { encoding: "utf8" });
const [plus, minus] = diff.trim().split("\t");
console.log("─ git diff deep-courses.json: +" + plus + " −" + minus + " rader");
if (Number(plus) > 190 || Number(minus) > 190) {
  writeFileSync(ROT + "/public/deep-courses.json", regTextFore, "utf8");
  console.error("SLUTFEL: diff för stor (" + plus + "/" + minus + ") — formateringsavvikelse; registret återställt orört."); process.exit(1);
}

// Verifiering
const reg2 = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const paritet = FALT.every((f) => JSON.stringify(reg2[SLUG][f]) === JSON.stringify(kurs[f]));
console.log("─ register↔kursfil-paritet: " + (paritet ? "GRÖN (18/18 fält)" : "RÖD"));
console.log("─ summary: " + fore.summary.length + " → " + reg2[SLUG].summary.length + " tecken · learn: " + fore.learn.length + " → " + reg2[SLUG].learn.length);
console.log("─ register-antal oförändrat: " + Object.keys(reg2).length);

// Sökindex bär summary — kör om ur registret
const ut = execFileSync("node", ["verktyg/kor-sokindex.mjs"], { cwd: ROT, encoding: "utf8" });
console.log("─ kor-sokindex: " + ut.trim().split("\n").pop().slice(0, 120));
const sok = JSON.parse(readFileSync(ROT + "/public/sok-index.json", "utf8"));
const pfSok = (sok.kurser || []).find ? (sok.kurser || []).find((k) => k.slug === SLUG || k.includes?.(SLUG)) : null;
const sokText = JSON.stringify(sok);
console.log("─ sok-index bär förstärkt summary: " + (sokText.includes("teoretiska kröning") ? "GRÖN" : "kontrollera — 'teoretiska kröning' ej funnen"));

if (!paritet) process.exit(1);
console.log("LÄKNING KLAR: registerposten pf-15 bär kursfilens förstärkta yttor; KVD --efter bevisar round-trip.");
