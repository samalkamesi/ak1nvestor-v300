#!/usr/bin/env node
/** _r225-u29-armkoll.mjs — ARM:s moat-fältenheter (medel/spread) som SGE-mall. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const arm = u.find((b) => b.ticker === "ARM");
console.log("ARM moat: " + JSON.stringify(arm.moat));
console.log("ARM stabilitet: " + JSON.stringify(arm.stabilitet));
console.log("ARM aterkop: " + JSON.stringify(arm.aterkop));
console.log("ARM serier.ar: " + JSON.stringify(arm.serier.ar));
