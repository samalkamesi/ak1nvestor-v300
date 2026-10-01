#!/usr/bin/env node
// _v226-beroende-koll.mjs — kartlägg ett transitivt paket i låsträdet
// (installerad version, krävare, prod/dev-läge) + registry-verifiering.
// Skrivskyddat: läser package.json/package-lock.json, ropar npm view.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROT = "/home/ak1a/agent/ak1";
const NAMN = process.argv[2] || "brace-expansion";

const pkg = JSON.parse(fs.readFileSync(path.join(ROT, "package.json"), "utf8"));
const lock = JSON.parse(fs.readFileSync(path.join(ROT, "package-lock.json"), "utf8"));
const direkt = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
]);

// Installerade instanser av paketet
const instanser = Object.entries(lock.packages || {})
  .filter(([vag]) => vag === `node_modules/${NAMN}` || vag.endsWith(`/node_modules/${NAMN}`))
  .map(([vag, m]) => ({ vag, version: m.version, dev: m.dev === true, devValfritt: m.devOptional === true }));

// Vem kräver paketet (dependencies), och är krävaren dev-markerad?
const kravare = [];
for (const [vag, m] of Object.entries(lock.packages || {})) {
  const deps = { ...(m.dependencies || {}), ...(m.peerDependencies || {}) };
  if (deps[NAMN]) {
    kravare.push({
      vag,
      krav: deps[NAMN],
      dev: m.dev === true,
      devValfritt: m.devOptional === true,
    });
  }
}

const svar = {
  paket: NAMN,
  direktIDeck: direkt.has(NAMN),
  instanser,
  kravare,
  lockNext: lock.packages?.["node_modules/next"]?.version ?? null,
  lockBrace: lock.packages?.["node_modules/brace-expansion"]?.version ?? null,
};
console.log(JSON.stringify(svar, null, 2));

// Registry-verifiering av exakta kandidatversioner
const kandidater = NAMN === "brace-expansion" ? ["1.1.21", "5.0.12"] : [];
if (kandidater.length) {
  try {
    const ut = execSync(`npm view ${NAMN} versions --json`, {
      cwd: ROT,
      timeout: 45000,
      maxBuffer: 8 * 1024 * 1024,
    }).toString();
    const versioner = JSON.parse(ut);
    const finns = Object.fromEntries(kandidater.map((k) => [k, versioner.includes(k)]));
    console.log("REGISTRY=" + JSON.stringify({ kandidater: finns, senaste: versioner.slice(-6) }));
  } catch (e) {
    console.log("REGISTRY_FEL=" + String(e && e.message ? e.message : e).slice(0, 150));
  }
}
