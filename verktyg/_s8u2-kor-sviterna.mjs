#!/usr/bin/env node
/**
 * SPÅR 8 s8-u2 (o98) — SVITKÖRNINGSBEVIS för harmoniseringsreparationen.
 * Kör de 38 reparerade testsviterna (de som feljägaren flaggade 2026-09-19
 * 18:12–19:22Z) och samlar deras summeringsrader + exitkoder. Läser bara
 * src/ och data/ — inga skrivande biverkningar.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = path.dirname(fileURLToPath(import.meta.url));

// De 38 flaggade filerna — läs ur ledgern så listan är bevisad, inte hårdkodad.
const fynd = fs
  .readFileSync(path.resolve(HÄR, "..", "data/vakten/feljakt-fynd.jsonl"), "utf8")
  .trim()
  .split("\n")
  .map((r) => JSON.parse(r))
  .filter((f) => f["spår"] === "F1-kod" && /syntaxfel: verktyg\/testa-ai-mentor-[\w.-]+\.mjs/.test(f.fynd));
const filer = [...new Set(fynd.map((f) => f.fynd.replace("syntaxfel: ", "")))].sort();
console.log("SVITKÖRNING: " + filer.length + " filer ur ledgern (F1-kod, 2026-09-19)");

const grona = [];
const roda = [];
for (const fil of filer) {
  const namn = path.basename(fil);
  let utsudd = "";
  let kod = -1;
  try {
    utsudd = execFileSync(process.execPath, [path.resolve(HÄR, "..", fil)], {
      encoding: "utf8",
      timeout: 120000,
      stdio: ["ignore", "pipe", "pipe"],
    });
    kod = 0;
  } catch (e) {
    kod = e.status ?? -1;
    utsudd = (e.stdout ?? "") + "\n[STDERR] " + (e.stderr ?? "").slice(0, 400);
  }
  const summering = utsudd
    .split("\n")
    .filter((r) => r.includes(" PASS · ") || r.includes("[STDERR]"))
    .slice(-2)
    .join(" ⇐ ");
  (kod === 0 ? grona : roda).push(namn);
  console.log((kod === 0 ? "GRÖN " : "RÖD  ") + namn + " (exit " + kod + ") " + summering.slice(0, 160));
}

console.log("");
console.log("RESULTAT: " + grona.length + " GRÖNA · " + roda.length + " RÖDA av " + filer.length);
if (roda.length) {
  console.log("RÖDA: " + roda.join(", "));
  process.exitCode = 1;
}
