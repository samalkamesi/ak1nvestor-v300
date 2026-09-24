#!/usr/bin/env node
// s2-u2 omg30 — worklog-append (mall _s2u1o28-worklog-append.mjs)
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
const W = "worklog.md";
const rad = readFileSync("verktyg/_s2u2o30-worklog-rad.txt", "utf8");
const nu = readFileSync(W, "utf8");
if (nu.includes("S2-U2-ENI-TERNA-UTOKNING")) { console.log("worklog-raden finns redan — no-op"); process.exit(0); }
if (!nu.endsWith("\n")) appendFileSync(W, "\n");
appendFileSync(W, rad);
const efter = readFileSync(W, "utf8");
console.log("worklog uppdaterad:", efter.includes("DATASET-DJUP +2 ENI+TERNA") ? "GRÖN" : "RÖTT?!");
