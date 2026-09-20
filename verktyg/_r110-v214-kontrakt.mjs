#!/usr/bin/env node
// ROND 110 — kör v214-kontraktssviten under tsx, logga till disk.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";

const LOGG = "data/vakten/r110-v214-kontrakt.log";
mkdirSync("data/vakten", { recursive: true });
writeFileSync(LOGG, `# v214 kontraktssvit — start ${new Date().toISOString()}\n`);

const r = spawnSync("npx", ["tsx", "verktyg/testa-styrelse-v214.mjs"], { encoding: "utf8", timeout: 120_000 });
appendFileSync(LOGG, `${r.stdout ?? ""}\n${r.stderr ?? ""}\n# exit=${String(r.status)} @ ${new Date().toISOString()}\n`);
console.log(`exit=${String(r.status)} — logg: ${LOGG}`);
