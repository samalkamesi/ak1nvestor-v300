#!/usr/bin/env node
/** R117 fullsvep attempt 5 — V228-checkpointad: varje mätt svit bankas på disk
 *  direkt (testaggregator-SENASTE.json), procesdöd = återupptagning med
 *  --fortsatt, aldrig mer tyst dataförlust. Fristående (detached): sessionsdöd
 *  dödar aldrig sveppet (r112-lärdomen). */
import { spawn } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/r117-fullsvep5.log`;
fs.appendFileSync(LOGG, `\nFULLSVEP R117-A5 START ${new Date().toISOString()} (V228-checkpointad)\n`);

const barn = spawn("node", ["verktyg/kor-alla-tester.mjs"], {
  cwd: ROT,
  env: { ...process.env, NO_COLOR: "1" },
  detached: true,
  stdio: ["ignore", fs.openSync(LOGG, "a"), fs.openSync(LOGG, "a")],
});
barn.unref();
fs.appendFileSync(LOGG, `BARN pid=${barn.pid} född fristående (setsid)\n`);
console.log(`fullsvep attempt 5 startad pid=${barn.pid} — logg: data/vakten/r117-fullsvep5.log`);
