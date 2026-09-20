#!/usr/bin/env node
// ROND 112 — fristående start av fullsvepet. Omgång 1 (studio-shellens
// bakgrundskanal) dog då sessionen startade om; denna startare spawnar
// wrappern i NY SESSION (detached=true ⇒ setsid) och avslutar direkt —
// barnet överlever sessionsdöd och skriver allt till r112-fullsvep.log.
import { spawn } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/r112-fullsvep.log`;

const barn = spawn("node", [`${ROT}/verktyg/_r112-fullsvep.mjs`], {
  cwd: ROT,
  env: { ...process.env, NO_COLOR: "1" },
  stdio: "ignore",
  detached: true,
});
barn.unref();
fs.appendFileSync(
  LOGG,
  `LAUNCHER: svep startat i ny session, pid=${barn.pid}, ${new Date().toISOString()}\n`
);
console.log(`startad pid=${barn.pid}`);
