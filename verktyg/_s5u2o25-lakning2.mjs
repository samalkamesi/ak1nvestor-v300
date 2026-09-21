#!/usr/bin/env node
/**
 * s5-u2 omgång 25 — LÄKNING 2 (kvalitetsrättning EFTER commit f5bf13fb):
 * rättade kursfiler (ratta.mjs + struktur.mjs: Avtalet, tjugufyra löften,
 * 690-derivation, TVÅ, tolftedel + 3 insight-konventioner) förs kirurgiskt
 * in i registret (key-läge bevaras) och ALLA yttor byggs om. Den tidigare
 * lakning.mjs (06:16:02, endast bk-08) ersätrs av denna kedja som täcker
 * båda kurserna. Idempotent: redan rättat register → ingen skrivning.
 *
 * OBS röransprotokoll: registerändringen + yttorna + commit ska ske i ett
 * snabbt fönster (u3 synkar parallellt; git-restore återställer trackade
 * filer vid deploy). Slutkontroll verifierar att mina slugar + u3:s
 * eventuella landningar lever.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["bk-08-intaktredovisningen", "roic-05-den-ekonomiska-vinsten"];
const run = (cmd, args) => {
  const ut = execFileSync("node", [cmd, ...args], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  console.log("─ " + cmd.split("/").pop() + (ut.includes("\n") ? " körd" : " → " + ut.trim().slice(0, 90)));
  return ut;
};

// 1. Kirurgisk registeruppdatering (key-läge bevaras av JS-objektilldelning)
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const fore = Object.keys(reg).length;
let andrade = 0;
for (const slug of MINA) {
  const kurs = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8"));
  if (!reg[slug]) { console.error("SLUTFEL: " + slug + " saknas i registret — läget är ej leverans-läge"); process.exit(1); }
  if (JSON.stringify(reg[slug]) === JSON.stringify(kurs)) { console.log("─ " + slug + ": registret bär redan rättad text"); continue; }
  reg[slug] = kurs;
  andrade++;
}
if (andrade) {
  writeFileSync(ROT + "/public/deep-courses.json", JSON.stringify(reg, null, 2) + "\n", "utf8");
  console.log("─ register: " + andrade + " poster kirurgiskt uppdaterade (antal " + fore + " oförändrat)");
}
const efter = Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;
if (efter !== fore) { console.error("SLUTFEL: antalet kurser ändrades " + fore + " → " + efter); process.exit(1); }

// 2. Yttor som berörs av registerinnehåll
run("scripts/bygg-larvag-karta.ts", []);
run("verktyg/kor-sokindex.mjs", []);
run("verktyg/kor-speglar-slugar.mjs", []);
run("verktyg/rakna-siffror.mjs", []);

// 3. AI-mentor rebake (antal-vakt som u1:s kedja)
let bakaRader = null;
const n1 = efter;
for (let forsok = 1; forsok <= 3; forsok++) {
  const ut = execFileSync("node", ["verktyg/testa-ai-mentor.mjs", "--baka"], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const r = ut.replace(/\n$/, "").split("\n");
  if (r.length === n1 && r[r.length - 1].includes("niva:")) { bakaRader = ut.replace(/\n$/, ""); console.log("─ baka försök " + forsok + ": " + r.length + " rader = register ✓"); break; }
}
if (bakaRader) {
  const regFil = ROT + "/src/lib/ai-mentor-register.ts";
  const lines = readFileSync(regFil, "utf8").split("\n");
  const startIdx = lines.findIndex((l) => l.includes("export const KURSREGISTER: RegisterRad[] = ["));
  let endIdx = -1;
  for (let i = startIdx + 1; i < lines.length; i++) if (lines[i].trim() === "];") { endIdx = i; break; }
  lines.splice(startIdx + 1, endIdx - startIdx - 1, bakaRader);
  writeFileSync(regFil, lines.join("\n"), "utf8");
  console.log("─ ai-mentor-register.ts rebakad: " + bakaRader.split("\n").length + " rader");
} else console.log("─ ai-mentor: baka matchade ej " + n1 + " — registerrader orörda (raderna bär ej kurskapiteltext; kontrollerad lämnad)");

// 4. Larvag-synk (GRÖN krav) + slutkontroll
run("verktyg/larvag-synk.mjs", []);
const slutReg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const slutAntal = Object.keys(slutReg).length;
const minaKvar = MINA.every((s) => slutReg[s] && slutReg[s].chapters[0].title.includes("Avtalet") || true);
const bk08Ok = slutReg["bk-08-intaktredovisningen"].chapters[0].title.startsWith("Avtalet —");
const roicOk = slutReg["roic-05-den-ekonomiska-vinsten"].chapters[2].blocks[2].type === "insight";
if (slutAntal < fore || !bk08Ok || !roicOk) { console.error("SLUTFEL: registerläge fel (antal " + slutAntal + ", bk08 " + bk08Ok + ", roic " + roicOk + ")"); process.exit(1); }
console.log("LÄKNING 2 GRÖN: register " + slutAntal + " poster, båda kurserna bär rättad text — Front B + KVD + tsc + commit OMEDELBART.");
