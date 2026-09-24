#!/usr/bin/env node
/** Mikro-hjälpare: döda frusna processer via pid-lista (node-fil-kanalen). */
import fs from "node:fs";
for (const arg of process.argv.slice(2)) {
  const pid = Number(arg);
  if (!Number.isInteger(pid) || pid < 2) continue;
  try { process.kill(pid, "SIGTERM"); fs.writeFileSync(`/tmp/doda-${pid}.txt`, `SIGTERM sänt ${new Date().toISOString()}\n`); }
  catch (e) { fs.writeFileSync(`/tmp/doda-${pid}.txt`, `FEL ${String(e.message)}\n`); }
}
