#!/usr/bin/env node
/** Rond 113 — exakt anfaderskapskoll (merge-base --is-ancestor). */
import { execFileSync } from "node:child_process";

const isAnfader = (hash) => {
  try {
    execFileSync("git", ["-C", "/home/ak1a/agent/ak1", "merge-base", "--is-ancestor", hash, "prod/develop"], {
      timeout: 30_000,
    });
    return true;
  } catch {
    return false;
  }
};
for (const [hash, namn] of [
  ["4b34ba29", "rond 113 (V215 STÄNGD + V216-V218 bokade)"],
  ["2f2f3d6f", "våg 216 (omstart-samordning)"],
]) {
  console.log(`${isAnfader(hash) ? "ANFÄDER I PROD" : "SAKNAS I PROD "}: ${hash} — ${namn}`);
}
