#!/usr/bin/env node
// ROND 112 — fullsvep i klassordning genom aggregatorn (r110:s bokade
// steg + F2-kurernas E2E). Loggar till data/vakten/r112-fullsvep.log.
import { spawn } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/r112-fullsvep.log`;
// APPEND (ej överskriv): tidigare körningars GRÖN-rader är leveransbevis.
// Omgång 1 (07:18–07:21) dog tyst då sessionen startade om — därför körs
// wrappern nu fristående (setsid) så sessionsdöd aldrig dödar sveppet igen.
fs.appendFileSync(LOGG, `\nFULLSVEP R112 START ${new Date().toISOString()} (omstart, append-läge)\n`);

const barn = spawn("node", ["verktyg/kor-alla-tester.mjs"], {
  cwd: ROT,
  env: { ...process.env, NO_COLOR: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
const pumpa = (ström, namn) =>
  ström?.on("data", (d) => fs.appendFileSync(LOGG, d.toString()));
pumpa(barn.stdout, "ut");
pumpa(barn.stderr, "err");
barn.on("close", (kod) => {
  fs.appendFileSync(LOGG, `\nFULLSVEP R112 SLUT exit=${kod} ${new Date().toISOString()}\n`);
  console.log(`fullsvep klart exit=${kod}`);
});
console.log(`fullsvep startat pid=${barn.pid}`);
