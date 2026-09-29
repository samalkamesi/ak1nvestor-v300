#!/usr/bin/env node
// _s8u2o565-append.mjs — appendar worklog-raden (svensk text från fil, aldrig node -e)
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const RAD = readFileSync("verktyg/_s8u2o565-worklog.txt", "utf8");
if (!RAD.startsWith("## SPÅR 8 s8-u2")) {
  console.error("Väntar en s8-u2-worklog-rad — avbryter");
  process.exit(1);
}
// Idempotens: appenda endast om raden inte redan finns
const befintlig = readFileSync("worklog.md", "utf8");
if (befintlig.includes("kvalitetsvåg o565 — BOLAGSSIDORNAS SYSKONLÄNKS-KONTRAKT")) {
  console.log("Worklog-raden finns redan — inget append");
  process.exit(0);
}
if (!befintlig.endsWith("\n")) appendFileSync("worklog.md", "\n");
appendFileSync("worklog.md", "\n" + RAD);
const efter = readFileSync("worklog.md", "utf8");
console.log("Appendarad OK, worklog slutar nu med:", JSON.stringify(efter.slice(-90)));
