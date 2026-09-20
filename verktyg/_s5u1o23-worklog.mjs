#!/usr/bin/env node
// s5-u1 o23 — worklog-append: läs commitmsg-filens rubrik + paragraf och
// appenda som worklog-rad (mönstret från omgång 20-22: rubrik med ## SPÅR 5,
// tom rad, brödtext, tom rad). Idempotent: avbryter om raden redan finns.
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const MSG = readFileSync("/home/ak1a/AK1/verktyg/_s5u1o23-commitmsg.txt", "utf8").trim();
const rader = MSG.split("\n");
const rubrik = rader[0].replace(/^studio: /, "## SPÅR 5 ").replace(" [fabrik]$/", "");
const bröd = rader.slice(1).join("\n").trim();
const worklog = "/home/ak1a/AK1/worklog.md";
const befintlig = readFileSync(worklog, "utf8");
if (befintlig.includes("auto-s5-1789910709805-s5-u1-ansprak") && befintlig.includes("am-09 MARGINALHANDELN")) {
  console.log("worklog bär redan omgång 23:s u1-rad — ingen append.");
  process.exit(0);
}
appendFileSync(worklog, "\n" + rubrik + "\n\n" + bröd + "\n", "utf8");
console.log("worklog appenderad:", rubrik.slice(0, 120) + "…");
