#!/usr/bin/env node
/** _r226-syntax.mjs — node --check på de åtta härdade skripten. */
import { spawnSync as sp } from "node:child_process";
const filer = ["verktyg/_f17-v166d17-kvd.mjs", "verktyg/_f21-v166d21-kvd.mjs", "verktyg/_f22-v166d22-kvd.mjs", "verktyg/_f23-v166d23-kvd.mjs", "verktyg/_f24-v166d24-kvd.mjs", "verktyg/_r187-levera.mjs", "verktyg/_r187-ratta.mjs", "verktyg/_v182-sjalvtest.mjs"];
let fel = 0;
for (const f of filer) {
  const r = sp("node", ["--check", f], { cwd: "/home/ak1a/agent/ak1", encoding: "utf8" });
  console.log(`${f}: ${r.status === 0 ? "OK" : "SYNTAXFEL: " + (r.stderr || "").slice(0, 120)}`);
  if (r.status !== 0) fel++;
}
console.log(fel === 0 ? "ALLA 8 SYNTAKTISKT GILTIGA" : fel + " FEL");
process.exit(fel === 0 ? 0 : 1);
