#!/usr/bin/env node
// Rond 126-sond: händelser ±15 min kring F6:s tre HÖGA "prod osvarar"-tider
// ur prod-synk.log + omstart-journalen + pulsvaktens larmhistorik.
import fs from "node:fs";

const PROD = "/home/ak1a/AK1";
const tider = ["2026-09-19T20:42:34Z", "2026-09-20T14:43:16Z", "2026-09-20T16:28:09Z"];
const F = 15 * 60 * 1000;

const lasTidsrader = (sokvag) => {
  try { return fs.readFileSync(sokvag, "utf8").split("\n").filter(Boolean); }
  catch { return []; }
};

for (const t of tider) {
  const ms = Date.parse(t);
  console.log(`\n=== ${t} (±15 min) ===`);
  for (const [namn, sokvag] of [
    ["synk", `${PROD}/data/vakten/prod-synk.log`],
    ["pulsvakt", `${PROD}/data/vakten/pulsvakt-larm.jsonl`],
    ["hjartslag", `${PROD}/data/vakten/hjartslag.log`],
    ["kraschvakt", `${PROD}/data/vakten/kraschvakt.log`],
  ]) {
    const trafar = lasTidsrader(sokvag).filter((rad) => {
      const m = rad.match(/(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z/);
      if (!m) return false;
      const tMs = Date.parse(`${m[1]}T${m[2]}:${m[3]}:${m[4]}Z`);
      return !Number.isNaN(tMs) && Math.abs(tMs - ms) <= F;
    });
    for (const rad of trafar.slice(0, 12)) console.log(`  [${namn}] ${rad.slice(0, 190)}`);
    if (trafar.length > 12) console.log(`  [${namn}] … +${trafar.length - 12} rader till`);
  }
  // omstart-journalen (träffar inom fönstret)
  try {
    const j = JSON.parse(fs.readFileSync("/tmp/ak1a-omstart-journal.json", "utf8"));
    const senaste = Array.isArray(j.poster) ? j.poster : Array.isArray(j) ? j : [];
    for (const p of senaste) {
      const pMs = Date.parse(p.ts ?? p.tid ?? "");
      if (!Number.isNaN(pMs) && Math.abs(pMs - ms) <= F) console.log(`  [omstart-journal] ${JSON.stringify(p).slice(0, 190)}`);
    }
  } catch { /* journal saknas/annat format */ }
}
