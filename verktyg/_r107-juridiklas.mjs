#!/usr/bin/env node
// ROND 107 — läs juridikgrindens senaste körning (prod, icke-hemlig status).
import fs from "node:fs";
const j = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/vakten/juridik-larm.json", "utf8"));
console.log(JSON.stringify(j.senasteKorning, null, 2).slice(0, 3000));
