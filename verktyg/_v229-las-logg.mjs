#!/usr/bin/env node
// _v229-las-logg.mjs — läs svansen på prod-trädets prod-synk.log (node-kanalen)
import fs from "node:fs";

const fil = process.argv[2] || "/home/ak1a/AK1/data/vakten/prod-synk.log";
const n = Number(process.argv[3] || 90);
const rader = fs.readFileSync(fil, "utf8").trimEnd().split("\n");
console.log(`── ${fil} (sista ${n} av ${rader.length} rader) ──`);
console.log(rader.slice(-n).join("\n"));
