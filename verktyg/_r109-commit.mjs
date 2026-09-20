#!/usr/bin/env node
// ROND 109 — commit med fullständig loggning (tsc-grinden > studio-svarstak).
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/r109-commit.log`;
const MEDELANDE = "studio: rond 109 [organ:Φ] — v213(a) miljöklasser + fasordning i aggregatorn; styrelsesvitens prod-landmina (port 3000 + ADMIN_PASSWORD-arv) kurad; klassbevis GRÖN";

try {
  appendFileSync(LOGG, `=== commit-försök ${new Date().toISOString()} ===\n`);
  const ut = execFileSync("git", ["-C", ROT, "commit", "-m", MEDELANDE], {
    timeout: 10 * 60_000,
    encoding: "utf8",
  });
  appendFileSync(LOGG, `${ut}\n=== KLAR ===\n`);
} catch (e) {
  appendFileSync(LOGG, `FÖLL: ${String(e).slice(0, 500)}\n`);
}
// kvitto oavsett
try {
  const logg = execFileSync("git", ["-C", ROT, "log", "--oneline", "-1"], { encoding: "utf8" });
  appendFileSync(LOGG, `HEAD efter: ${logg.trim()}\n`);
} catch { /* ignorerad */ }
console.log("se data/vakten/r109-commit.log");
