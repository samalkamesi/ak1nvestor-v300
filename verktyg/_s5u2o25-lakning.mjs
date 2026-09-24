#!/usr/bin/env node
/**
 * s5-u2 omgång 25 — LÄKNING EFTER SPRÅKPASS: en aktör rättade bk-08 EFTER
 * commit f5bf13fb (verktyg/_s5u2o25-ratta.mjs: Avtalet, tjugufyra, 690-
 * derivation, TVÅ, tolftedel) — kursfilen bär bättre text än registret.
 * Denna kedja uppdaterar registerposten kirurgiskt (key-läge bevaras) och
 * bygger om alla yttor. Idempotent.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const SLUG = "bk-08-intaktredovisningen";
const run = (cmd, args) => {
  const ut = execFileSync("node", [cmd, ...args], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  console.log("─ " + cmd.split("/").pop() + (ut.includes("\n") ? "" : " → " + ut.trim().slice(0, 100)));
  return ut;
};

// 1. Kirurgisk registeruppdatering (key-läge bevaras)
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const kurs = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + SLUG + ".json", "utf8"));
const fore = Object.keys(reg).length;
if (reg[SLUG].chapters[0].title === kurs.chapters[0].title && reg[SLUG].history.modern === kurs.history.modern) {
  console.log("─ registret bär redan rättad text — ingen uppdatering.");
} else {
  reg[SLUG] = kurs;
  writeFileSync(ROT + "/public/deep-courses.json", JSON.stringify(reg, null, 2) + "\n", "utf8");
  const efter = Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;
  if (efter !== fore) { console.error("SLUTFEL: antal ändrat " + fore + " → " + efter); process.exit(1); }
  console.log("─ registerpost " + SLUG + " uppdaterad kirurgiskt (antal konstant " + efter + ", key-läge bevarat)");
}

// 2. Ytorna
run("scripts/bygg-larvag-karta.ts", []);
run("verktyg/kor-sokindex.mjs", []);
run("verktyg/kor-speglar-slugar.mjs", []);
run("verktyg/rakna-siffror.mjs", []);

// 3. Rebake med antal-vakt (titlar/kategorier kan bära kapiteldata)
const n = Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;
let bakaRader = null;
for (let forsok = 1; forsok <= 3; forsok++) {
  const ut = execFileSync("node", ["verktyg/testa-ai-mentor.mjs", "--baka"], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const r = ut.replace(/\n$/, "").split("\n");
  console.log("─ baka försök " + forsok + ": " + r.length + " rader (register " + n + ")");
  if (r.length === n && r[r.length - 1].includes("niva:")) { bakaRader = ut.replace(/\n$/, ""); break; }
}
if (!bakaRader) { console.error("REBAKE-FEL: tre försök utan antal-match — ABORT."); process.exit(1); }
const regFil = ROT + "/src/lib/ai-mentor-register.ts";
const lines = readFileSync(regFil, "utf8").split("\n");
const startIdx = lines.findIndex((l) => l.includes("export const KURSREGISTER: RegisterRad[] = ["));
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) if (lines[i].trim() === "];") { endIdx = i; break; }
lines.splice(startIdx + 1, endIdx - startIdx - 1, bakaRader);
writeFileSync(regFil, lines.join("\n"), "utf8");
console.log("─ ai-mentor-register.ts rebakad: " + bakaRader.split("\n").length + " rader (antal-vakt GRÖN)");

// 4. larvag-synk
run("verktyg/larvag-synk.mjs", []);
console.log("LÄKNING GRÖN: register " + n + " kurser, alla ytor ombyggda — Front B + tsc + commit OMEDELBART.");
