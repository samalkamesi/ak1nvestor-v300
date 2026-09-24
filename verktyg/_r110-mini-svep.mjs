#!/usr/bin/env node
// ROND 110 — mini-svep: ENDAST v214-sviten genom aggregatorns egen kedja
// (bevisar det breddade tsx-återfallet E2E). Loggar till disk.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";

const LOGG = "data/vakten/r110-mini-svep.log";
mkdirSync("data/vakten", { recursive: true });
writeFileSync(LOGG, `# mini-svep v214 — start ${new Date().toISOString()}\n`);

const r = spawnSync("node", ["verktyg/kor-alla-tester.mjs", "--mönster=testa-styrelse-v214\\.mjs", "--tak=180"], {
  encoding: "utf8",
  timeout: 300_000,
});
appendFileSync(LOGG, `${r.stdout ?? ""}\n${r.stderr ?? ""}\n# exit=${String(r.status)} @ ${new Date().toISOString()}\n`);
console.log(`exit=${String(r.status)} — logg: ${LOGG}`);
