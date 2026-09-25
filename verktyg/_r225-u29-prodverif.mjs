#!/usr/bin/env node
/** _r225-u29-prodverif.mjs — verifiera SGE.L + UK-grenstruktur i prod-trädet. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const grenar = {};
for (const b of u.filter((x) => x.land === "Storbritannien")) grenar[b.bransch] = (grenar[b.bransch] || 0) + 1;
console.log("prod-trädet: " + u.length + " bolag; SGE.L=" + u.some((b) => b.ticker === "SGE.L"));
console.log("UK-grenar: " + JSON.stringify(grenar));
const minst = Object.entries(grenar).filter(([, n]) => n < 2);
console.log(minst.length ? "1-grenar kvar: " + minst.map(([k]) => k).join(", ") : "ALLA UK-GRENAR ≥2 ✓");
