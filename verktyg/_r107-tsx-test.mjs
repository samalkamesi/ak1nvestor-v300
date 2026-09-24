#!/usr/bin/env node
// ROND 107 — kör dataset-aspekter under tsx, loggar till fil.
import { spawn } from "node:child_process";
import fs from "node:fs";
const barn = spawn("npx", ["--yes", "tsx", "verktyg/testa-dataset-aspekter.mjs"], {
  cwd: process.cwd(),
  env: { ...process.env, NO_COLOR: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let ut = "";
barn.stdout.on("data", (d) => { ut += d; });
barn.stderr.on("data", (d) => { ut += d; });
barn.on("close", (kod) => {
  fs.writeFileSync("data/vakten/r107-tsx-datasetaspekter.log", `exit ${kod}\n${ut}`);
  console.log(`exit ${kod}`);
  console.log(ut.split("\n").slice(-8).join("\n"));
  process.exit(kod === 0 ? 0 : 1);
});
