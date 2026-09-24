#!/usr/bin/env node
// ROND 107 — syntaxkontroll av rondens ändrade verktygsfiler.
import { execFileSync } from "node:child_process";
const filer = [
  "verktyg/kor-alla-tester.mjs",
  "verktyg/testa-tradspermanens.mjs",
  "verktyg/testa-studio-scenarion.mjs",
  "verktyg/testa-prod-synk-tidsstampel.mjs",
  "verktyg/testa-styrelse.mjs",
];
let fel = 0;
for (const f of filer) {
  try {
    execFileSync(process.execPath, ["--check", f], { stdio: "pipe", timeout: 20_000 });
    console.log("OK  ", f);
  } catch (e) {
    fel++;
    console.log("FEL ", f, String(e.stderr || e.message).slice(0, 300));
  }
}
process.exit(fel ? 1 : 0);
