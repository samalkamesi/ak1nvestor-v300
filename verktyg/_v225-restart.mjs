#!/usr/bin/env node
/** App-omstart via node-kanalen (samordnad: inget bygge löper). */
import { execFileSync } from "node:child_process";
try {
  const ut = execFileSync("pm2", ["restart", "ak1a", "--update-env"], { encoding: "utf8", timeout: 90_000 });
  console.log("OMSTART KÖRD:", ut.trim().split("\n").slice(-2).join(" | ").slice(0, 200));
} catch (e) {
  console.log("OMSTART FEL:", String(e.stdout || e.stderr || e.message).slice(0, 300));
}
