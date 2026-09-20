#!/usr/bin/env node
/** F3-eldprov-launcher: detached körning utan harness-tak — utdata till
 *  data/vakten/f3-eldprov.log (svar-fil med pid). */
import { spawn } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/f3-eldprov.log`;
fs.writeFileSync(LOGG, `ELDPROV launch ${new Date().toISOString()}\n`);
const barn = spawn(process.execPath, [`${ROT}/verktyg/_f3-vaccin-test.mjs`], {
  cwd: ROT,
  env: { ...process.env, NO_COLOR: "1" },
  detached: true,
  stdio: ["ignore", fs.openSync(LOGG, "a"), fs.openSync(LOGG, "a")],
});
barn.unref();
fs.writeFileSync(`${ROT}/data/vakten/f3-eldprov-svar.txt`, `ELDPROV pid=${barn.pid} född ${new Date().toISOString()}\n`);
console.log(`ELDPROV pid=${barn.pid}`);
