#!/usr/bin/env node
// F2: läs prod-trädets git-status (den smuts som spärrar push).
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const R = "/home/ak1a/agent/ak1/verktyg/_f2-prodstatus-resultat.txt";
const log = (s) => fs.appendFileSync(R, `${new Date().toISOString()} ${s}\n`);
fs.writeFileSync(R, "PRODSTATUS START\n");
try {
  const ut = execFileSync("git", ["-C", "/home/ak1a/AK1", "status", "--short"], { encoding: "utf8", timeout: 30_000 });
  log("prod status:\n" + ut);
} catch (e) {
  log(`status-fel: ${String(e.message).slice(0, 300)}`);
}
try {
  const head = execFileSync("git", ["-C", "/home/ak1a/AK1", "log", "--oneline", "-2"], { encoding: "utf8", timeout: 30_000 });
  log("prod HEAD:\n" + head);
} catch (e) {
  log(`log-fel: ${String(e.message).slice(0, 200)}`);
}
log("PRODSTATUS SLUT");
