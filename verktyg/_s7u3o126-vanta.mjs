#!/usr/bin/env node
/**
 * o126 vanta+mät (s7-u3): väntar ut prod-synkens deploy av 96bd416b
 * (BUILD_ID lämnar LDVlDGu2emrv69nCJjMW4), verifierar prod 200 ×3,
 * kör LÄSBARHETSSONDEN mot samma 6 sidor (cache-disabled) —
 * o123-mönstret (_s7u2o123-efter.mjs) med o126:s namnrymd.
 *
 * node verktyg/_s7u3o126-vanta.mjs [maxMinuter]
 * Utdata: data/forskning/OPTIMERING/lasbarhet-efter-o126-kur.json
 */
import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROT = "/home/ak1a/AK1";
const GAMMAL_BUILDID = "LDVlDGu2emrv69nCJjMW4";
const UTFIL_LAS = join(ROT, "data/forskning/OPTIMERING/lasbarhet-efter-o126-kur.json");
const KUR_COMMIT = "96bd416b";
const MAX_MIN = Number(process.argv[2] || 15);

const log = (m) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

function buildId() {
  try { return readFileSync(join(ROT, ".next/BUILD_ID"), "utf8").trim(); }
  catch { return "(saknas)"; }
}
function prodKod() {
  try {
    return execFileSync("curl", ["-sk", "-o", "/dev/null", "-w", "%{http_code}", "https://lab.ak1nvestor.com/dataset"], { encoding: "utf8", timeout: 20000 }).trim();
  } catch { return "FEL"; }
}
function memAvailable() {
  return Math.round(Number(readFileSync("/proc/meminfo", "utf8").match(/MemAvailable:\s+(\d+)/)[1]) / 1024);
}

const start = Date.now();
log(`BUILD_ID nu: ${buildId()} · prod ${prodKod()}`);
while (buildId() === GAMMAL_BUILDID && Date.now() - start < MAX_MIN * 60_000) {
  await new Promise((r) => setTimeout(r, 60_000));
  log(`poll (RAM ${memAvailable()} MB): ${buildId()} · prod ${prodKod()}`);
}
if (buildId() === GAMMAL_BUILDID) {
  log("TIDSGRÄNS — deployen kom inte inom fönstret; EFTER bokas hos vakarövertag (o78-precedensen)");
  process.exit(2);
}
log(`NY BUILD_ID: ${buildId()} — verifierar prod 200 ×3`);
for (let i = 0; i < 3; i++) {
  const k = prodKod();
  log(`  ${i + 1}/3: ${k}`);
  if (k !== "200") { log("inte 200 — avbryter"); process.exit(3); }
  await new Promise((r) => setTimeout(r, 3000));
}
log("DEPLOY VERIFIERAD — kör läsbarhetssonden (6 sidor, cache-disabled)");
const r = spawn("node", [join(ROT, "verktyg/_s7u2o123-sond.mjs"), UTFIL_LAS], { stdio: "inherit" });
await new Promise((los) => r.on("close", (kod) => {
  if (!existsSync(UTFIL_LAS)) { log("sonden skrev ingen fil — ABROTT"); process.exit(4); }
  process.exit(kod ?? 0);
}));
