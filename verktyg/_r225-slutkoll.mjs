#!/usr/bin/env node
/** _r225-slutkoll.mjs — slutverifikation: prod:s SGE.L-rad bär rättad notering. */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const sge = u.find((b) => b.ticker === "SGE.L");
const felNotering = (sge.notering ?? "").includes("SISTA 1-GREN");
const felParanoid = (sge.kallor?.[0]?.paranoid ?? "").includes("SISTA 1-GREN");
const rattad = (sge.notering ?? "").includes("NAMNGIVNA 1-GRENAR");
console.log("prod SGE.L: felsträng notering=" + felNotering + " · paranoid=" + felParanoid + " · rättad text=" + rattad);
console.log(felNotering || felParanoid || !rattad ? "STATUS: RÄTTELSEN EJ I PROD" : "STATUS: RÄTTELSEN LIVE I PROD ✓");
