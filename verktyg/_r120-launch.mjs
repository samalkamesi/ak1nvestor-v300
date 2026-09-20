#!/usr/bin/env node
/** R120: döda TUNG-jakten med KLAR-kontraktsbuggen + starta fixad variant
 *  (aggregatet rapporterar GRÖN/RÖD — aldrig KLAR — jaktens resultatlogik
 *  läser nu rapportKlar()s objekt i stället för strängjämförelse). */
import { spawn } from "node:child_process";
import fs from "node:fs";

const GAMAL = Number(process.argv[2] || 3741377);
try { process.kill(GAMAL, "SIGTERM"); console.log(`dödade gamla jakten pid=${GAMAL}`); }
catch (e) { console.log(`gamla jakten pid=${GAMAL} redan borta (${e.code})`); }

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/r119-tungjakt.log`;
fs.appendFileSync(LOGG, `${new Date().toISOString()} TUNGJAKT relaunch R120 — kontraktsfix: resultat = GRÖN/RÖD ur rapportKlar()\n`);
const barn = spawn("node", ["verktyg/_r119-tungjakt.mjs"], {
  cwd: ROT,
  env: { ...process.env, NO_COLOR: "1" },
  detached: true,
  stdio: ["ignore", fs.openSync(LOGG, "a"), fs.openSync(LOGG, "a")],
});
barn.unref();
console.log(`ny TUNG-jakt pid=${barn.pid}`);
