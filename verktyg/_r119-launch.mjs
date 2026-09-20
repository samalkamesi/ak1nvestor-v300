#!/usr/bin/env node
/** R119-launcher: syntaxkontroll + detached start av TUNG-jakten (V230). */
import { spawn } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const SVAR = `${ROT}/data/vakten/r119-launch-svar.txt`;

// 1) syntaxkontroll synkront
let syntax = "OK";
try {
  await import("node:child_process").then(({ execFileSync }) => {
    execFileSync(process.execPath, ["--check", `${ROT}/verktyg/_r119-tungjakt.mjs`], { encoding: "utf8" });
  });
} catch (e) {
  syntax = `FEL: ${String(e.stderr || e.message).slice(0, 400)}`;
}
if (syntax !== "OK") {
  fs.writeFileSync(SVAR, `SYNTAX ${syntax}\n`);
  console.log(`SYNTAX ${syntax}`);
  process.exit(1);
}

// 2) detached start
fs.writeFileSync(`${ROT}/data/vakten/r119-tungjakt.log`, `TUNGJAKT launch ${new Date().toISOString()}\n`);
const barn = spawn(process.execPath, [`${ROT}/verktyg/_r119-tungjakt.mjs`], {
  cwd: ROT,
  env: { ...process.env, NO_COLOR: "1" },
  detached: true,
  stdio: ["ignore", fs.openSync(`${ROT}/data/vakten/r119-tungjakt-fel.log`, "a"), fs.openSync(`${ROT}/data/vakten/r119-tungjakt-fel.log`, "a")],
});
barn.unref();
fs.writeFileSync(SVAR, `SYNTAX OK\nTUNGJAKT pid=${barn.pid} född detached ${new Date().toISOString()}\n`);
console.log(`TUNGJAKT pid=${barn.pid}`);
