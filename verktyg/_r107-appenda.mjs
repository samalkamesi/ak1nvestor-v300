#!/usr/bin/env node
// ROND 107 — appenda worklog-posten (union-ledgern appendrar i filslut).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ARB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const post = fs.readFileSync(path.join(ARB, "verktyg", "_r107-worklog-post.txt"), "utf8");
const worklog = path.join(ARB, "worklog.md");
if (fs.readFileSync(worklog, "utf8").includes("ROND 107 [organ:Φ] — VÅG 212 KVALITETSSYSTEMET")) {
  console.log("worklog-posten finns redan — skip (idempotent)");
} else {
  fs.appendFileSync(worklog, post.endsWith("\n") ? post : post + "\n");
  console.log("worklog uppdaterad:", fs.statSync(worklog).size, "byte");
}
