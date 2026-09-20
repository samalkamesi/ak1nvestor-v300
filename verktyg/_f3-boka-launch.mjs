#!/usr/bin/env node
/** Boknings-launcher: startar _f3-boka.mjs FRISTÅENDE (ögonblicklig
 *  återkomst — överlever studio-shallets 30 s-fönster under belastning). */
import { spawn } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const eldprov = process.argv[2] || "4/4 PASS 17:19Z";
const barn = spawn(process.execPath, [`${ROT}/verktyg/_f3-boka.mjs`, eldprov], {
  cwd: ROT,
  env: { ...process.env, NO_COLOR: "1" },
  detached: true,
  stdio: ["ignore", fs.openSync(`${ROT}/data/vakten/f3-boka-utdata.log`, "a"), fs.openSync(`${ROT}/data/vakten/f3-boka-utdata.log`, "a")],
});
barn.unref();
fs.writeFileSync(`${ROT}/data/vakten/f3-boka-pid.txt`, `${barn.pid} ${new Date().toISOString()}\n`);
console.log(`BOKA pid=${barn.pid}`);
