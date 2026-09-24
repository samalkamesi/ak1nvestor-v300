#!/usr/bin/env node
// ROND 110 / våg 214 — E2E-verifiering: styrelsesviten med K7 (per-åtgärds-
// stängslet). Kör sviten mot eget dev-fönster (port 3117, mock) och loggar
// ALL utdata till data/vakten/r110-v214-svit.log (svaret kan gå förlorat i
// studio-shallet — lita på loggen).
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";

const LOGG = "data/vakten/r110-v214-svit.log";
mkdirSync("data/vakten", { recursive: true });
writeFileSync(LOGG, `# v214 E2E — start ${new Date().toISOString()}\n`);

const r = spawnSync("node", ["verktyg/testa-styrelse.mjs", "3117"], {
  encoding: "utf8",
  timeout: 11 * 60 * 1000,
});
appendFileSync(LOGG, `${r.stdout ?? ""}\n${r.stderr ?? ""}\n# exit=${String(r.status)} @ ${new Date().toISOString()}\n`);
console.log(`exit=${String(r.status)} — logg: ${LOGG}`);
