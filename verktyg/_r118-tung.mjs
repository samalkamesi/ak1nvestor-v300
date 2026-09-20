#!/usr/bin/env node
/** R118: TUNG-sviten (testa-styrelse) filtrerad + fristående — V229 gör
 *  körningen till en sond (egen suffixad rapport, huvudcheckpointen orörd).
 *  Aggregatet väntar själv på 3 GB (20 min tålamod) och avbryter ärligt
 *  (AVBRUTEN-rapport) om RAM aldrig öppnar — då relaunchas senare. */
import { spawn } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/r118-tung.log`;
fs.appendFileSync(LOGG, `\nTUNG-SVIT R118 START ${new Date().toISOString()}\n`);

const barn = spawn("node", ["verktyg/kor-alla-tester.mjs", "--monster=testa-styrelse"], {
  cwd: ROT,
  env: { ...process.env, NO_COLOR: "1" },
  detached: true,
  stdio: ["ignore", fs.openSync(LOGG, "a"), fs.openSync(LOGG, "a")],
});
barn.unref();
fs.appendFileSync(LOGG, `BARN pid=${barn.pid} född fristående (setsid)\n`);
console.log(`TUNG-svit startad pid=${barn.pid} — logg: data/vakten/r118-tung.log`);
