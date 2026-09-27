#!/usr/bin/env node
/** _r205-rattning.mjs — tornade granskningsrubriken återställd (torrörningens rond-parameter var felaktig: filvägen skrevs in; rond 194:s rubrik var sanningsenlig). */
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync as sp } from "node:child_process";

const FIL = "data/forskning/V172-GRANSKNING.md";
let t = readFileSync(FIL, "utf8");
const fel = "## GRANSKNINGSOMGÅNG (rond data/blogg-utkast/kvartal/2026-q3/sa-laser-du-disney-q3-2026.json, 2026-09-25";
const ratt = "## GRANSKNINGSOMGÅNG (rond 194, 2026-09-25";
if (t.includes(fel)) {
  t = t.replace(fel, ratt);
  writeFileSync(FIL, t);
  console.log("RUBRIK ÅTERSTÄLLD: rond 194 (sanningsenlig — finaldomraden under rubriken är r194:s mätning, orörd)");
} else if (t.includes(ratt)) {
  console.log("Redan korrekt");
}
const r1 = sp("git", ["add", FIL], { cwd: "/home/ak1a/agent/ak1", encoding: "utf8" });
const r2 = sp("git", ["commit", "-m", "studio: [organ:Φ] rond 205 rättning — torrörningens rond-parameter skrev filväg in i granskningsrubriken; rond 194-rubriken återställd (finaldomraden orörd; torrörningens läxa: mätarens argv[2] är RONDNUMMER, kör hälsokontroller med \"205\"-form)"], { cwd: "/home/ak1a/agent/ak1", encoding: "utf8", timeout: 240000, maxBuffer: 16 * 1024 * 1024 });
const r3 = sp("git", ["push", "prod", "develop"], { cwd: "/home/ak1a/agent/ak1", encoding: "utf8", timeout: 240000, maxBuffer: 16 * 1024 * 1024 });
console.log("commit", r2.status, "push", r3.status);
