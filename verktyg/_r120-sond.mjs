#!/usr/bin/env node
/** Sond: prod-trädets smutsiga filer (git-status via node — skalet hänger). */
import { execFileSync } from "node:child_process";
try {
  const ut = execFileSync("git", ["-C", "/home/ak1a/AK1", "status", "--short"], { encoding: "utf8", timeout: 20_000 });
  console.log("PROD-STATUS:\n" + (ut || "(rent)"));
} catch (e) {
  console.log("sond-fel: " + String(e.message).slice(0, 200));
}
