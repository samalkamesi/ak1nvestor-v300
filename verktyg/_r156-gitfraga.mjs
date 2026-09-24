// Rond 96 — git-frågor via node (skalet hänger)
import { execSync } from "node:child_process";
import fs from "node:fs";

const ko = (cmd, cwd) => { try { return execSync(cmd, { cwd: cwd || "/home/ak1a/agent/ak1", encoding: "utf8", timeout: 20000 }).trim(); } catch (e) { return "FEL: " + (e.stderr || e.message).toString().slice(0, 300); } };

console.log("=== SPÅRADE SONDFILER (arbetsyta) ===");
const tracked = ko("git ls-files verktyg/");
console.log(tracked.split("\n").filter(f => /_r147|_r153-dod|_s1u2-wihlborgs|_s7u2o139efter|_r156/.test(f)).join("\n") || "(ingen av sökta mönster spårad)");

console.log("\n=== FINNS FILERNA I ARBETSYTAN? ===");
for (const f of ["verktyg/_r147-dod.mjs", "verktyg/_r147-omstart.mjs", "verktyg/_r153-dod-sond.mjs", "verktyg/_s1u2-wihlborgs-q3-kontroll.mjs", "verktyg/_s7u2o139efter-kor.mjs"]) {
  console.log(f, fs.existsSync("/home/ak1a/agent/ak1/" + f) ? "FINNS" : "saknas", "| prod:", fs.existsSync("/home/ak1a/AK1/" + f) ? "FINNS" : "saknas");
}

console.log("\n=== SKRAP-ARKIV I PROD ===");
try {
  console.log(fs.readdirSync("/home/ak1a/AK1/data/vakten/skrap-arkiv/2026-09-22-engangsverktyg-o153/").join(", "));
} catch (e) { console.log("FEL:", e.message); }
console.log("arkiv i arbetsyta:", fs.existsSync("/home/ak1a/agent/ak1/data/vakten/skrap-arkiv/2026-09-22-engangsverktyg-o153/") ? "JA" : "nej");

console.log("\n=== PROD: är sondfilerna spårade där? ===");
const t2 = ko("git ls-files verktyg/", "/home/ak1a/AK1");
console.log(t2.split("\n").filter(f => /_r147|_r153-dod|_s1u2-wihlborgs|_s7u2o139efter/.test(f)).join("\n") || "(ingen spårad i prod)");
