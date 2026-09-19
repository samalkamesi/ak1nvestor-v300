#!/usr/bin/env node
// ROND 107 — juridikgrindens varningsdetaljer (prod, senaste körningen).
import fs from "node:fs";
const j = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/vakten/juridik-larm.json", "utf8"));
const nycklar = Object.keys(j);
console.log("toppnycklar:", nycklar.join(", "));
const k = j.fynd || j.senaste || j.varningar || null;
if (k) console.log(JSON.stringify(k, null, 2).slice(0, 4000));
