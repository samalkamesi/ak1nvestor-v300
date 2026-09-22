#!/usr/bin/env node
/** R154 fullsvep attempt 5 — ÅTERUPPTAGNING med --fortsatt (V228-checkpointad:
 *  söndagens försök dog i evig RAM-väntan 1429 MB; checkpointade sviter hoppar över).
 *  Fristående (detached): sessionsdöd dödar aldrig sveppet (r112-lärdomen).
 *  V223: TUNG-startkrav ≥3000 MB var 5631 vid launch — klassmedvetet bevisat. */
import { spawn } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/r154-fullsvep5-fortsatt.log`;
fs.appendFileSync(LOGG, `\nFULLSVEP R154-A5FORTSATT START ${new Date().toISOString()} (V228-checkpointad, --fortsatt)\n`);

const barn = spawn("node", ["verktyg/kor-alla-tester.mjs", "--fortsatt"], {
  cwd: ROT,
  env: { ...process.env, NO_COLOR: "1" },
  detached: true,
  stdio: ["ignore", fs.openSync(LOGG, "a"), fs.openSync(LOGG, "a")],
});
barn.unref();
fs.appendFileSync(LOGG, `BARN pid=${barn.pid} född fristående (setsid)\n`);
console.log(`fullsvep attempt 5 (återupptagning) startad pid=${barn.pid} — logg: data/vakten/r154-fullsvep5-fortsatt.log`);
