#!/usr/bin/env node
/** V229-bevis: filtrerad sond → suffixad rapport; huvudcheckpointen orörd. */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROT = "/home/ak1a/agent/ak1";
const CHECKPOINT = path.join(ROT, "data/vakten/testaggregator-SENASTE.json");
const SOND_JSON = path.join(ROT, "data/vakten/testaggregator-SENASTE-testa-feljakt-lage.json");

const fore = fs.readFileSync(CHECKPOINT, "utf8");

// syntaxport
const synt = spawnSync("node", ["--check", "verktyg/kor-alla-tester.mjs"], { cwd: ROT, encoding: "utf8" });
if (synt.status !== 0) { console.log(`SYNTAX: RÖD — ${synt.stderr}`); process.exit(1); }
console.log("SYNTAX: node --check GRÖN");

// sondkörning (snabb svit, ingen dev-server)
const r = spawnSync("node", ["verktyg/kor-alla-tester.mjs", "--monster=testa-feljakt-lage"], { cwd: ROT, encoding: "utf8", timeout: 240_000 });
console.log(`SOND: exit=${r.status} — ${(r.stdout || "").trim().split("\n").slice(-2).join(" | ")}`);

const efter = fs.readFileSync(CHECKPOINT, "utf8");
console.log(`CHECKPOINT: ${fore === efter ? "ORÖRD (byte-identisk)" : "FÖRÄNDRAD — VACCINET FUNGERAR EJ"}`);
const sondFinns = fs.existsSync(SOND_JSON);
console.log(`SUFFIXRAPPORT: ${sondFinns ? `skapad — ${path.basename(SOND_JSON)}` : "SAKNAS"}`);
if (fore !== efter || !sondFinns) process.exit(1);

const j = JSON.parse(fs.readFileSync(SOND_JSON, "utf8"));
console.log(`SONDINNEHÅLL: matta=${j.matta}/${j.upptackta} status=${j.status}`);
console.log("V229-BEVIS: PASS — sonder rör aldrig huvudcheckpointen");
