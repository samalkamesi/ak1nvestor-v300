#!/usr/bin/env node
/**
 * AK1A — STARTARE för _s7u2o144-verkstall.mjs (o144 DEL 3): spawnar
 * väntaren detached (setsid via node: detached) med stdio ignorad —
 * den skriver SIN EGEN logg via appendFileSync, så ingen omdirigering
 * behövs (skal-kvotens sammansatta-kommando-fälla kringgås: detta är
 * en enkel `node <fil>`-kanal). Pid-fil för verifiering/avlivning.
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const ROT = process.cwd();
const barn = spawn(process.execPath, [join(ROT, "verktyg/_s7u2o144-verkstall.mjs")], {
  cwd: ROT,
  detached: true,
  stdio: "ignore",
});
barn.unref();
writeFileSync("/tmp/s7u2o144-verkstall.pid", String(barn.pid) + "\n");
console.log(`verkstall-o144 startad detached pid ${barn.pid} (logg: /tmp/s7u2o144-verkstall.log)`);
