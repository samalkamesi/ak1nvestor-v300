#!/usr/bin/env node
/**
 * _r195-v173-adoption.mjs — sond av prod-trädets smuts (rond 188-läxan):
 * M data/rapporter/motorervalidering-2026-09-02.md — diffa prod-disk mot prod-HEAD,
 * avgör äkta appendar vs skräp, ställ adoptionsinnehåll i arbetsytan (same path).
 * Untracked-posterna i prod kolliderar EJ med denna push:s sökvägar.
 * Kvitto: /tmp/r195-adoption.txt
 */
import { spawnSync as sp } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";

const P = "/home/ak1a/AK1";
const FIL = "data/rapporter/motorervalidering-2026-09-02.md";
const ut = [];

const head = sp("git", ["-C", P, "show", `HEAD:${FIL}`], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
const disk = readFileSync(`${P}/${FIL}`, "utf8");
ut.push(`HEAD ${head.stdout.length} tecken · DISK ${disk.length} tecken · diff ${disk.length - head.stdout.length} tecken`);

const headRader = head.stdout.split("\n");
const diskRader = disk.split("\n");
ut.push(`HEAD ${headRader.length} rader · DISK ${diskRader.length} rader`);
// är HEAD ett prefix av DISK (ren append)?
const prefix = disk.startsWith(head.stdout);
ut.push("HEAD är prefix av DISK (ren append): " + prefix);
if (!prefix) {
  // hitta första avvikande raden
  let i = 0;
  while (i < Math.min(headRader.length, diskRader.length) && headRader[i] === diskRader[i]) i++;
  ut.push(`första avvikande raden ${i + 1}:`);
  ut.push("  HEAD : " + (headRader[i] ?? "<slut>").slice(0, 140));
  ut.push("  DISK : " + (diskRader[i] ?? "<slut>").slice(0, 140));
}
if (diskRader.length > headRader.length) {
  ut.push("APPEND-rader (sista 12 av tillägget):");
  diskRader.slice(headRader.length - (prefix ? 0 : 0)).slice(-12).forEach((r) => ut.push("  | " + r.slice(0, 150)));
}
// adoption: kopiera prod-diskens innehåll till arbetsytan (committas där)
copyFileSync(`${P}/${FIL}`, `/home/ak1a/agent/ak1/${FIL}`);
ut.push("ADOPTERAD till arbetsytan: " + FIL);
writeFileSync("/tmp/r195-adoption.txt", ut.join("\n"));
console.log(ut.join("\n"));
