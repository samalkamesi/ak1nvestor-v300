#!/usr/bin/env node
// ROND 112 — V213(c)-beviskörning: dataset-aspekter-sviten under ren node,
// utdata loggas till disk (studio-shallets 30 s-fönster räcker ej).
import { spawn } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/r112-dataset-aspekter.log`;
fs.writeFileSync(LOGG, `V213(c) BEVISKÖRNING ${new Date().toISOString()}\n`);

const barn = spawn("node", ["verktyg/testa-dataset-aspekter.mjs"], {
  cwd: ROT,
  env: { ...process.env, NO_COLOR: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
for (const [ström, tagg] of [[barn.stdout, "UT"], [barn.stderr, "ERR"]]) {
  ström?.on("data", (d) => fs.appendFileSync(LOGG, d.toString()));
}
barn.on("close", (kod) => {
  fs.appendFileSync(LOGG, `\nBEVISKÖRNING SLUT exit=${kod} ${new Date().toISOString()}\n`);
  console.log(`svit klar exit=${kod}`);
});
