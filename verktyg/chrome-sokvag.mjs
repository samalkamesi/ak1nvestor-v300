#!/usr/bin/env node
/**
 * AK1A — CHROME-SÖKVÄGSUPPTÄCKT (r304, CHROME_PATH-fundet o557/o558):
 * nya servern (SSD Nodes) saknar /usr/bin/google-chrome — Chrome-for-Testing
 * lever i puppeteer-cachen (~/.cache/puppeteer, r283). Gränssnittsvakten
 * (GRÖN i drift) löste det med AK1A_CHROME-env + kandidatlista; denna modul
 * bär samma kontrakt åt prestanda-instrumenten så natt-TBT-cronen (03:2x)
 * och prestanda-mat.mjs hittar Chrome utan hårdkodad sökväg.
 *
 * Sökningsordning: AK1A_CHROME/CHROME_PATH-env → puppeteer-cache (senaste
 * linux-*-versionen först) → systemkromer. CLI-läget skriver sökvägen på
 * stdout (exit 2 vid ingen träff) så cron-skript kan exportera den.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

function cacheKromer() {
  const kat = join(homedir(), ".cache", "puppeteer", "chrome");
  if (!existsSync(kat)) return [];
  return readdirSync(kat)
    .filter((n) => n.startsWith("linux-"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .reverse() // senaste versionen först (vakt-cronens sort -V | tail -1)
    .map((v) => join(kat, v, "chrome-linux64", "chrome"))
    .filter((p) => existsSync(p));
}

export function chromeSokvag() {
  const kandidater = [
    process.env.AK1A_CHROME,
    process.env.CHROME_PATH,
    ...cacheKromer(),
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ].filter(Boolean);
  return kandidater.find((p) => existsSync(p)) || null;
}

// CLI: skriv sökvägen (cron-skript exporterar den), exit 2 om ingen hittas
if (process.argv[1] && process.argv[1].endsWith("chrome-sokvag.mjs")) {
  const s = chromeSokvag();
  if (!s) {
    console.error("CHROME-SOKVAG: hittade ingen Chrome/Chromium (env, puppeteer-cache, system)");
    process.exit(2);
  }
  console.log(s);
}
